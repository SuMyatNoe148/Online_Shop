<?php
require_once __DIR__ . '/config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

if ($method === 'GET') {
    $pdo = get_pdo();
    if ($id) {
        $stmt = $pdo->prepare('SELECT * FROM v_models_full WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('Model not found.', 404);
        $row['featured'] = (bool)$row['featured'];
        json_response(['data' => $row]);
    }
    $featured = $_GET['featured'] ?? '';
    $sql    = 'SELECT * FROM v_models_full';
    $params = [];
    if ($featured !== '') { $sql .= ' WHERE featured = ?'; $params[] = (int)$featured; }
    $sql .= ' ORDER BY created_at DESC';
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$r) $r['featured'] = (bool)$r['featured'];
    unset($r);
    json_response(['data' => $rows]);
}

json_error('Method not allowed.', 405);
