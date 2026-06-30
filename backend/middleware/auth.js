const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'wilaikid_secret_2025';

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!token) return res.status(401).json({ message: 'กรุณาเข้าสู่ระบบ' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Session หมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ message: 'สิทธิ์ admin เท่านั้น' });
  next();
}

module.exports = { auth, adminOnly };
