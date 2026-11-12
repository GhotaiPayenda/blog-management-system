-- Migration: add role management to existing Blog Management System (MySQL 8.0.40 compatible)
-- Non-destructive and safe to execute multiple times.
-- Run after importing the original schema:
--   mysql -u root -p blog_management < backend/database/migrate_roles.sql

USE blog_management;

-- Add role column if missing
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'role'
);
SET @sql := IF(@col_exists = 0,
  "ALTER TABLE `admins` ADD COLUMN `role` ENUM('Admin','User') NOT NULL DEFAULT 'Admin' AFTER `password`",
  'SELECT "Column role already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add status column if missing
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'status'
);
SET @sql := IF(@col_exists = 0,
  "ALTER TABLE `admins` ADD COLUMN `status` ENUM('Active','Inactive') NOT NULL DEFAULT 'Active' AFTER `role`",
  'SELECT "Column status already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add token_version column if missing
SET @col_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND COLUMN_NAME = 'token_version'
);
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `admins` ADD COLUMN `token_version` INT UNSIGNED NOT NULL DEFAULT 0 AFTER `status`',
  'SELECT "Column token_version already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on role if missing
SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND INDEX_NAME = 'idx_admins_role'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `admins` ADD INDEX `idx_admins_role` (`role`)',
  'SELECT "Index idx_admins_role already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on status if missing
SET @idx_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'admins'
    AND INDEX_NAME = 'idx_admins_status'
);
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `admins` ADD INDEX `idx_admins_status` (`status`)',
  'SELECT "Index idx_admins_status already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure existing rows have correct defaults (safe/idempotent)
UPDATE `admins` SET `role` = 'Admin' WHERE `role` IS NULL OR `role` = '';
UPDATE `admins` SET `status` = 'Active' WHERE `status` IS NULL OR `status` = '';
UPDATE `admins` SET `token_version` = 0 WHERE `token_version` IS NULL;
