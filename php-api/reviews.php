<?php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/lib/Auth.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$productId = $_GET['product_id'] ?? null;

/** Ensure the reviews table exists. */
function ensure_reviews_table(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS product_reviews (
            id          VARCHAR(64)  PRIMARY KEY,
            product_id  VARCHAR(64)  NOT NULL,
            user_id     VARCHAR(64)  NOT NULL,
            user_name   VARCHAR(120) NOT NULL,
            rating      TINYINT      NOT NULL DEFAULT 5,
            comment     TEXT,
            created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_review (product_id, user_id),
            INDEX idx_product (product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

$pdo = get_pdo();
ensure_reviews_table($pdo);

// GET /reviews.php?product_id=xxx  — list reviews for a product
if ($method === 'GET') {
    if (!$productId) json_error('product_id is required.');

    // Get reviews + aggregate rating
    $stmt = $pdo->prepare('
        SELECT id, user_name, rating, comment, created_at
        FROM product_reviews
        WHERE product_id = ?
        ORDER BY created_at DESC
    ');
    $stmt->execute([$productId]);
    $reviews = $stmt->fetchAll();

    // Calculate average
    $avg = 0;
    $count = count($reviews);
    if ($count > 0) {
        $sum = array_sum(array_column($reviews, 'rating'));
        $avg = round($sum / $count, 1);
    }

    json_response(['data' => [
        'reviews'    => $reviews,
        'avgRating'  => $avg,
        'totalCount' => $count,
    ]]);
}

// POST /reviews.php  — create a review (authenticated users only)
if ($method === 'POST') {
    $user = require_auth();
    $b = get_body();

    if (empty($b['productId']))  json_error('productId is required.');
    if (empty($b['rating']))     json_error('rating is required.');
    $rating = (int) $b['rating'];
    if ($rating < 1 || $rating > 5) json_error('rating must be between 1 and 5.');

    // Check product exists
    $stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
    $stmt->execute([$b['productId']]);
    if (!$stmt->fetch()) json_error('Product not found.', 404);

    // Check for existing review (one per user per product)
    $stmt = $pdo->prepare('SELECT id FROM product_reviews WHERE product_id = ? AND user_id = ?');
    $stmt->execute([$b['productId'], $user['sub']]);
    if ($stmt->fetch()) json_error('You have already reviewed this product.', 409);

    $id = 'rev-' . bin2hex(random_bytes(8));
    $stmt = $pdo->prepare('
        INSERT INTO product_reviews (id, product_id, user_id, user_name, rating, comment)
        VALUES (?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([
        $id,
        $b['productId'],
        $user['sub'],
        $user['name'] ?? 'Anonymous',
        $rating,
        $b['comment'] ?? null,
    ]);

    json_response(['data' => ['id' => $id, 'created' => true]], 201);
}

// DELETE /reviews.php?id=xxx  — delete a review (owner or admin)
if ($method === 'DELETE') {
    $user = require_auth();
    $reviewId = $_GET['id'] ?? null;
    if (!$reviewId) json_error('id is required.');

    $stmt = $pdo->prepare('SELECT user_id FROM product_reviews WHERE id = ?');
    $stmt->execute([$reviewId]);
    $review = $stmt->fetch();
    if (!$review) json_error('Review not found.', 404);

    if ($review['user_id'] !== $user['sub'] && ($user['role'] ?? '') !== 'admin') {
        json_error('You can only delete your own reviews.', 403);
    }

    $pdo->prepare('DELETE FROM product_reviews WHERE id = ?')->execute([$reviewId]);
    json_response(['data' => ['deleted' => true]]);
}

json_error('Method not allowed.', 405);
