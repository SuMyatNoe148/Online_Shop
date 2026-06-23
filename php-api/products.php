<?php
require_once __DIR__ . '/config.php';
cors();

$method = $_SERVER['REQUEST_METHOD'];
$id     = $_GET['id']   ?? null;
$slug   = $_GET['slug'] ?? null;

// GET /products.php  or  /products.php?category=HOODIE&search=abyss&sort=price_asc
if ($method === 'GET') {
    $pdo    = get_pdo();
    $where  = [];
    $params = [];

    if ($id) {
        $where[]       = 'id = ?';
        $params[]      = $id;
    } elseif ($slug) {
        $where[]       = 'slug = ?';
        $params[]      = $slug;
    } else {
        $cat = $_GET['category'] ?? '';
        if ($cat) { $where[] = 'category = ?'; $params[] = strtoupper($cat); }

        $search = trim($_GET['search'] ?? '');
        if ($search) {
            $where[]  = '(name LIKE ? OR description LIKE ?)';
            $like     = '%' . $search . '%';
            $params[] = $like;
            $params[] = $like;
        }

        $featured = $_GET['featured'] ?? '';
        if ($featured !== '') { $where[] = 'featured = ?'; $params[] = (int)$featured; }
    }

    $sql = 'SELECT * FROM products';
    if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);

    $sort = $_GET['sort'] ?? 'created_at_desc';
    $sql .= match ($sort) {
        'price_asc'  => ' ORDER BY price ASC',
        'price_desc' => ' ORDER BY price DESC',
        'name_asc'   => ' ORDER BY name ASC',
        default      => ' ORDER BY created_at DESC',
    };

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    foreach ($rows as &$r) {
        $r['images'] = json_decode($r['images'], true) ?? [];
        $r['sizes']  = json_decode($r['sizes'],  true) ?? [];
        $r['colors'] = json_decode($r['colors'], true) ?? [];
        $r['featured'] = (bool)$r['featured'];
    }
    unset($r);

    json_response(['data' => ($id || $slug) ? ($rows[0] ?? null) : $rows]);
}

// POST /products.php  — create
if ($method === 'POST') {
    $b = get_body();
    $required = ['id','slug','name','category','price'];
    foreach ($required as $f) {
        if (empty($b[$f])) json_error("Field '$f' is required.");
    }
    $pdo = get_pdo();
    $stmt = $pdo->prepare(
        'INSERT INTO products (id,slug,name,description,category,price,currency,images,sizes,colors,stock,featured)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)'
    );
    $stmt->execute([
        $b['id'], $b['slug'], $b['name'], $b['description'] ?? '',
        strtoupper($b['category']), (int)$b['price'],
        $b['currency'] ?? 'USD',
        json_encode($b['images']  ?? []),
        json_encode($b['sizes']   ?? []),
        json_encode($b['colors']  ?? []),
        (int)($b['stock']   ?? 0),
        (int)($b['featured'] ?? 0),
    ]);
    json_response(['data' => ['id' => $b['id']]], 201);
}

// PATCH /products.php?id=xxx  — update
if ($method === 'PATCH' || $method === 'PUT') {
    if (!$id) json_error('id is required for update.');
    $b = get_body();
    $pdo = get_pdo();
    $sets = []; $params = [];
    $allowed = ['name','description','category','price','currency','images','sizes','colors','stock','featured','slug'];
    foreach ($allowed as $field) {
        if (!array_key_exists($field, $b)) continue;
        $sets[]   = "$field = ?";
        $params[] = in_array($field, ['images','sizes','colors'])
            ? json_encode($b[$field])
            : $b[$field];
    }
    if (!$sets) json_error('Nothing to update.');
    $params[] = $id;
    $pdo->prepare('UPDATE products SET ' . implode(',', $sets) . ' WHERE id = ?')->execute($params);
    json_response(['data' => ['updated' => true]]);
}

// DELETE /products.php?id=xxx
if ($method === 'DELETE') {
    if (!$id) json_error('id is required.');
    $pdo = get_pdo();
    $pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
    json_response(['data' => ['deleted' => true]]);
}

json_error('Method not allowed.', 405);
