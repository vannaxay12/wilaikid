const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');

const SECRET = process.env.JWT_SECRET || 'wilaikid_secret_2025';

// POST /api/customers/register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, phone, email, username, password } = req.body;
    if (!first_name || !last_name || !username || !password)
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    if (password.length < 6)
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });

    // ตรวจ username ซ้ำ
    const [exist] = await db.query(
      'SELECT customer_id FROM customers WHERE username = ?', [username]
    );
    if (exist.length)
      return res.status(409).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO customers (first_name, last_name, phone, email, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, phone||null, email||null, username, hash]
    );
    res.status(201).json({
      message: 'สมัครสำเร็จ! สามารถเข้าสู่ระบบได้เลย',
      customer_id: r.insertId
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/customers/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'กรุณากรอก username และ password' });

    const [rows] = await db.query(
      'SELECT * FROM customers WHERE username = ? AND is_active = 1', [username]
    );
    if (!rows.length)
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

    const cust = rows[0];
    const ok   = await bcrypt.compare(password, cust.password_hash);
    if (!ok)
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });

    const token = jwt.sign(
      { id: cust.customer_id, username: cust.username, role: 'customer',
        name: `${cust.first_name} ${cust.last_name}` },
      SECRET, { expiresIn: '8h' }
    );
    res.json({
      token, role: 'customer',
      name: `${cust.first_name} ${cust.last_name}`
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/customers/me
router.get('/me', async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'ไม่มี token' });
    const payload = jwt.verify(token, SECRET);
    const [[cust]] = await db.query(
      'SELECT customer_id,first_name,last_name,phone,email,username,created_at FROM customers WHERE customer_id=?',
      [payload.id]
    );
    if (!cust) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    res.json(cust);
  } catch (e) { res.status(401).json({ message: 'token ไม่ถูกต้อง' }); }
});

module.exports = router;
