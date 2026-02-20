const express = require('express');
const bcrypt = require('bcrypt');
const { signAccessToken, signRefreshToken, verifyRefreshToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

module.exports = function (pool) {
  // POST /api/auth/register
  router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }
    try {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email or username already exists' });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        [username, email, passwordHash]
      );
      const [rows] = await pool.query('SELECT id, username, email FROM users WHERE email = ?', [email]);
      const user = rows[0];
      const accessToken = signAccessToken(user.id);
      const refreshToken = signRefreshToken(user.id);
      res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        refreshToken,
        expiresIn: 900 // 15 min in seconds
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/auth/login (accept email or username)
  router.post('/login', async (req, res) => {
    const { email, username, password } = req.body;
    const login = email || username;
    if (!login || !password) {
      return res.status(400).json({ error: 'Email/username and password are required' });
    }
    try {
      const [rows] = await pool.query(
        'SELECT id, username, email, password_hash FROM users WHERE email = ? OR username = ?',
        [login, login]
      );
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const user = rows[0];
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      const accessToken = signAccessToken(user.id);
      const refreshToken = signRefreshToken(user.id);
      res.json({
        success: true,
        user: { id: user.id, username: user.username, email: user.email },
        accessToken,
        refreshToken,
        expiresIn: 900
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/auth/forgot-password (username + email verify, then set new password)
  router.post('/forgot-password', async (req, res) => {
    const { username, email, newPassword } = req.body;
    if (!username || !email || !newPassword) {
      return res.status(400).json({ error: 'Username, email and new password are required' });
    }
    try {
      const [rows] = await pool.query(
        'SELECT id FROM users WHERE username = ? AND email = ?',
        [username, email]
      );
      if (rows.length === 0) {
        return res.status(400).json({ error: 'Username and email do not match' });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, rows[0].id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/auth/profile (update username, email - requires auth)
  router.put('/profile', authMiddleware, async (req, res) => {
    const { username, email } = req.body;
    const uid = req.user.id;
    if (!username || !email) {
      return res.status(400).json({ error: 'Username and email are required' });
    }
    try {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE (email = ? OR username = ?) AND id != ?',
        [email, username, uid]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email or username already in use' });
      }
      await pool.query('UPDATE users SET username = ?, email = ? WHERE id = ?', [username, email, uid]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST /api/auth/refresh
  router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
    const accessToken = signAccessToken(decoded.userId);
    res.json({ accessToken, expiresIn: 900 });
  });

  return router;
};
