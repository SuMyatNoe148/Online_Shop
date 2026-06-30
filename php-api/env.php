<?php
/**
 * Minimal .env loader for the PHP API.
 *
 * Parses a KEY=VALUE file (default: project root /.env) once and exposes values
 * through env(). Supports:
 *   - comments starting with #
 *   - optional "export " prefix
 *   - single/double quoted values
 *   - blank lines
 *
 * Values are cached in a static array. Real OS environment variables (getenv)
 * take precedence so production hosts can override the file.
 */

function load_env(?string $path = null): void {
    static $loaded = false;
    if ($loaded) return;
    $loaded = true;

    $path = $path ?? dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env';
    if (!is_file($path) || !is_readable($path)) return;

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue;

        // Allow "export KEY=VALUE"
        if (stripos($line, 'export ') === 0) {
            $line = substr($line, 7);
        }

        $eq = strpos($line, '=');
        if ($eq === false) continue;

        $key   = trim(substr($line, 0, $eq));
        $value = trim(substr($line, $eq + 1));

        // Strip surrounding quotes
        $len = strlen($value);
        if ($len >= 2) {
            $first = $value[0];
            $last  = $value[$len - 1];
            if (($first === '"' && $last === '"') || ($first === "'" && $last === "'")) {
                $value = substr($value, 1, -1);
            }
        }

        if ($key === '') continue;
        // Don't clobber real environment variables.
        if (getenv($key) === false) {
            putenv("$key=$value");
            $_ENV[$key] = $value;
        }
    }
}

/** Read an env value with an optional default. */
function env(string $key, ?string $default = null): ?string {
    load_env();
    $val = getenv($key);
    if ($val === false || $val === '') {
        return $default;
    }
    return $val;
}
