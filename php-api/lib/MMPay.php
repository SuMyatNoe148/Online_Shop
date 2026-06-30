<?php
/**
 * MMPay — PHP client for the MMPay Payment Gateway.
 *
 * Mirrors the official SDK surface: pay(), get(), cancel(), and webhook
 * verification via listen() with HMAC-SHA256 signature + one-time nonce checks.
 *
 * When credentials are missing or `sandbox` is enabled, the SDK runs in a local
 * SANDBOX mode that generates a valid-shaped EMVCo MMQR string and simulates the
 * payment lifecycle so the full checkout flow can be demonstrated without a live
 * merchant account. Set real credentials + sandbox=false to go live.
 */

namespace MMPay;

use Exception;

class MMPay
{
    private string $appId;
    private string $publishableKey;
    private string $secretKey;
    private string $apiBaseUrl;
    private bool   $sandbox;

    /** @var array<string, callable> */
    private array $listeners = [];

    public function __construct(array $options)
    {
        $this->appId          = $options['appId']          ?? '';
        $this->publishableKey = $options['publishableKey'] ?? '';
        $this->secretKey      = $options['secretKey']      ?? '';
        $this->apiBaseUrl     = rtrim($options['apiBaseUrl'] ?? '', '/');
        // Sandbox if explicitly requested OR credentials are not configured.
        $this->sandbox = !empty($options['sandbox'])
            || $this->appId === ''
            || $this->secretKey === ''
            || $this->publishableKey === '';
    }

    public function isSandbox(): bool
    {
        return $this->sandbox;
    }

    /**
     * Create a payment. Returns the gateway response containing the EMVCo MMQR
     * string you must render as a QR image.
     */
    public function pay(array $payload): array
    {
        if (empty($payload['orderId'])) {
            throw new Exception('orderId is required.');
        }
        if (!isset($payload['amount']) || !is_numeric($payload['amount'])) {
            throw new Exception('amount is required and must be numeric.');
        }

        if ($this->sandbox) {
            return $this->sandboxPay($payload);
        }

        return $this->httpRequest('POST', '/v1/payments', $payload);
    }

    /** Retrieve a payment and its MMQR-related events. */
    public function get(array $payload): array
    {
        if (empty($payload['orderId'])) {
            throw new Exception('orderId is required.');
        }

        if ($this->sandbox) {
            // In sandbox the caller (payment.php) owns state; nothing to fetch.
            return ['orderId' => $payload['orderId'], 'status' => 'PENDING'];
        }

        return $this->httpRequest('GET', '/v1/payments/' . rawurlencode($payload['orderId']), null);
    }

    /** Cancel a payment and all of its MMQR instances. */
    public function cancel(array $payload): array
    {
        if (empty($payload['orderId'])) {
            throw new Exception('orderId is required.');
        }

        if ($this->sandbox) {
            return [
                'amount'        => $payload['amount'] ?? 0,
                'orderId'       => $payload['orderId'],
                'status'        => 'CANCELLED',
                'vendorQrRefId' => $payload['vendorQrRefId'] ?? '',
            ];
        }

        return $this->httpRequest('POST', '/v1/payments/' . rawurlencode($payload['orderId']) . '/cancel', $payload);
    }

    // ---- Webhook event listeners ------------------------------------------

    public function onTxCreate(callable $cb): void  { $this->listeners['PENDING']   = $cb; }
    public function onTxSuccess(callable $cb): void { $this->listeners['SUCCESS']   = $cb; }
    public function onTxFail(callable $cb): void    { $this->listeners['FAILED']    = $cb; }
    public function onTxCancel(callable $cb): void  { $this->listeners['CANCELLED'] = $cb; }
    public function onTxExpire(callable $cb): void  { $this->listeners['EXPIRED']   = $cb; }
    public function onTxRefund(callable $cb): void  { $this->listeners['REFUNDED']  = $cb; }
    public function onHeartbeat(callable $cb): void { $this->listeners['HEARTBEAT'] = $cb; }

    /**
     * Verify an incoming webhook (signature + nonce) and dispatch the event.
     *
     * @param string $rawBody   The raw request body.
     * @param string $nonce     X-Mmpay-Nonce header.
     * @param string $signature X-Mmpay-Signature header.
     */
    public function listen(string $rawBody, string $nonce, string $signature): array
    {
        if ($nonce === '') {
            throw new Exception('BA001: nonce token missing.');
        }
        if (!$this->sandbox) {
            $expected = $this->sign($rawBody . '.' . $nonce);
            if (!hash_equals($expected, $signature)) {
                throw new Exception('KA0003: Signature mismatch.');
            }
        }

        $tx = json_decode($rawBody, true);
        if (!is_array($tx)) {
            throw new Exception('Invalid webhook body.');
        }

        // Replay protection: reject a nonce we have already processed.
        if ($this->nonceSeen($nonce)) {
            if (isset($this->listeners['HEARTBEAT'])) {
                ($this->listeners['HEARTBEAT'])($tx);
            }
            return $tx;
        }
        $this->rememberNonce($nonce);

        $status = strtoupper($tx['status'] ?? '');
        if (isset($this->listeners[$status])) {
            ($this->listeners[$status])($tx);
        }
        return $tx;
    }

    // ---- Signing helpers ---------------------------------------------------

    /** HMAC-SHA256 signature used for request signing and webhook verification. */
    public function sign(string $data): string
    {
        return hash_hmac('sha256', $data, $this->secretKey);
    }

    private function handshakeNonce(): string
    {
        return bin2hex(random_bytes(16));
    }

    // ---- HTTP transport (live mode) ----------------------------------------

    private function httpRequest(string $method, string $path, ?array $body): array
    {
        if ($this->apiBaseUrl === '') {
            throw new Exception('503: apiBaseUrl is not configured.');
        }

        $url     = $this->apiBaseUrl . $path;
        $nonce   = $this->handshakeNonce();
        $payload = $body !== null ? json_encode($body) : '';
        $sig     = $this->sign($payload . '.' . $nonce);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CUSTOMREQUEST  => $method,
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_HTTPHEADER     => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->publishableKey,
                'X-Mmpay-App-Id: ' . $this->appId,
                'X-Mmpay-Nonce: ' . $nonce,
                'X-Mmpay-Signature: ' . $sig,
            ],
        ]);
        if ($payload !== '') {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        }

        $res  = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $err  = curl_error($ch);
        curl_close($ch);

        if ($res === false) {
            throw new Exception('503: Upstream payment API unreachable. ' . $err);
        }
        $data = json_decode($res, true);
        if ($code >= 400) {
            $msg = $data['message'] ?? $data['error'] ?? ('Gateway error ' . $code);
            throw new Exception($msg, $code);
        }
        return is_array($data) ? $data : [];
    }

    // ---- Sandbox simulation ------------------------------------------------

    private function sandboxPay(array $payload): array
    {
        $ref = (string) random_int(100000000000, 999999999999);
        $amount   = (float) $payload['amount'];
        $currency = $payload['currency'] ?? 'MMK';

        return [
            'orderId'          => $payload['orderId'],
            'status'           => 'PENDING',
            'vendorQrRefId'    => $ref,
            'transactionRefId' => $ref,
            'amount'           => $amount,
            'currency'         => $currency,
            'qr'               => $this->buildEmvcoMMQR($amount, $currency, $ref),
            'sandbox'          => true,
        ];
    }

    /**
     * Build an EMVCo-compliant MMQR payload string (TLV format with CRC16).
     * This is a structurally valid static-ish QR used for the sandbox demo.
     */
    private function buildEmvcoMMQR(float $amount, string $currency, string $ref): string
    {
        $tlv = fn(string $id, string $val): string =>
            $id . str_pad((string) strlen($val), 2, '0', STR_PAD_LEFT) . $val;

        $currencyCode = $currency === 'MMK' ? '104' : '840';

        $merchantAccount = $tlv('00', 'mm.com.mmpay')
            . $tlv('01', $this->appId !== '' ? $this->appId : ('ABYSS' . substr($ref, 0, 6)));

        $payload  = $tlv('00', '01');                       // Payload format indicator
        $payload .= $tlv('01', '11');                       // Static QR
        $payload .= $tlv('26', $merchantAccount);           // Merchant account info (MMQR)
        $payload .= $tlv('52', '5651');                     // Merchant category code
        $payload .= $tlv('53', $currencyCode);              // Transaction currency
        $payload .= $tlv('54', number_format($amount, 2, '.', '')); // Amount
        $payload .= $tlv('58', 'MM');                       // Country code
        $payload .= $tlv('59', 'ABYSS');                    // Merchant name
        $payload .= $tlv('60', 'YANGON');                   // Merchant city
        $payload .= $tlv('62', $tlv('05', $ref));           // Additional data (bill ref)

        $payload .= '6304';                                 // CRC tag + length
        $payload .= strtoupper($this->crc16($payload));
        return $payload;
    }

    /** CRC-16/CCITT-FALSE checksum (EMVCo QR standard). */
    private function crc16(string $data): string
    {
        $crc = 0xFFFF;
        for ($i = 0, $n = strlen($data); $i < $n; $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                $crc = ($crc & 0x8000) ? (($crc << 1) ^ 0x1021) : ($crc << 1);
                $crc &= 0xFFFF;
            }
        }
        return str_pad(dechex($crc), 4, '0', STR_PAD_LEFT);
    }

    // ---- Nonce replay store (file-based, good enough for single host) ------

    private function nonceFile(): string
    {
        return sys_get_temp_dir() . '/mmpay_nonces.json';
    }

    private function nonceSeen(string $nonce): bool
    {
        $file = $this->nonceFile();
        if (!is_file($file)) return false;
        $seen = json_decode((string) file_get_contents($file), true) ?: [];
        return in_array($nonce, $seen, true);
    }

    private function rememberNonce(string $nonce): void
    {
        $file = $this->nonceFile();
        $seen = is_file($file) ? (json_decode((string) file_get_contents($file), true) ?: []) : [];
        $seen[] = $nonce;
        if (count($seen) > 500) $seen = array_slice($seen, -500);
        @file_put_contents($file, json_encode($seen));
    }
}
