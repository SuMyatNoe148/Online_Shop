-- ABYSS — Database Views & Stored Procedures (data-first layer)
-- Run this after abyssDatabase.sql is applied.
-- These views/procedures centralize business logic in the DB so the PHP layer only orchestrates.

USE abyss;

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS v_products_full;
CREATE VIEW v_products_full AS
SELECT
    id,
    slug,
    name,
    description,
    category,
    price,
    currency,
    FORMAT(price / 100, 0) AS price_formatted,
    images,
    sizes,
    colors,
    stock,
    featured,
    created_at
FROM products;

DROP VIEW IF EXISTS v_orders_summary;
CREATE VIEW v_orders_summary AS
SELECT
    id,
    customer_name,
    email,
    address,
    items,
    total,
    currency,
    FORMAT(total / 100, 0) AS total_formatted,
    status,
    created_at,
    JSON_LENGTH(items) AS item_count
FROM orders;

DROP VIEW IF EXISTS v_models_full;
CREATE VIEW v_models_full AS
SELECT
    id,
    name,
    role,
    bio,
    photo,
    instagram,
    featured,
    created_at
FROM models;

DROP VIEW IF EXISTS v_wishlist_products;
CREATE VIEW v_wishlist_products AS
SELECT
    w.id AS wishlist_id,
    w.user_id,
    w.product_id,
    w.created_at AS wishlist_created_at,
    p.slug,
    p.name,
    p.description,
    p.category,
    p.price,
    p.currency,
    p.images,
    p.sizes,
    p.colors,
    p.stock,
    p.featured
FROM wishlist w
JOIN products p ON w.product_id = p.id;

-- ─────────────────────────────────────────────────────────────────────────────
-- STORED PROCEDURES
-- ─────────────────────────────────────────────────────────────────────────────

DELIMITER //

-- Register a new user (returns 1 on success, 0 if duplicate email)
DROP PROCEDURE IF EXISTS sp_register_user //
CREATE PROCEDURE sp_register_user(
    IN p_id VARCHAR(64),
    IN p_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_password_hash VARCHAR(255),
    IN p_role ENUM('customer','admin')
)
BEGIN
    IF EXISTS (SELECT 1 FROM users WHERE email = LOWER(p_email)) THEN
        SELECT 0 AS success, 'Email already registered' AS message;
    ELSE
        INSERT INTO users (id, name, email, password_hash, role)
        VALUES (p_id, p_name, LOWER(p_email), p_password_hash, p_role);
        SELECT 1 AS success, 'User created' AS message;
    END IF;
END //

-- Toggle a wishlist item (add if missing, remove if present)
DROP PROCEDURE IF EXISTS sp_toggle_wishlist //
CREATE PROCEDURE sp_toggle_wishlist(
    IN p_user_id VARCHAR(64),
    IN p_product_id VARCHAR(64)
)
BEGIN
    IF EXISTS (SELECT 1 FROM wishlist WHERE user_id = p_user_id AND product_id = p_product_id) THEN
        DELETE FROM wishlist WHERE user_id = p_user_id AND product_id = p_product_id;
        SELECT 0 AS is_saved, 'Removed from wishlist' AS message;
    ELSE
        INSERT INTO wishlist (user_id, product_id) VALUES (p_user_id, p_product_id);
        SELECT 1 AS is_saved, 'Added to wishlist' AS message;
    END IF;
END //

-- Update order status
DROP PROCEDURE IF EXISTS sp_update_order_status //
CREATE PROCEDURE sp_update_order_status(
    IN p_order_id VARCHAR(64),
    IN p_status ENUM('pending','processing','shipped','delivered','cancelled')
)
BEGIN
    IF EXISTS (SELECT 1 FROM orders WHERE id = p_order_id) THEN
        UPDATE orders SET status = p_status WHERE id = p_order_id;
        SELECT 1 AS success, 'Status updated' AS message;
    ELSE
        SELECT 0 AS success, 'Order not found' AS message;
    END IF;
END //

-- Create an order inside a transaction
DROP PROCEDURE IF EXISTS sp_create_order //
CREATE PROCEDURE sp_create_order(
    IN p_id VARCHAR(64),
    IN p_customer_name VARCHAR(255),
    IN p_email VARCHAR(255),
    IN p_address TEXT,
    IN p_items JSON,
    IN p_currency VARCHAR(8)
)
BEGIN
    DECLARE v_total INT DEFAULT 0;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_product_id VARCHAR(64);
    DECLARE v_quantity INT;
    DECLARE v_price INT;
    DECLARE v_json JSON;

    SET v_json = p_items;
    SET v_count = JSON_LENGTH(v_json);

    WHILE v_i < v_count DO
        SET v_product_id = JSON_UNQUOTE(JSON_EXTRACT(v_json, CONCAT('$[', v_i, '].productId')));
        SET v_quantity   = JSON_UNQUOTE(JSON_EXTRACT(v_json, CONCAT('$[', v_i, '].quantity')));
        SELECT price INTO v_price FROM products WHERE id = v_product_id LIMIT 1;
        SET v_total = v_total + (COALESCE(v_price, 0) * v_quantity);
        SET v_i = v_i + 1;
    END WHILE;

    START TRANSACTION;
    INSERT INTO orders (id, customer_name, email, address, items, total, currency, status)
    VALUES (p_id, p_customer_name, LOWER(p_email), p_address, p_items, v_total, p_currency, 'pending');
    COMMIT;

    SELECT 1 AS success, p_id AS order_id, v_total AS total, 'Order created' AS message;
END //

DELIMITER ;
