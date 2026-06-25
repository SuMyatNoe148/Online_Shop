<?php
require_once __DIR__ . '/config.php';
cors();

session_start();

if (empty($_SESSION['user_id'])) json_error('Not authenticated.', 401);

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

// GET /wishlist.php — list user's wishlist
if ($method === 'GET') {
    $pdo  = get_pdo();
    $stmt = $pdo->prepare(
        'SELECT * FROM v_wishlist_products WHERE user_id = ? ORDER BY wishlist_created_at DESC'
    );
    $stmt->execute([$userId]);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) {
        $r['images']   = json_decode($r['images'],  true) ?? [];
        $r['sizes']    = json_decode($r['sizes'],   true) ?? [];
        $r['colors']   = json_decode($r['colors'],  true) ?? [];
        $r['featured'] = (bool)$r['featured'];
    }
    unset($r);
    json_response(['data' => $rows]);
}

// POST /wishlist.php — toggle item (add or remove)
if ($method === 'POST') {
    $b = get_body();
    if (empty($b['productId'])) json_error('productId is required.');
    $pdo  = get_pdo();
    $stmt = $pdo->prepare('CALL sp_toggle_wishlist(?, ?)');
    $stmt->execute([$userId, $b['productId']]);
    $result = $stmt->fetch();
    $added = !empty($result['is_saved']);
    json_response(['data' => ['added' => $added, 'message' => $result['message'] ?? '']], 201);
}

// DELETE /wishlist.php?productId=xxx
if ($method === 'DELETE') {
    $productId = $_GET['productId'] ?? '';
    if (!$productId) json_error('productId is required.');
    $pdo = get_pdo();
    $stmt = $pdo->prepare('CALL sp_toggle_wishlist(?, ?)');
    $stmt->execute([$userId, $productId]);
    json_response(['data' => ['removed' => true]]);
}

json_error('Method not allowed.', 405);
