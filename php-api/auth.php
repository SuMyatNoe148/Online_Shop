<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Auth.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// POST /auth.php?action=register
if ($method === 'POST' && $action === 'register') {
    // Rate limit registration by IP to prevent automated account creation.
    $rlKey = 'register:' . client_ip();
    if (!rate_limit($rlKey, 3, 3600)) {
        json_error('Too many registration attempts. Please try again later.', 429);
    }

    $b = get_body();
    if (empty($b['name']))     json_error('Name is required.');
    if (empty($b['email']))    json_error('Email is required.');
    if (empty($b['password'])) json_error('Password is required.');
    if (strlen($b['password']) < 6) json_error('Password must be at least 6 characters.');
    if (!filter_var($b['email'], FILTER_VALIDATE_EMAIL)) json_error('Please enter a valid email address.');
    if (mb_strlen($b['name']) > 120) json_error('Name is too long (max 120 characters).');

    $pdo  = get_pdo();
    $id   = 'u-' . bin2hex(random_bytes(8));
    $hash = password_hash($b['password'], PASSWORD_BCRYPT);
    $email = strtolower(trim($b['email']));
    $name = trim($b['name']);

    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_error('Email already registered.', 409);
    }

    // Direct insert to match login query
    $stmt = $pdo->prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$id, $name, $email, $hash, 'customer']);

    $userData = ['id' => $id, 'name' => $name, 'email' => $email, 'role' => 'customer'];
    $userData['token'] = issue_token($userData);

    json_response(['data' => $userData], 201);
}

// POST /auth.php?action=login
if ($method === 'POST' && $action === 'login') {
    // Rate limit by IP + email to slow brute-force attacks.
    $b = get_body();
    $rlKey = 'login:' . client_ip() . ':' . strtolower($b['email'] ?? '');
    if (!rate_limit($rlKey, 5, 300)) {
        json_error('Too many login attempts. Please try again in a few minutes.', 429);
    }

    if (empty($b['email']))    json_error('Email is required.');
    if (empty($b['password'])) json_error('Password is required.');

    $pdo  = get_pdo();
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([strtolower($b['email'])]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($b['password'], $user['password_hash'])) {
        json_error('Invalid email or password.', 401);
    }

    $userData = [
        'id'    => $user['id'],
        'name'  => $user['name'],
        'email' => $user['email'],
        'role'  => $user['role'],
    ];
    $userData['token'] = issue_token($userData);

    json_response(['data' => $userData]);
}

// POST /auth.php?action=logout
if ($method === 'POST' && $action === 'logout') {
    // Stateless tokens: the client simply discards the token. Nothing to do server-side.
    json_response(['data' => ['loggedOut' => true]]);
}

// GET /auth.php?action=me  — validate the bearer token and return the user.
if ($method === 'GET' && $action === 'me') {
    $payload = current_user();
    if (!$payload) {
        json_response(['data' => null]);
    }
    json_response(['data' => [
        'id'    => $payload['sub'],
        'name'  => $payload['name']  ?? null,
        'email' => $payload['email'] ?? null,
        'role'  => $payload['role'],
    ]]);
}

// POST /auth.php?action=change_password  — change password (authenticated)
if ($method === 'POST' && $action === 'change_password') {
    $user = require_auth();
    $b = get_body();
    if (empty($b['currentPassword'])) json_error('Current password is required.');
    if (empty($b['newPassword']))     json_error('New password is required.');
    if (strlen($b['newPassword']) < 6) json_error('New password must be at least 6 characters.');

    $pdo  = get_pdo();
    $stmt = $pdo->prepare('SELECT password_hash FROM users WHERE id = ?');
    $stmt->execute([$user['sub']]);
    $row = $stmt->fetch();
    if (!$row || !password_verify($b['currentPassword'], $row['password_hash'])) {
        json_error('Current password is incorrect.', 401);
    }

    $hash = password_hash($b['newPassword'], PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['sub']]);
    json_response(['data' => ['updated' => true]]);
}

// POST /auth.php?action=reset_password  — reset password with email + token
if ($method === 'POST' && $action === 'reset_password') {
    $b = get_body();
    if (empty($b['email']))        json_error('Email is required.');
    if (empty($b['token']))        json_error('Reset token is required.');
    if (empty($b['newPassword']))  json_error('New password is required.');
    if (strlen($b['newPassword']) < 6) json_error('Password must be at least 6 characters.');

    // Verify the reset token (HMAC-signed, issued by request_reset above)
    $payload = verify_token($b['token']);
    if (!$payload || ($payload['type'] ?? '') !== 'password_reset') {
        json_error('Invalid or expired reset token.', 400);
    }

    $pdo  = get_pdo();
    $email = strtolower($b['email']);
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    if (!$user) json_error('User not found.', 404);

    // Verify token email matches
    if (strtolower($payload['email'] ?? '') !== $email) {
        json_error('Token does not match this email.', 400);
    }

    $hash = password_hash($b['newPassword'], PASSWORD_BCRYPT);
    $pdo->prepare('UPDATE users SET password_hash = ? WHERE id = ?')->execute([$hash, $user['id']]);
    json_response(['data' => ['reset' => true]]);
}

// POST /auth.php?action=request_reset  — request a password reset (simulated email)
if ($method === 'POST' && $action === 'request_reset') {
    $b = get_body();
    if (empty($b['email'])) json_error('Email is required.');

    $pdo  = get_pdo();
    $email = strtolower($b['email']);
    $stmt = $pdo->prepare('SELECT id, name FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    // Always return success to avoid user enumeration
    if ($user) {
        $resetToken = issue_token([
            'id'    => $user['id'],
            'email' => $email,
            'type'  => 'password_reset',
            'role'  => 'customer',
        ], 900); // 15-minute expiry
        // In production: send $resetToken via email. For dev, return it.
        json_response(['data' => ['sent' => true, 'devToken' => $resetToken]]);
    }
    json_response(['data' => ['sent' => true]]);
}

json_error('Invalid action.', 404);
