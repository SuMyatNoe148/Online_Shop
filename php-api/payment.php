<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Auth.php';
require_once __DIR__ . '/lib/MMPay.php';
cors();

use MMPay\MMPay;

/** Ensure the payments table exists (idempotent, no reinstall needed). */
function ensure_payments_table(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS payments (
            order_id           VARCHAR(64)  PRIMARY KEY,
            transaction_ref_id VARCHAR(128),
            vendor_qr_ref_id   VARCHAR(128),
            amount             INT          NOT NULL,
            currency           VARCHAR(8)   NOT NULL DEFAULT 'MMK',
            method             VARCHAR(16)  NOT NULL DEFAULT 'QR',
            status             ENUM('PENDING','SUCCESS','FAILED','REFUNDED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING',
            qr                 TEXT,
            created_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    ");
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$pdo    = get_pdo();
ensure_payments_table($pdo);
$mmpay  = new MMPay(mmpay_options());

// POST /payment.php?action=create  — create a QR payment for an order
if ($method === 'POST' && $action === 'create') {
    $authUser = require_auth();
    $b = get_body();
    if (empty($b['orderId'])) json_error('orderId is required.');

    // Authoritative amount/currency come from the order in the database.
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
    $stmt->execute([$b['orderId']]);
    $order = $stmt->fetch();
    if (!$order) json_error('Order not found.', 404);

    // Ownership check: non-admins can only pay for their own orders.
    if (($authUser['role'] ?? '') !== 'admin' && strtolower($order['email'] ?? '') !== strtolower($authUser['email'] ?? '')) {
        json_error('You can only pay for your own orders.', 403);
    }

    // Stored total is in minor units (cents); MMK is shown without subunits.
    $amount   = (int) round(((int) $order['total']) / 100);
    $currency = $order['currency'] ?? 'MMK';
    $items    = json_decode($order['items'], true) ?: [];

    $lineItems = array_map(fn($it) => [
        'name'     => $it['name'] ?? 'Item',
        'amount'   => (int) round(((int) ($it['unitPrice'] ?? 0)) / 100),
        'quantity' => (int) ($it['quantity'] ?? 1),
    ], $items);

    try {
        $resp = $mmpay->pay([
            'orderId'       => $b['orderId'],
            'amount'        => $amount,
            'currency'      => $currency,
            'callbackUrl'   => $b['callbackUrl'] ?? '',
            'customMessage' => 'Thank you for shopping with ABYSS!',
            'items'         => $lineItems,
        ]);
    } catch (Exception $e) {
        json_error('Payment initiation failed: ' . $e->getMessage(), 503);
    }

    $stmt = $pdo->prepare("
        INSERT INTO payments (order_id, transaction_ref_id, vendor_qr_ref_id, amount, currency, method, status, qr)
        VALUES (?, ?, ?, ?, ?, 'QR', 'PENDING', ?)
        ON DUPLICATE KEY UPDATE
            transaction_ref_id = VALUES(transaction_ref_id),
            vendor_qr_ref_id   = VALUES(vendor_qr_ref_id),
            amount             = VALUES(amount),
            currency           = VALUES(currency),
            status             = 'PENDING',
            qr                 = VALUES(qr),
            created_at         = CURRENT_TIMESTAMP
    ");
    $stmt->execute([
        $b['orderId'],
        $resp['transactionRefId'] ?? null,
        $resp['vendorQrRefId'] ?? null,
        $amount,
        $currency,
        $resp['qr'] ?? null,
    ]);

    json_response(['data' => [
        'orderId'       => $b['orderId'],
        'status'        => $resp['status'] ?? 'PENDING',
        'amount'        => $amount,
        'currency'      => $currency,
        'qr'            => $resp['qr'] ?? null,
        'vendorQrRefId' => $resp['vendorQrRefId'] ?? null,
        'sandbox'       => $mmpay->isSandbox(),
    ]], 201);
}

// GET /payment.php?action=status&orderId=xxx  — poll payment status
if ($method === 'GET' && $action === 'status') {
    $authUser = require_auth();
    $orderId = $_GET['orderId'] ?? '';
    if ($orderId === '') json_error('orderId is required.');

    $stmt = $pdo->prepare('SELECT p.*, o.email AS order_email FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.order_id = ?');
    $stmt->execute([$orderId]);
    $pay = $stmt->fetch();
    if (!$pay) json_error('Payment not found.', 404);

    // Ownership check: non-admins can only view their own payments.
    if (($authUser['role'] ?? '') !== 'admin' && strtolower($pay['order_email'] ?? '') !== strtolower($authUser['email'] ?? '')) {
        json_error('You can only view your own payments.', 403);
    }

    $status = $pay['status'];

    // SANDBOX: auto-confirm after the configured delay to simulate a real scan.
    if ($mmpay->isSandbox() && $status === 'PENDING') {
        $elapsed = time() - strtotime($pay['created_at']);
        if ($elapsed >= MMPAY_SANDBOX_CONFIRM_SECONDS) {
            $status = 'SUCCESS';
            $pdo->prepare("UPDATE payments SET status = 'SUCCESS' WHERE order_id = ?")->execute([$orderId]);
            // Move the order forward once paid.
            try {
                $pdo->prepare('CALL sp_update_order_status(?, ?)')->execute([$orderId, 'processing']);
            } catch (Exception $e) { /* non-fatal */ }
        }
    } elseif (!$mmpay->isSandbox()) {
        // LIVE: ask the gateway for the source of truth.
        try {
            $remote = $mmpay->get(['orderId' => $orderId]);
            if (!empty($remote['status'])) {
                $status = strtoupper($remote['status']);
                $pdo->prepare('UPDATE payments SET status = ? WHERE order_id = ?')->execute([$status, $orderId]);
                if ($status === 'SUCCESS') {
                    $pdo->prepare('CALL sp_update_order_status(?, ?)')->execute([$orderId, 'processing']);
                }
            }
        } catch (Exception $e) { /* keep last known status */ }
    }

    json_response(['data' => [
        'orderId'       => $orderId,
        'status'        => $status,
        'amount'        => (int) $pay['amount'],
        'currency'      => $pay['currency'],
        'qr'            => $pay['qr'],
        'vendorQrRefId' => $pay['vendor_qr_ref_id'],
    ]]);
}

// POST /payment.php?action=cancel  — cancel a payment
if ($method === 'POST' && $action === 'cancel') {
    $authUser = require_auth();
    $b = get_body();
    if (empty($b['orderId'])) json_error('orderId is required.');

    $stmt = $pdo->prepare('SELECT p.*, o.email AS order_email FROM payments p LEFT JOIN orders o ON o.id = p.order_id WHERE p.order_id = ?');
    $stmt->execute([$b['orderId']]);
    $pay = $stmt->fetch();
    if (!$pay) json_error('Payment not found.', 404);

    // Ownership check: non-admins can only cancel their own payments.
    if (($authUser['role'] ?? '') !== 'admin' && strtolower($pay['order_email'] ?? '') !== strtolower($authUser['email'] ?? '')) {
        json_error('You can only cancel your own payments.', 403);
    }

    try {
        $mmpay->cancel([
            'orderId'       => $b['orderId'],
            'amount'        => (int) $pay['amount'],
            'vendorQrRefId' => $pay['vendor_qr_ref_id'],
        ]);
    } catch (Exception $e) { /* still mark locally */ }

    $pdo->prepare("UPDATE payments SET status = 'CANCELLED' WHERE order_id = ?")->execute([$b['orderId']]);
    json_response(['data' => ['orderId' => $b['orderId'], 'status' => 'CANCELLED']]);
}

json_error('Invalid action.', 404);
