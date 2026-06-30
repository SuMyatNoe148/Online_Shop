<?php
/**
 * Auth — stateless token issuing + verification for the ABYSS API.
 *
 * Tokens are compact, signed (HMAC-SHA256) JWT-style strings:
 *   base64url(header).base64url(payload).base64url(signature)
 *
 * No server-side session store is required: the signature guarantees the
 * payload (user id + role + expiry) has not been tampered with. The signing
 * secret comes from AUTH_SECRET in .env.
 */

function auth_secret(): string {
    $secret = env('AUTH_SECRET', '');
    if (!$secret) {
        // Stable per-install fallback so tokens survive restarts even if the
        // operator forgot to set AUTH_SECRET. Strongly recommend setting it.
        $secret = 'abyss-dev-' . (env('DB_NAME', 'abyss')) . '-insecure-change-me';
    }
    return $secret;
}

function b64url_encode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

/**
 * Issue a signed token for a user.
 * @param array{id:string,role:string,name?:string,email?:string} $user
 */
function issue_token(array $user, int $ttlSeconds = 604800): string {
    $header  = ['alg' => 'HS256', 'typ' => 'JWT'];
    $now     = time();
    $payload = [
        'sub'   => $user['id'],
        'role'  => $user['role'],
        'name'  => $user['name']  ?? null,
        'email' => $user['email'] ?? null,
        'iat'   => $now,
        'exp'   => $now + $ttlSeconds,
    ];

    $segments = [
        b64url_encode(json_encode($header)),
        b64url_encode(json_encode($payload)),
    ];
    $signingInput = implode('.', $segments);
    $signature    = hash_hmac('sha256', $signingInput, auth_secret(), true);
    $segments[]   = b64url_encode($signature);

    return implode('.', $segments);
}

/**
 * Verify a token. Returns the payload array on success, or null on failure.
 */
function verify_token(?string $token): ?array {
    if (!$token) return null;
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$h, $p, $s] = $parts;
    $signingInput = $h . '.' . $p;
    $expected = hash_hmac('sha256', $signingInput, auth_secret(), true);
    $provided = b64url_decode($s);

    if (!hash_equals($expected, $provided)) return null;

    $payload = json_decode(b64url_decode($p), true);
    if (!is_array($payload)) return null;
    if (!empty($payload['exp']) && time() > (int) $payload['exp']) return null;

    return $payload;
}

/** Extract the Bearer token from the Authorization header. */
function bearer_token(): ?string {
    $headers = [];
    if (function_exists('getallheaders')) {
        $headers = getallheaders();
    }
    $auth = $headers['Authorization']
        ?? $headers['authorization']
        ?? $_SERVER['HTTP_AUTHORIZATION']
        ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION']
        ?? '';

    if (stripos($auth, 'Bearer ') === 0) {
        return trim(substr($auth, 7));
    }
    return null;
}

/** Return the authenticated payload, or null if not authenticated. */
function current_user(): ?array {
    return verify_token(bearer_token());
}

/** Require any authenticated user. Exits with 401 if missing/invalid. */
function require_auth(): array {
    $user = current_user();
    if (!$user) {
        json_error('Authentication required.', 401);
    }
    return $user;
}

/** Require an admin user. Exits with 401/403 as appropriate. */
function require_admin(): array {
    $user = require_auth();
    if (($user['role'] ?? '') !== 'admin') {
        json_error('Admin access required.', 403);
    }
    return $user;
}
