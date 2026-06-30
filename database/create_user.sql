-- Run this in phpMyAdmin SQL tab (select "abyss" database first, or run on any DB)
-- This creates a new MySQL user that uses mysql_native_password (compatible with PHP/MariaDB)

CREATE USER IF NOT EXISTS 'abyss_user'@'localhost' IDENTIFIED WITH mysql_native_password BY 'abyss2024';
GRANT ALL PRIVILEGES ON abyss.* TO 'abyss_user'@'localhost';
FLUSH PRIVILEGES;
