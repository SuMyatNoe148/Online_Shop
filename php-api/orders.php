<?php
require_once __DIR__ . '/config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

// GET /orders.php  or  /orders.php?id=xxx
if ($method === 'GET') {
    $pdo = get_pdo();
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM v_orders_summary WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Order not found.', 404);
        $row['items'] = json_decode($row['items'], true);
        json_response(['data' => $row]);
    }
    $rows = $pdo->query('SELECT * FROM v_orders_summary ORDER BY created_at DESC')->fetchAll();
    foreach ($rows as &$r) $r['items'] = json_decode($r['items'], true);
    unset($r);
    json_response(['data' => $rows]);
}

// POST /orders.php  — place order
if ($method === 'POST') {
    $b = get_body();
    $required = ['customerName','email','address','items'];
    foreach ($required as $f) {
        if (empty($b[$f])) json_error("Field '$f' is required.");
    }
    if (!is_array($b['items']) || count($b['items']) === 0) {
        json_error('Order must contain at least one item.');
    }

    $pdo   = get_pdo();
    $total = 0;
    $currency = 'MMK';

    // Enrich items with server-authoritative unitPrice and calculate total
    foreach ($b['items'] as &$item) {
        if (empty($item['productId']) || empty($item['quantity'])) {
            json_error('Each item needs productId and quantity.');
        }
        $stmt = $pdo->prepare('SELECT price, currency FROM products WHERE id = ?');
        $stmt->execute([$item['productId']]);
        $product = $stmt->fetch();
        if (!$product) json_error("Product '{$item['productId']}' not found.", 404);
        $item['unitPrice'] = (int)$product['price'];
        $item['name']      = $product['name'] ?? 'Unknown';
        $currency = $product['currency'];
        $total += $item['unitPrice'] * (int)$item['quantity'];
    }
    unset($item);

    $orderId = 'ord-' . bin2hex(random_bytes(8));

    $stmt = $pdo->prepare('CALL sp_create_order(?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $orderId,
        $b['customerName'],
        $b['email'],
        $b['address'],
        json_encode($b['items']),
        $currency,
    ]);
    $result = $stmt->fetch();

    if (!$result || empty($result['success'])) {
        json_error('Failed to create order.', 500);
    }

    json_response(['data' => ['id' => $orderId, 'total' => $total, 'currency' => $currency]], 201);
}

// PATCH /orders.php?id=xxx  — update status
if ($method === 'PATCH') {
    if (!$id) json_error('id is required.');
    $b      = get_body();
    $status = $b['status'] ?? '';
    $allowed = ['pending','processing','shipped','delivered','cancelled'];
    if (!in_array($status, $allowed)) json_error('Invalid status.');
    $pdo = get_pdo();
    $stmt = $pdo->prepare('CALL sp_update_order_status(?, ?)');
    $stmt->execute([$id, $status]);
    $result = $stmt->fetch();
    if (!$result || empty($result['success'])) json_error($result['message'] ?? 'Update failed.', 404);
    json_response(['data' => ['updated' => true]]);
}

json_error('Method not allowed.', 405);
