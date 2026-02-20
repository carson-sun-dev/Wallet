-- Wallet Auth & Accounts Migration
-- Run this against your database before starting the server

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add user_id and account_id to transactions (run manually if columns exist)
-- ALTER TABLE transactions ADD COLUMN user_id INT NULL;
-- ALTER TABLE transactions ADD COLUMN account_id INT NULL;

-- 3. Accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(30) NOT NULL DEFAULT 'cash',
  balance DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month VARCHAR(7) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  category VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_month_category (user_id, month, category),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- MySQL 8.0 doesn't support IF NOT EXISTS for ADD COLUMN - use this if above fails:
-- ALTER TABLE transactions ADD COLUMN user_id INT NULL;
-- ALTER TABLE transactions ADD COLUMN account_id INT NULL;
