CREATE DATABASE IF NOT EXISTS abyss DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE abyss;

-- ─────────────── TABLES ───────────────

CREATE TABLE IF NOT EXISTS products (
    id          VARCHAR(64)  PRIMARY KEY,
    slug        VARCHAR(128) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    category    ENUM('SHIRT','HOODIE','TOP') NOT NULL,
    price       INT          NOT NULL,
    currency    VARCHAR(8)   NOT NULL DEFAULT 'MMK',
    images      JSON,
    sizes       JSON,
    colors      JSON,
    stock       INT          NOT NULL DEFAULT 0,
    featured    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS models (
    id          VARCHAR(64)  PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    role        VARCHAR(255),
    bio         TEXT,
    photo       VARCHAR(512),
    instagram   VARCHAR(128),
    featured    TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id            VARCHAR(64)  PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL,
    address       TEXT         NOT NULL,
    items         JSON         NOT NULL,
    total         INT          NOT NULL,
    currency      VARCHAR(8)   NOT NULL DEFAULT 'MMK',
    status        ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(64)  PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    VARCHAR(64) NOT NULL,
    product_id VARCHAR(64) NOT NULL,
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wishlist (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─────────────── USER ───────────────
-- Creates abyss_user with password abyss2024 (used by PHP API)
CREATE USER IF NOT EXISTS 'abyss_user'@'localhost' IDENTIFIED BY 'abyss2024';
GRANT ALL PRIVILEGES ON abyss.* TO 'abyss_user'@'localhost';
FLUSH PRIVILEGES;

-- ─────────────── SEED PRODUCTS ───────────────

INSERT IGNORE INTO products (id,slug,name,description,category,price,currency,images,sizes,colors,stock,featured) VALUES
('p-shirt-eclipse','eclipse-oxford-shirt','Eclipse Oxford Shirt','A tailored oxford shirt cut from breathable cotton with a structured collar and mother-of-pearl buttons.','SHIRT',6900,'MMK','["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL"]','["Black","White","Stone"]',42,1),
('p-shirt-noir','noir-linen-shirt','Noir Linen Shirt','Relaxed linen shirt with a soft drape and a tonal chest pocket.','SHIRT',7400,'MMK','["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL","XXL"]','["Charcoal","Sand"]',30,0),
('p-hoodie-abyss','abyss-heavyweight-hoodie','Abyss Heavyweight Hoodie','450gsm brushed-back fleece with a double-layer hood and embroidered wordmark.','HOODIE',9900,'MMK','["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL","XXL"]','["Black","Bone","Slate"]',58,1),
('p-hoodie-fog','fog-zip-hoodie','Fog Full-Zip Hoodie','A clean full-zip in midweight loopback cotton with a YKK zipper.','HOODIE',8900,'MMK','["https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL"]','["Fog Grey","Black"]',24,0),
('p-top-mono','mono-ribbed-top','Mono Ribbed Top','A second-skin ribbed top with a sculpted neckline and stretch recovery.','TOP',4200,'MMK','["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&h=1200&q=80"]','["XS","S","M","L"]','["Black","Ivory","Olive"]',70,1),
('p-top-mesh','mirage-mesh-top','Mirage Mesh Top','A breathable performance mesh top with flatlock seams and a cropped silhouette.','TOP',4800,'MMK','["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1200&q=80"]','["XS","S","M","L","XL"]','["Black","White"]',36,0);

-- ─────────────── SEED MODELS ───────────────

INSERT IGNORE INTO models (id,name,role,bio,photo,instagram,featured) VALUES
('m-aria','Aria Vance','Lead Campaign Model','Aria fronts the seasonal ABYSS campaigns, bringing an effortless edge to every silhouette.','https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&h=1000&q=80','@aria.vance',1),
('m-koa','Koa Reyes','Menswear Model','Koa anchors the menswear line — tailored shirts, heavyweight hoodies, and everything in between.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&h=1000&q=80','@koa.reyes',1),
('m-mira','Mira Sol','Tops & Streetwear','Mira styles the ABYSS tops collection with a streetwear sensibility and a sharp eye for fit.','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&h=1000&q=80','@mira.sol',1);

-- ─────────────── SEED ADMIN USER ───────────────
-- password: admin123

-- Run install.php to seed admin user with correct bcrypt hash for admin123
-- (hash generated by install.php using password_hash())
