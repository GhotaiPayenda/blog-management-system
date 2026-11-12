-- Blog Management System Database Schema
-- MySQL

CREATE DATABASE IF NOT EXISTS blog_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE blog_management;

-- Admins/Accounts table (supports role management)
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin', 'User') NOT NULL DEFAULT 'Admin',
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  token_version INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_admins_email (email),
  KEY idx_admins_role (role),
  KEY idx_admins_status (status)
) ENGINE=InnoDB;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_categories_name (name),
  UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB;

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(280) NOT NULL,
  excerpt TEXT,
  content LONGTEXT NOT NULL,
  featured_image VARCHAR(500),
  category_id INT UNSIGNED NULL,
  admin_id INT UNSIGNED NOT NULL,
  status ENUM('Draft', 'Published') NOT NULL DEFAULT 'Draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_posts_slug (slug),
  KEY idx_posts_status (status),
  KEY idx_posts_category_id (category_id),
  KEY idx_posts_admin_id (admin_id),
  KEY idx_posts_published_at (published_at),
  CONSTRAINT fk_posts_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT fk_posts_admin
    FOREIGN KEY (admin_id) REFERENCES admins(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;
