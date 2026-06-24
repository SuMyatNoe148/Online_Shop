<?php
/**
 * ABYSS Database Installer
 * Visit http://localhost/Abyss.Net/php-api/install.php to auto-create DB + tables + seed data.
 * Delete this file after first run for security.
 */

$host    = 'localhost';
$user    = 'root';
$dbName  = 'abyss';

// Try abyss_user first (created via create_user.sql), then root fallbacks
$candidates = [['abyss_user','abyss2024'], ['root',''], ['root','root'], ['root','mysql'], ['root','1234'], ['root','password']];

$errors = [];
$steps  = [];
$pdo    = null;
$usedPass = null;

foreach ($candidates as [$tryUser, $tryPass]) {
    try {
        $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $tryUser, $tryPass, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $usedPass = "$tryUser / $tryPass";
        break;
    } catch (PDOException $e) {
        $pdo = null;
    }
}

if (!$pdo) {
    $errors[] = "❌ Could not connect with any common password. Please set your MySQL root password in php-api/config.php manually.";
}

try {
    if (!$pdo) throw new PDOException("No connection");
    $steps[] = "✅ Connected to MySQL" . ($usedPass !== '' ? " (password: '$usedPass')" : " (no password)");

    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $steps[] = "✅ Database '$dbName' ready";

    // Select the database
    $pdo->exec("USE `$dbName`");

    // Create tables
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS products (
            id          VARCHAR(64)  PRIMARY KEY,
            slug        VARCHAR(128) UNIQUE NOT NULL,
            name        VARCHAR(255) NOT NULL,
            description TEXT,
            category    ENUM('SHIRT','HOODIE','TOP') NOT NULL,
            price       INT          NOT NULL,
            currency    VARCHAR(8)   NOT NULL DEFAULT 'USD',
            images      JSON,
            sizes       JSON,
            colors      JSON,
            stock       INT          NOT NULL DEFAULT 0,
            featured    TINYINT(1)   NOT NULL DEFAULT 0,
            created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $steps[] = "✅ Table 'products' ready";

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS models (
            id          VARCHAR(64)  PRIMARY KEY,
            name        VARCHAR(255) NOT NULL,
            role        VARCHAR(255),
            bio         TEXT,
            photo       VARCHAR(512),
            instagram   VARCHAR(128),
            featured    TINYINT(1)   NOT NULL DEFAULT 0,
            created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $steps[] = "✅ Table 'models' ready";

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS orders (
            id              VARCHAR(64)  PRIMARY KEY,
            customer_name   VARCHAR(255) NOT NULL,
            email           VARCHAR(255) NOT NULL,
            address         TEXT         NOT NULL,
            items           JSON         NOT NULL,
            total           INT          NOT NULL,
            currency        VARCHAR(8)   NOT NULL DEFAULT 'USD',
            status          ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
            created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $steps[] = "✅ Table 'orders' ready";

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id              VARCHAR(64)  PRIMARY KEY,
            name            VARCHAR(255) NOT NULL,
            email           VARCHAR(255) UNIQUE NOT NULL,
            password_hash   VARCHAR(255) NOT NULL,
            role            ENUM('customer','admin') NOT NULL DEFAULT 'customer',
            created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    ");
    $steps[] = "✅ Table 'users' ready";

    $pdo->exec("
        CREATE TABLE IF NOT EXISTS wishlist (
            id          INT AUTO_INCREMENT PRIMARY KEY,
            user_id     VARCHAR(64) NOT NULL,
            product_id  VARCHAR(64) NOT NULL,
            created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY uq_wishlist (user_id, product_id),
            FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
    ");
    $steps[] = "✅ Table 'wishlist' ready";

    // Seed products
    $img = fn($id, $w = 900, $h = 1200) =>
        "https://images.unsplash.com/{$id}?auto=format&fit=crop&w={$w}&h={$h}&q=80";

    $products = [
        ['p-shirt-eclipse','eclipse-oxford-shirt','Eclipse Oxford Shirt','A tailored oxford shirt cut from breathable cotton with a structured collar and mother-of-pearl buttons.','SHIRT',6900,'USD',
            [$img('photo-1596755094514-f87e34085b2c'),$img('photo-1603252109303-2751441dd157')],
            ['S','M','L','XL'],['Black','White','Stone'],42,1],
        ['p-shirt-noir','noir-linen-shirt','Noir Linen Shirt','Relaxed linen shirt with a soft drape and a tonal chest pocket.','SHIRT',7400,'USD',
            [$img('photo-1602810318383-e386cc2a3ccf'),$img('photo-1620012253295-c15cc3e65df4')],
            ['S','M','L','XL','XXL'],['Charcoal','Sand'],30,0],
        ['p-hoodie-abyss','abyss-heavyweight-hoodie','Abyss Heavyweight Hoodie','450gsm brushed-back fleece with a double-layer hood and embroidered wordmark.','HOODIE',9900,'USD',
            [$img('photo-1556821840-3a63f95609a7'),$img('photo-1620799140408-edc6dcb6d633')],
            ['S','M','L','XL','XXL'],['Black','Bone','Slate'],58,1],
        ['p-hoodie-fog','fog-zip-hoodie','Fog Full-Zip Hoodie','A clean full-zip in midweight loopback cotton with a YKK zipper.','HOODIE',8900,'USD',
            [$img('photo-1578768079052-aa76e52ff62e'),$img('photo-1614975059251-992f11792b9f')],
            ['S','M','L','XL'],['Fog Grey','Black'],24,0],
        ['p-top-mono','mono-ribbed-top','Mono Ribbed Top','A second-skin ribbed top with a sculpted neckline and stretch recovery.','TOP',4200,'USD',
            [$img('photo-1521572163474-6864f9cf17ab'),$img('photo-1581655353564-df123a1eb820')],
            ['XS','S','M','L'],['Black','Ivory','Olive'],70,1],
        ['p-top-mesh','mirage-mesh-top','Mirage Mesh Top','A breathable performance mesh top with flatlock seams and a cropped silhouette.','TOP',4800,'USD',
            [$img('photo-1503342217505-b0a15ec3261c'),$img('photo-1485518882345-15568b007407')],
            ['XS','S','M','L','XL'],['Black','White'],36,0],
    ];

    $stmt = $pdo->prepare("
        INSERT IGNORE INTO products
            (id,slug,name,description,category,price,currency,images,sizes,colors,stock,featured)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
    ");
    foreach ($products as $p) {
        $stmt->execute([
            $p[0],$p[1],$p[2],$p[3],$p[4],(int)$p[5],$p[6],
            json_encode($p[7]), json_encode($p[8]), json_encode($p[9]),
            (int)$p[10], (int)$p[11],
        ]);
    }
    $steps[] = "✅ Products seeded (" . count($products) . " items)";

    // Seed models
    $imgM = fn($id) => "https://images.unsplash.com/{$id}?auto=format&fit=crop&w=800&h=1000&q=80";
    $models = [
        ['m-aria','Aria Vance','Lead Campaign Model','Aria fronts the seasonal ABYSS campaigns, bringing an effortless edge to every silhouette.',$imgM('photo-1529626455594-4ff0802cfb7e'),'@aria.vance',1],
        ['m-koa','Koa Reyes','Menswear Model','Koa anchors the menswear line — tailored shirts, heavyweight hoodies, and everything in between.',$imgM('photo-1500648767791-00dcc994a43e'),'@koa.reyes',1],
        ['m-mira','Mira Sol','Tops & Streetwear','Mira styles the ABYSS tops collection with a streetwear sensibility and a sharp eye for fit.',$imgM('photo-1524504388940-b1c1722653e1'),'@mira.sol',1],
    ];
    $stmt2 = $pdo->prepare("INSERT IGNORE INTO models (id,name,role,bio,photo,instagram,featured) VALUES (?,?,?,?,?,?,?)");
    foreach ($models as $m) $stmt2->execute($m);
    $steps[] = "✅ Models seeded (" . count($models) . " items)";

    // Seed admin user (password: admin123) — always update hash to ensure it's correct
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $pdo->prepare("INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)
        ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash), role='admin'")
        ->execute(['u-admin','ABYSS Admin','admin@abyss.com',$hash,'admin']);
    $steps[] = "✅ Admin user ready — email: admin@abyss.com / password: admin123";

    $success = true;

} catch (PDOException $e) {
    $errors[] = "❌ Database error: " . $e->getMessage();
    $success  = false;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>ABYSS Installer</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0a0a0b;color:#f5f5f5;font-family:system-ui,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem}
  .card{background:#17171a;border:1px solid rgba(255,255,255,.08);border-radius:14px;padding:2.4rem;max-width:560px;width:100%}
  h1{font-size:1.8rem;margin-bottom:0.4rem;letter-spacing:-.02em}
  .sub{color:#a1a1aa;font-size:.9rem;margin-bottom:1.6rem}
  .step{padding:.5rem .8rem;border-radius:6px;margin-bottom:.5rem;font-size:.9rem;background:rgba(255,255,255,.04)}
  .step.err{background:rgba(239,100,97,.12);color:#ef6461}
  .ok{border-top:1px solid rgba(255,255,255,.08);margin-top:1.4rem;padding-top:1.4rem}
  .ok h2{color:#c8a96e;font-size:1.1rem;margin-bottom:.8rem}
  .cred{background:#0a0a0b;border-radius:8px;padding:.8rem 1rem;font-size:.85rem;margin-bottom:.6rem;font-family:monospace}
  .btn{display:inline-block;margin-top:1.2rem;background:#c2a25a;color:#000;padding:.7rem 1.4rem;border-radius:8px;text-decoration:none;font-weight:600;font-size:.88rem}
  .warn{background:rgba(239,100,97,.1);border:1px solid rgba(239,100,97,.3);border-radius:8px;padding:.8rem 1rem;font-size:.82rem;color:#ef6461;margin-top:1rem}
</style>
</head>
<body>
<div class="card">
  <h1>ABYSS Installer</h1>
  <p class="sub">Setting up your database…</p>

  <?php foreach ($steps as $s): ?>
    <div class="step"><?= htmlspecialchars($s) ?></div>
  <?php endforeach; ?>
  <?php foreach ($errors as $e): ?>
    <div class="step err"><?= htmlspecialchars($e) ?></div>
  <?php endforeach; ?>

  <?php if ($success): ?>
  <div class="ok">
    <h2>🎉 Installation complete!</h2>
    <div class="cred">Admin login<br>Email: admin@abyss.com<br>Password: admin123</div>
    <div class="cred">PHP API base<br>http://localhost/Abyss.Net/php-api/</div>
    <a href="http://localhost:3000" class="btn">Open ABYSS Storefront →</a>
    <div class="warn">⚠️ Delete <strong>install.php</strong> after setup for security.</div>
  </div>
  <?php else: ?>
  <div class="ok">
    <h2 style="color:#ef6461">Installation failed</h2>
    <p style="color:#a1a1aa;font-size:.88rem">Make sure XAMPP MySQL is running, then refresh this page.</p>
  </div>
  <?php endif; ?>
</div>
</body>
</html>
