const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); // 允许 Vue 前端访问
app.use(express.json());

// 创建连接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // 解决你之前遇到的 MySQL 8.0 权限问题
  enableKeepAlive: true
});

// 接口：获取最近交易列表 (Recent Transactions)
// 获取近一周消费最高的前四类
app.get('/api/top-categories', async (req, res) => {
  try {
    const sql = `
      SELECT 
        t.category, 
        SUM(t.amount) as total_amount,
        c.icon, 
        c.color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name
      WHERE t.type = 'expense'
      GROUP BY t.category, c.icon, c.color
      ORDER BY total_amount DESC
      LIMIT 4;
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/monthly-stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions 
      WHERE MONTH(transaction_time) = MONTH(CURRENT_DATE()) 
        AND YEAR(transaction_time) = YEAR(CURRENT_DATE());
    `;
    const [rows] = await pool.query(sql);
    
    const income = parseFloat(rows[0].total_income || 0);
    const expense = parseFloat(rows[0].total_expense || 0);
    
    res.json({
      income: income,
      expense: expense,
      balance: income - expense
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/all-categories-stats', async (req, res) => {
  try {
    const sql = `
      SELECT 
        t.category, 
        SUM(t.amount) as total_amount,
        c.icon, 
        c.color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name
      WHERE t.type = 'expense' 
        AND MONTH(t.transaction_time) = MONTH(CURRENT_DATE())
      GROUP BY t.category, c.icon, c.color
      ORDER BY total_amount DESC;
    `;
    const [rows] = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/transactions', async (req, res) => {
  // 从请求体中拿到 type
  const { amount, category, transaction_time, note, type } = req.body;

  try {
    const sql = `
      INSERT INTO transactions (amount, category, transaction_time, type, note) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    // 把 type 传进去
    await pool.query(sql, [amount, category, transaction_time, type, note]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ 后端服务器已启动: http://localhost:${PORT}`);
});