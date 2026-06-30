const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const SECRET = process.env.JWT_SECRET || 'wilaikid_secret_2025';

// Validation backend
function validate(data) {
  const { first_name, last_name, phone, email, username, password } = data;
  if (!first_name || first_name.trim().length < 1) return 'ຊື່ຈຳເປັນ';
  if (first_name.trim().length > 50) return 'ຊື່ບໍ່ກາຍ 50 ຕົວ';
  if (!last_name  || last_name.trim().length  < 1) return 'ນາມສະກຸນຈຳເປັນ';
  if (last_name.trim().length > 50) return 'ນາມສະກຸນບໍ່ກາຍ 50 ຕົວ';
  if (phone) {
    const clean = phone.replace(/-/g,'');
    if (!/^(020|030|021|031)\d{7,8}$/.test(clean)) return 'ເບີໂທບໍ່ຖືກຕ້ອງ';
  }
  if (email && email.length > 50) return 'ອີເມລບໍ່ກາຍ 50 ຕົວ';
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'ຮູບແບບອີເມລບໍ່ຖືກຕ້ອງ';
  if (!username || username.length < 3) return 'ຊື່ຜູ້ໃຊ້ຢ່າງໜ້ອຍ 3 ຕົວ';
  if (username.length > 25) return 'ຊື່ຜູ້ໃຊ້ບໍ່ກາຍ 25 ຕົວ';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'ຊື່ຜູ້ໃຊ້ໃຊ້ໄດ້ a-z, 0-9, _ ເທົ່ານັ້ນ';
  if (password && password.length < 6)  return 'ລະຫັດຜ່ານຢ່າງໜ້ອຍ 6 ຕົວ';
  if (password && password.length > 30) return 'ລະຫັດຜ່ານບໍ່ກາຍ 30 ຕົວ';
  return null;
}

// POST /api/customers/register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, phone, email, username, password } = req.body;
    const err = validate({ first_name, last_name, phone, email, username, password });
    if (err) return res.status(400).json({ message: err });

    const [exist] = await db.query(
      'SELECT customer_id FROM customers WHERE username = ?', [username]
    );
    if (exist.length) return res.status(409).json({ message: 'ຊື່ຜູ້ໃຊ້ນີ້ຖືກໃຊ້ແລ້ວ' });

    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      `INSERT INTO customers (first_name, last_name, phone, email, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name.trim(), last_name.trim(), phone||null, email||null, username.trim(), hash]
    );
    res.status(201).json({ message: 'ສະໝັກສຳເລັດ', customer_id: r.insertId });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/customers/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'ກະລຸນາໃສ່ຊື່ຜູ້ໃຊ້ ແລະ ລະຫັດຜ່ານ' });

    const [rows] = await db.query(
      'SELECT * FROM customers WHERE username = ? AND is_active = 1', [username]
    );
    if (!rows.length)
      return res.status(401).json({ message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' });

    const cust = rows[0];
    const ok   = await bcrypt.compare(password, cust.password_hash);
    if (!ok)
      return res.status(401).json({ message: 'ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ' });

    const token = jwt.sign(
      { id: cust.customer_id, username: cust.username, role: 'customer',
        name: `${cust.first_name} ${cust.last_name}` },
      SECRET, { expiresIn: '8h' }
    );
    res.json({ token, role: 'customer', name: `${cust.first_name} ${cust.last_name}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/customers/me
router.get('/me', async (req, res) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
    const payload = jwt.verify(token, SECRET);
    const [[cust]] = await db.query(
      'SELECT customer_id,first_name,last_name,phone,email,username,points,created_at FROM customers WHERE customer_id=?',
      [payload.id]
    );
    if (!cust) return res.status(404).json({ message: 'ບໍ່ພົບຜູ້ໃຊ້' });
    res.json(cust);
  } catch (e) { res.status(401).json({ message: 'token ບໍ່ຖືກຕ້ອງ' }); }
});

module.exports = router;
