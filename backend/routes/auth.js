const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const SECRET = process.env.JWT_SECRET || 'wilaikid_secret_2025';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ message: 'กรุณากรอก username และ password' });
    const [rows] = await db.query(
      'SELECT * FROM employees WHERE username = ? AND is_active = 1', [username]
    );
    if (!rows.length)
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    const emp = rows[0];
    if (emp.approval_status === 'pending')
      return res.status(403).json({ message: 'บัญชีรอการอนุมัติจากผู้จัดการ', status: 'pending' });
    if (emp.approval_status === 'rejected')
      return res.status(403).json({ message: `บัญชีถูกปฏิเสธ${emp.reject_reason ? ': ' + emp.reject_reason : ''}`, status: 'rejected' });
    const ok = await bcrypt.compare(password, emp.password_hash);
    if (!ok) return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    const token = jwt.sign(
      { id: emp.employee_id, username: emp.username, role: emp.role, name: `${emp.first_name} ${emp.last_name}` },
      SECRET, { expiresIn: '8h' }
    );
    res.json({ token, role: emp.role, name: `${emp.first_name} ${emp.last_name}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { first_name, last_name, phone, username, password, requested_role = 'cashier' } = req.body;
    if (!first_name || !last_name || !username || !password)
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบ' });
    if (password.length < 6)
      return res.status(400).json({ message: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    if (!['cashier','stock'].includes(requested_role))
      return res.status(400).json({ message: 'ตำแหน่งไม่ถูกต้อง' });
    const [exist] = await db.query('SELECT employee_id FROM employees WHERE username = ?', [username]);
    if (exist.length) return res.status(409).json({ message: 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' });
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO employees (first_name,last_name,phone,username,password_hash,role,requested_role,hire_date,is_active,approval_status)
       VALUES (?,?,?,?,?,?,?,CURDATE(),1,'pending')`,
      [first_name, last_name, phone||null, username, hash, requested_role, requested_role]
    );
    res.status(201).json({ message: 'สมัครสำเร็จ! รอการอนุมัติจากผู้จัดการ' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => res.json(req.user));

// GET /api/auth/pending  (admin)
router.get('/pending', auth, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT employee_id,first_name,last_name,phone,username,requested_role,created_at
       FROM employees WHERE approval_status='pending' ORDER BY created_at ASC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/approve/:id  (admin)
router.post('/approve/:id', auth, adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    const [[emp]] = await db.query('SELECT * FROM employees WHERE employee_id=?', [req.params.id]);
    if (!emp) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    await db.query(
      `UPDATE employees SET approval_status='approved', role=?, approved_by=?, approved_at=NOW() WHERE employee_id=?`,
      [role||emp.requested_role, req.user.id, req.params.id]
    );
    res.json({ message: 'อนุมัติสำเร็จ' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/auth/reject/:id  (admin)
router.post('/reject/:id', auth, adminOnly, async (req, res) => {
  try {
    const { reason='' } = req.body;
    const [[emp]] = await db.query('SELECT * FROM employees WHERE employee_id=?', [req.params.id]);
    if (!emp) return res.status(404).json({ message: 'ไม่พบผู้ใช้' });
    await db.query(
      `UPDATE employees SET approval_status='rejected', reject_reason=?, approved_by=?, approved_at=NOW() WHERE employee_id=?`,
      [reason, req.user.id, req.params.id]
    );
    res.json({ message: 'ปฏิเสธแล้ว' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
