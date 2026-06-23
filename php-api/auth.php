<?php
require_once __DIR__ . '/config.php';
cors();

session_start();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// POST /auth.php?action=register
if ($method === 'POST' && $action === 'register') {
    $b = get_body();
    if (empty($b['name']))     json_error('Name is required.');
    if (empty($b['email']))    json_error('Email is required.');
    if (empty($b['password'])) json_error('Password is required.');
    if (strlen($b['password']) < 6) json_error('Password must be at least 6 characters.');

    $pdo  = get_pdo();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([strtolower($b['email'])]);
    if ($stmt->fetch()) json_error('Email already registered.', 409);

    $id   = 'u-' . bin2hex(random_bytes(8));
    $hash = password_hash($b['password'], PASSWORD_BCRYPT);
    $pdo->prepare(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    )->execute([$id, $b['name'], strtolower($b['email']), $hash, 'customer']);

    $_SESSION['user_id']   = $id;
    $_SESSION['user_name'] = $b['name'];
    $_SESSION['user_role'] = 'customer';

    json_response(['data' => ['id' => $id, 'name' => $b['name'], 'role' => 'customer']], 201);
}

// POST /auth.php?action=login
if ($method === 'POST' && $action === 'login') {
    $b = get_body();
    if (empty($b['email']))    json_error('Email is required.');
    if (empty($b['password'])) json_error('Password is required.');

    $pdo  = get_pdo();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([strtolower($b['email'])]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($b['password'], $user['password_hash'])) {
        json_error('Invalid email or password.', 401);
    }

    $_SESSION['user_id']   = $user['id'];
    $_SESSION['user_name'] = $user['name'];
    $_SESSION['user_role'] = $user['role'];

    json_response(['data' => [
        'id'   => $user['id'],
        'name' => $user['name'],
        'role' => $user['role'],
    ]]);
}

// POST /auth.php?action=logout
if ($method === 'POST' && $action === 'logout') {
    session_destroy();
    json_response(['data' => ['loggedOut' => true]]);
}

// GET /auth.php?action=me
if ($method === 'GET' && $action === 'me') {
    if (empty($_SESSION['user_id'])) {
        json_response(['data' => null]);
    }
    json_response(['data' => [
        'id'   => $_SESSION['user_id'],
        'name' => $_SESSION['user_name'],
        'role' => $_SESSION['user_role'],
    ]]);
}

json_error('Invalid action.', 404);
