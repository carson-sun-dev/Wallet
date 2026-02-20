const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const { authMiddleware } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  enableKeepAlive: true
});

// --- Public routes (no auth) ---
app.use('/api/auth', authRoutes(pool));

// --- Protected routes (require auth) ---

// Helper to build user filter (support both with and without user_id column)
function userFilter(req) {
  const uid = req.user?.id;
  return uid != null ? ' AND (t.user_id = ? OR t.user_id IS NULL)' : '';
}

function userParams(req) {
  return req.user?.id != null ? [req.user.id] : [];
}

// Categories (global, no user filter)
app.get('/api/categories', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top categories (filter by user_id, current month - same as monthly stats)
app.get('/api/top-categories', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const sql = `
      SELECT t.category, SUM(t.amount) as total_amount, c.icon, c.color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name
      WHERE t.type = 'expense' AND (t.user_id = ? OR t.user_id IS NULL)
        AND MONTH(t.transaction_time) = MONTH(CURRENT_DATE())
        AND YEAR(t.transaction_time) = YEAR(CURRENT_DATE())
      GROUP BY t.category, c.icon, c.color
      ORDER BY total_amount DESC
      LIMIT 4
    `;
    const [rows] = await pool.query(sql, [uid]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Today's stats (filter by user_id, current date)
app.get('/api/today-stats', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const [rows] = await pool.query(
      `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
       FROM transactions WHERE (user_id = ? OR user_id IS NULL)
       AND DATE(transaction_time) = CURDATE()`,
      [uid]
    );
    const income = parseFloat(rows[0]?.total_income || 0);
    const expense = parseFloat(rows[0]?.total_expense || 0);
    res.json({ income, expense, balance: income - expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly stats (filter by user_id, optional month=YYYY-MM)
app.get('/api/monthly-stats', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const month = req.query.month; // YYYY-MM
    const useMonth = month && /^\d{4}-\d{2}$/.test(month);
    const sql = useMonth
      ? `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
         FROM transactions WHERE (user_id = ? OR user_id IS NULL)
         AND DATE_FORMAT(transaction_time, '%Y-%m') = ?`
      : `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
          SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
         FROM transactions WHERE (user_id = ? OR user_id IS NULL)
         AND MONTH(transaction_time) = MONTH(CURRENT_DATE())
         AND YEAR(transaction_time) = YEAR(CURRENT_DATE())`;
    const params = useMonth ? [uid, month] : [uid];
    const [rows] = await pool.query(sql, params);
    const income = parseFloat(rows[0]?.total_income || 0);
    const expense = parseFloat(rows[0]?.total_expense || 0);
    res.json({ income, expense, balance: income - expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All categories stats (filter by user_id)
app.get('/api/all-categories-stats', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const sql = `
      SELECT t.category, SUM(t.amount) as total_amount, c.icon, c.color
      FROM transactions t
      LEFT JOIN categories c ON t.category = c.name
      WHERE t.type = 'expense'
        AND (t.user_id = ? OR t.user_id IS NULL)
        AND MONTH(t.transaction_time) = MONTH(CURRENT_DATE())
      GROUP BY t.category, c.icon, c.color
      ORDER BY total_amount DESC
    `;
    const [rows] = await pool.query(sql, [uid]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET transactions (paginated)
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    const dataSql = `
      SELECT t.*, a.name as account_name
      FROM transactions t
      LEFT JOIN accounts a ON t.account_id = a.id
      WHERE t.user_id = ? OR t.user_id IS NULL
      ORDER BY t.transaction_time DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataSql, [uid, pageSize, offset]);

    const [totalRows] = await pool.query(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? OR user_id IS NULL',
      [uid]
    );
    const totalCount = totalRows[0].count;

    res.json({ data: rows, total: totalCount, hasMore: offset + rows.length < totalCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST single transaction
app.post('/api/transactions', authMiddleware, async (req, res) => {
  const { amount, category, transaction_time, note, type, account_id } = req.body;
  const uid = req.user.id;

  try {
    const sql = `
      INSERT INTO transactions (amount, category, transaction_time, type, note, user_id, account_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await pool.query(sql, [amount, category, transaction_time, type || 'expense', note || '', uid, account_id || null]);

    // Update account balance if account_id provided
    if (account_id) {
      const delta = type === 'income' ? amount : -amount;
      await pool.query('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?', [delta, account_id, uid]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST batch transactions (for import)
app.post('/api/transactions/batch', authMiddleware, async (req, res) => {
  const items = req.body;
  const uid = req.user.id;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Expected array of transactions' });
  }
  try {
    for (const tx of items) {
      const { amount, category, transaction_time, note, type, account_id } = tx;
      const t = type || (['income', 'bonus'].includes(category) ? 'income' : 'expense');
      await pool.query(
        'INSERT INTO transactions (amount, category, transaction_time, type, note, user_id, account_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [amount, category || 'other', transaction_time || new Date().toISOString().slice(0, 19).replace('T', ' '), t, note || '', uid, account_id || null]
      );
    }
    res.json({ success: true, count: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET export transactions (all for user)
app.get('/api/transactions/export', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const [rows] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? OR user_id IS NULL ORDER BY transaction_time DESC',
      [uid]
    );
    const format = req.query.format || 'json';
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      const header = 'time,category,type,amount,note\n';
      const body = rows.map(r => `${r.transaction_time},${r.category},${r.type},${r.amount},"${(r.note || '').replace(/"/g, '""')}"`).join('\n');
      res.send('\uFEFF' + header + body);
    } else {
      res.json(rows);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Accounts API ---
app.get('/api/accounts', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM accounts WHERE user_id = ? ORDER BY id', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/accounts', authMiddleware, async (req, res) => {
  const { name, type } = req.body;
  try {
    const [r] = await pool.query(
      'INSERT INTO accounts (user_id, name, type, balance) VALUES (?, ?, ?, 0)',
      [req.user.id, name || 'New Account', type || 'cash']
    );
    res.json({ id: r.insertId, name: name || 'New Account', type: type || 'cash', balance: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/accounts/:id', authMiddleware, async (req, res) => {
  const { name, type } = req.body;
  try {
    await pool.query(
      'UPDATE accounts SET name = COALESCE(?, name), type = COALESCE(?, type) WHERE id = ? AND user_id = ?',
      [name, type, req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/accounts/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM accounts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Budgets API ---
app.get('/api/budgets', authMiddleware, async (req, res) => {
  try {
    const month = req.query.month;
    let sql = 'SELECT * FROM budgets WHERE user_id = ?';
    const params = [req.user.id];
    if (month) {
      sql += ' AND month = ?';
      params.push(month);
    }
    sql += ' ORDER BY month DESC, category';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/budgets', authMiddleware, async (req, res) => {
  const { month, amount, category } = req.body;
  try {
    const cat = category || '';
    await pool.query(
      'INSERT INTO budgets (user_id, month, amount, category) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE amount = ?',
      [req.user.id, month, amount, cat, amount]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/budgets/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM budgets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Expense trend (for line chart)
app.get('/api/expense-trend', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const [rows] = await pool.query(`
      SELECT DATE(transaction_time) as date, SUM(amount) as total
      FROM transactions
      WHERE type = 'expense' AND (user_id = ? OR user_id IS NULL)
        AND transaction_time >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(transaction_time)
      ORDER BY date
    `, [uid]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Monthly comparison (for bar chart)
app.get('/api/monthly-comparison', authMiddleware, async (req, res) => {
  try {
    const uid = req.user.id;
    const months = parseInt(req.query.months) || 6;
    const [rows] = await pool.query(`
      SELECT
        DATE_FORMAT(transaction_time, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
      FROM transactions
      WHERE (user_id = ? OR user_id IS NULL)
        AND transaction_time >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(transaction_time, '%Y-%m')
      ORDER BY month
    `, [uid, months]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});
