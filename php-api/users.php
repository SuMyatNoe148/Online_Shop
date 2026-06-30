<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Auth.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id'] ?? null;

// GET /users.php  or  /users.php?id=xxx  (admin only)
if ($method === 'GET') {
    require_admin();
    $pdo = get_pdo();
    if ($id) {
        $stmt = $pdo->prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_error('User not found.', 404);
        json_response(['data' => $row]);
    }
    $rows = $pdo->query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC')->fetchAll();
    json_response(['data' => $rows]);
}

// PATCH /users.php?id=xxx  — update role (admin only)
if ($method === 'PATCH') {
    require_admin();
    if (!$id) json_error('id is required.');
    $b      = get_body();
    $role   = $b['role'] ?? '';
    $allowed = ['customer', 'admin'];
    if (!in_array($role, $allowed)) json_error('Invalid role. Must be "customer" or "admin".');
    $pdo = get_pdo();
    $stmt = $pdo->prepare('UPDATE users SET role = ? WHERE id = ?');
    $stmt->execute([$role, $id]);
    if ($stmt->rowCount() === 0) json_error('User not found.', 404);
    json_response(['data' => ['updated' => true, 'role' => $role]]);
}

// DELETE /users.php?id=xxx  — delete user (admin only)
if ($method === 'DELETE') {
    require_admin();
    $admin = current_user();
    if (!$id) json_error('id is required.');
    if ($id === $admin['sub']) json_error('You cannot delete your own account.', 400);
    $pdo = get_pdo();
    $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) json_error('User not found.', 404);
    json_response(['data' => ['deleted' => true]]);
}

json_error('Method not allowed.', 405);
