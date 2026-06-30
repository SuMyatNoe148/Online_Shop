<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Auth.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

// GET /orders.php  or  /orders.php?id=xxx
if ($method === 'GET') {
    $pdo = get_pdo();
    if ($id) {
        // Any authenticated user can fetch a specific order (ownership checked below).
        $user = require_auth();
        $stmt = $pdo->prepare('SELECT * FROM v_orders_summary WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Order not found.', 404);
        // Non-admins can only view their own orders.
        if (($user['role'] ?? '') !== 'admin' && strtolower($row['email'] ?? '') !== strtolower($user['email'] ?? '')) {
            json_error('You do not have permission to view this order.', 403);
        }
        $row['items'] = json_decode($row['items'], true);
        json_response(['data' => $row]);
    }
    $email = $_GET['email'] ?? null;
    if ($email) {
        // Authenticated users can fetch their own orders by email.
        $user = require_auth();
        if (($user['role'] ?? '') !== 'admin' && strtolower($email) !== strtolower($user['email'] ?? '')) {
            json_error('You can only view your own orders.', 403);
        }
        $stmt = $pdo->prepare('SELECT * FROM v_orders_summary WHERE email = ? ORDER BY created_at DESC');
        $stmt->execute([strtolower($email)]);
        $rows = $stmt->fetchAll();
    } else {
        // Listing all orders is admin-only.
        require_admin();
        $rows = $pdo->query('SELECT * FROM v_orders_summary ORDER BY created_at DESC')->fetchAll();
    }
    foreach ($rows as &$r) $r['items'] = json_decode($r['items'], true);
    unset($r);
    json_response(['data' => $rows]);
}

// POST /orders.php  — place order (authenticated users only)
if ($method === 'POST') {
    require_auth();
    $b = get_body();
    $required = ['customerName','email','address','items'];
    foreach ($required as $f) {
        if (empty($b[$f])) json_error("Field '$f' is required.");
    }
    if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) {
        json_error('Please provide a valid email address.');
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
        $stmt = $pdo->prepare('SELECT name, price, currency, images, stock FROM products WHERE id = ?');
        $stmt->execute([$item['productId']]);
        $product = $stmt->fetch();
        if (!$product) json_error("Product '{$item['productId']}' not found.", 404);

        // Stock validation — prevent overselling
        $qty = (int) $item['quantity'];
        if ((int) $product['stock'] < $qty) {
            json_error("Insufficient stock for '{$product['name']}'. Available: {$product['stock']}, requested: {$qty}.", 409);
        }

        $item['unitPrice'] = (int)$product['price'];
        $item['name']      = $product['name'];
        $item['image']     = json_decode($product['images'] ?? '[]', true)[0] ?? null;
        $currency = $product['currency'];
        $total += $item['unitPrice'] * $qty;
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
    $stmt->closeCursor();

    if (!$result || empty($result['success'])) {
        json_error('Failed to create order.', 500);
    }

    // Decrement stock for each purchased item
    foreach ($b['items'] as $item) {
        $pdo->prepare('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?')
            ->execute([(int) $item['quantity'], $item['productId'], (int) $item['quantity']]);
    }

    json_response(['data' => ['id' => $orderId, 'total' => $total, 'currency' => $currency]], 201);
}

// PATCH /orders.php?id=xxx  — update status (admin only)
if ($method === 'PATCH') {
    require_admin();
    if (!$id) json_error('id is required.');
    $b      = get_body();
    $status = $b['status'] ?? '';
    $allowed = ['pending','processing','shipped','delivered','cancelled'];
    if (!in_array($status, $allowed)) json_error('Invalid status.');
    $pdo = get_pdo();

    // If cancelling, restore stock for all items in the order.
    if ($status === 'cancelled') {
        $stmt = $pdo->prepare('SELECT items FROM orders WHERE id = ?');
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        $stmt->closeCursor();
        if ($order) {
            $items = json_decode($order['items'], true) ?: [];
            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 0);
                $pid = $item['productId'] ?? '';
                if ($qty > 0 && $pid) {
                    $pdo->prepare('UPDATE products SET stock = stock + ? WHERE id = ?')
                        ->execute([$qty, $pid]);
                }
            }
        }
    }

    $stmt = $pdo->prepare('CALL sp_update_order_status(?, ?)');
    $stmt->execute([$id, $status]);
    $result = $stmt->fetch();
    if (!$result || empty($result['success'])) json_error($result['message'] ?? 'Update failed.', 404);
    json_response(['data' => ['updated' => true]]);
}

json_error('Method not allowed.', 405);
