#!/usr/bin/env node
/**
 * Run database migrations. Usage: node scripts/run-migration.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
  });

  const conn = await pool.getConnection();

  try {
    // 1. Users table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('OK: users table');

    // 2. Add columns to transactions (ignore if exists)
    try {
      await conn.query('ALTER TABLE transactions ADD COLUMN user_id INT NULL');
      console.log('OK: transactions.user_id');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP: transactions.user_id already exists');
      else throw e;
    }
    try {
      await conn.query('ALTER TABLE transactions ADD COLUMN account_id INT NULL');
      console.log('OK: transactions.account_id');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log('SKIP: transactions.account_id already exists');
      else throw e;
    }

    // 3. Accounts table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        type VARCHAR(30) NOT NULL DEFAULT 'cash',
        balance DECIMAL(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('OK: accounts table');

    // 4. Budgets table
    await conn.query(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        month VARCHAR(7) NOT NULL,
        amount DECIMAL(15, 2) NOT NULL,
        category VARCHAR(50) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uk_user_month_category (user_id, month, category),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    console.log('OK: budgets table');

    console.log('\nMigration completed.');
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
