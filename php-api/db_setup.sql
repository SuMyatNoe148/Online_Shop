-- Run this in phpMyAdmin or MySQL CLI to set up the ABYSS database
CREATE DATABASE IF NOT EXISTS abyss CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE abyss;

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
    id              VARCHAR(64)  PRIMARY KEY,
    customer_name   VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    address         TEXT         NOT NULL,
    items           JSON         NOT NULL,
    total           INT          NOT NULL,
    currency        VARCHAR(8)   NOT NULL DEFAULT 'USD',
    status          ENUM('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id              VARCHAR(64)  PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            ENUM('customer','admin') NOT NULL DEFAULT 'customer',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wishlist (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     VARCHAR(64) NOT NULL,
    product_id  VARCHAR(64) NOT NULL,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_wishlist (user_id, product_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Seed products
INSERT IGNORE INTO products VALUES
('p-shirt-eclipse','eclipse-oxford-shirt','Eclipse Oxford Shirt','A tailored oxford shirt cut from breathable cotton with a structured collar and mother-of-pearl buttons.','SHIRT',6900,'USD','["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL"]','["Black","White","Stone"]',42,1,NOW()),
('p-shirt-noir','noir-linen-shirt','Noir Linen Shirt','Relaxed linen shirt with a soft drape and a tonal chest pocket.','SHIRT',7400,'USD','["https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL","XXL"]','["Charcoal","Sand"]',30,0,NOW()),
('p-hoodie-abyss','abyss-heavyweight-hoodie','Abyss Heavyweight Hoodie','450gsm brushed-back fleece with a double-layer hood and embroidered wordmark.','HOODIE',9900,'USD','["https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL","XXL"]','["Black","Bone","Slate"]',58,1,NOW()),
('p-hoodie-fog','fog-zip-hoodie','Fog Full-Zip Hoodie','A clean full-zip in midweight loopback cotton with a YKK zipper.','HOODIE',8900,'USD','["https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&w=900&h=1200&q=80"]','["S","M","L","XL"]','["Fog Grey","Black"]',24,0,NOW()),
('p-top-mono','mono-ribbed-top','Mono Ribbed Top','A second-skin ribbed top with a sculpted neckline and stretch recovery.','TOP',4200,'USD','["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&h=1200&q=80"]','["XS","S","M","L"]','["Black","Ivory","Olive"]',70,1,NOW()),
('p-top-mesh','mirage-mesh-top','Mirage Mesh Top','A breathable performance mesh top with flatlock seams and a cropped silhouette.','TOP',4800,'USD','["https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&h=1200&q=80"]','["XS","S","M","L","XL"]','["Black","White"]',36,0,NOW());

-- Seed models
INSERT IGNORE INTO models VALUES
('m-aria','Aria Vance','Lead Campaign Model','Aria fronts the seasonal ABYSS campaigns, bringing an effortless edge to every silhouette.','https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&h=1000&q=80','@aria.vance',1,NOW()),
('m-koa','Koa Reyes','Menswear Model','Koa anchors the menswear line — tailored shirts, heavyweight hoodies, and everything in between.','https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&h=1000&q=80','@koa.reyes',1,NOW()),
('m-mira','Mira Sol','Tops & Streetwear','Mira styles the ABYSS tops collection with a streetwear sensibility and a sharp eye for fit.','https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&h=1000&q=80','@mira.sol',1,NOW());

-- Default admin user (password: admin123)
INSERT IGNORE INTO users (id, name, email, password_hash, role) VALUES
('u-admin', 'ABYSS Admin', 'admin@abyss.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
