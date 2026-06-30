<?php
require_once __DIR__ . '/env.php';

// ---- Database connection (read from .env, with safe local defaults) ---------
define('DB_HOST',    env('DB_HOST', 'localhost'));
define('DB_NAME',    env('DB_NAME', 'abyss'));
define('DB_USER',    env('DB_USER', 'abyss_user'));
define('DB_PASS',    env('DB_PASS', 'abyss2024'));
define('DB_CHARSET', env('DB_CHARSET', 'utf8mb4'));

// ---- MMPay payment gateway credentials --------------------------------------
// Leave these blank to run in local SANDBOX mode (generates a demo MMQR and
// simulates payment success). Fill them in from your MMPay Dashboard to go live.
define('MMPAY_APP_ID',          env('MMPAY_APP_ID', ''));
define('MMPAY_PUBLISHABLE_KEY', env('MMPAY_PUBLISHABLE_KEY', ''));
define('MMPAY_SECRET_KEY',      env('MMPAY_SECRET_KEY', ''));
define('MMPAY_API_BASE_URL',    env('MMPAY_API_BASE_URL', 'https://api.myanmyanpay.com'));
// Seconds the sandbox waits before auto-confirming a payment (demo only).
define('MMPAY_SANDBOX_CONFIRM_SECONDS', (int) env('MMPAY_SANDBOX_CONFIRM_SECONDS', '8'));

function mmpay_options(): array {
    return [
        'appId'          => MMPAY_APP_ID,
        'publishableKey' => MMPAY_PUBLISHABLE_KEY,
        'secretKey'      => MMPAY_SECRET_KEY,
        'apiBaseUrl'     => MMPAY_API_BASE_URL,
    ];
}

function get_pdo(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=' . DB_CHARSET;
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
    }
    return $pdo;
}

function json_response(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function json_error(string $message, int $status = 400): void {
    json_response(['error' => $message], $status);
}

function get_body(): array {
    $raw = file_get_contents('php://input');
    if (strlen($raw) > 1048576) {
        json_error('Request body too large (max 1MB).', 413);
    }
    return json_decode($raw, true) ?? [];
}

function cors(): void {
    // Comma-separated allowlist from env; "*" allows any origin (dev default).
    $allowed = array_filter(array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*'))));
    $origin  = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array('*', $allowed, true)) {
        header('Access-Control-Allow-Origin: *');
    } elseif ($origin && in_array($origin, $allowed, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Vary: Origin');
    }

    header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

/**
 * Simple file-based rate limiter. Returns false if the caller has exceeded
 * $maxAttempts within $windowSeconds for the given $key (e.g. "login:<ip>").
 */
function rate_limit(string $key, int $maxAttempts = 5, int $windowSeconds = 300): bool {
    $dir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'abyss_ratelimit';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $file = $dir . DIRECTORY_SEPARATOR . sha1($key) . '.json';

    $now     = time();
    $entries = [];
    if (is_file($file)) {
        $entries = json_decode((string) @file_get_contents($file), true) ?: [];
    }
    // Drop timestamps outside the window.
    $entries = array_values(array_filter($entries, fn($ts) => ($now - (int) $ts) < $windowSeconds));

    if (count($entries) >= $maxAttempts) {
        return false;
    }
    $entries[] = $now;
    @file_put_contents($file, json_encode($entries), LOCK_EX);
    return true;
}

function client_ip(): string {
    // Prefer REMOTE_ADDR (set by the web server, not spoofable by clients).
    // Only fall back to X-Forwarded-For if REMOTE_ADDR is empty (e.g. CLI).
    $remote = $_SERVER['REMOTE_ADDR'] ?? '';
    if ($remote) return $remote;

    $forwarded = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '';
    if ($forwarded) {
        // Take only the first IP in the chain.
        return trim(explode(',', $forwarded)[0]);
    }
    return 'unknown';
}
