<?php
/**
 * MMPay webhook endpoint.
 *
 * MMPay POSTs transaction status updates here. We verify the HMAC signature and
 * one-time nonce via the SDK's listen(), then update the local payment + order.
 *
 * Point your MMPay Dashboard callback URL to:
 *   https://YOUR_DOMAIN/Abyss.Net/php-api/webhook_mmpay.php
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/MMPay.php';

use MMPay\MMPay;

$pdo   = get_pdo();
$mmpay = new MMPay(mmpay_options());

$rawBody   = file_get_contents('php://input');
$nonce     = $_SERVER['HTTP_X_MMPAY_NONCE']     ?? '';
$signature = $_SERVER['HTTP_X_MMPAY_SIGNATURE'] ?? '';

$updateStatus = function (array $tx, string $status) use ($pdo) {
    if (empty($tx['orderId'])) return;
    $pdo->prepare('UPDATE payments SET status = ?, transaction_ref_id = COALESCE(?, transaction_ref_id) WHERE order_id = ?')
        ->execute([$status, $tx['transactionRefId'] ?? null, $tx['orderId']]);
};

$mmpay->onTxCreate(function ($tx) use ($updateStatus) {
    $updateStatus($tx, 'PENDING');
});

$mmpay->onTxSuccess(function ($tx) use ($updateStatus, $pdo) {
    $updateStatus($tx, 'SUCCESS');
    try {
        $pdo->prepare('CALL sp_update_order_status(?, ?)')->execute([$tx['orderId'], 'processing']);
    } catch (Exception $e) { /* non-fatal */ }
});

$mmpay->onTxFail(fn($tx)    => $updateStatus($tx, 'FAILED'));
$mmpay->onTxCancel(fn($tx)  => $updateStatus($tx, 'CANCELLED'));
$mmpay->onTxExpire(fn($tx)  => $updateStatus($tx, 'EXPIRED'));
$mmpay->onTxRefund(fn($tx)  => $updateStatus($tx, 'REFUNDED'));

try {
    $mmpay->listen($rawBody, $nonce, $signature);
    json_response(['received' => true], 200);
} catch (Exception $e) {
    json_error($e->getMessage(), 400);
}
