require('dotenv').config();
const jwt = require('jsonwebtoken');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-this-password';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-to-a-long-random-string';

// Checks the submitted password against the hardcoded one and, if it
// matches, returns a signed session token. Returns null otherwise.
function login(password) {
  if (typeof password !== 'string' || password !== ADMIN_PASSWORD) return null;
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
}

// Express middleware that protects every write route in the admin panel.
function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing admin token. Log in again.' });
  }
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Log in again.' });
  }
}

module.exports = { login, requireAdmin };
