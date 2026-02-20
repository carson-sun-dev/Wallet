const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'wallet-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'wallet-refresh-secret-change-in-production';

/**
 * Verify access token, attach user to req
 * Returns 401 with code TOKEN_EXPIRED if token invalid/expired (for refresh flow)
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Access token expired' });
    }
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid token' });
  }
}

/**
 * Verify refresh token (for /api/auth/refresh)
 */
function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

function signAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
}

function signRefreshToken(userId) {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

module.exports = {
  authMiddleware,
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken
};
