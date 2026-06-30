const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, async(_,res)=>{
  const [r]=await db.query('SELECT employee_id,first_name,last_name,phone,username,role,hire_date,is_active FROM employees ORDER BY first_name');
  res.json(r);
});
router.post('/', auth, adminOnly, async(req,res)=>{
  try {
    const { first_name,last_name,phone,username,password,role,hire_date } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const [r] = await db.query(
      'INSERT INTO employees (first_name,last_name,phone,username,password_hash,role,hire_date) VALUES (?,?,?,?,?,?,?)',
      [first_name,last_name,phone,username,hash,role,hire_date]
    );
    res.status(201).json({ employee_id: r.insertId });
  } catch(e) { res.status(500).json({ message: e.message }); }
});
router.put('/:id', auth, adminOnly, async(req,res)=>{
  try {
    const { first_name,last_name,phone,role,is_active,password } = req.body;
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      await db.query('UPDATE employees SET first_name=?,last_name=?,phone=?,role=?,is_active=?,password_hash=? WHERE employee_id=?',
        [first_name,last_name,phone,role,is_active,hash,req.params.id]);
    } else {
      await db.query('UPDATE employees SET first_name=?,last_name=?,phone=?,role=?,is_active=? WHERE employee_id=?',
        [first_name,last_name,phone,role,is_active,req.params.id]);
    }
    res.json({ ok: true });
  } catch(e) { res.status(500).json({ message: e.message }); }
});
module.exports = router;
