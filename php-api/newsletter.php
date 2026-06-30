<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Auth.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];

// POST /newsletter.php — subscribe an email
if ($method === 'POST') {
    $b = get_body();
    $email = trim($b['email'] ?? '');

    if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        json_error('Please provide a valid email address.');
    }

    $email = strtolower($email);
    $pdo = get_pdo();

    // Check if already subscribed
    $stmt = $pdo->prepare('SELECT id FROM subscribers WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        json_response(['data' => ['already_subscribed' => true, 'message' => 'You are already on the list.']]);
    }

    $stmt = $pdo->prepare('INSERT INTO subscribers (email) VALUES (?)');
    $stmt->execute([$email]);
    json_response(['data' => ['subscribed' => true, 'message' => 'Thanks — you are on the list.']], 201);
}

// GET /newsletter.php — list subscribers (admin only)
if ($method === 'GET') {
    require_admin();
    $pdo = get_pdo();
    $rows = $pdo->query('SELECT id, email, created_at FROM subscribers ORDER BY created_at DESC')->fetchAll();
    json_response(['data' => $rows]);
}

json_error('Method not allowed.', 405);
