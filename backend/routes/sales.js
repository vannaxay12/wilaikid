const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const { items, discount=0, amount_paid, payment_method='cash' } = req.body;

    for (const item of items) {
      const [[p]] = await conn.query(
        'SELECT stock_qty, product_name FROM products WHERE product_id=? AND is_active=1', [item.product_id]
      );
      if (!p) throw new Error(`ไม่พบสินค้า ID ${item.product_id}`);
      if (p.stock_qty < item.qty)
        throw new Error(`"${p.product_name}" สต็อกไม่พอ (เหลือ ${p.stock_qty})`);
    }

    const subtotal      = items.reduce((s,i) => s + i.qty*i.unit_price, 0);
    const total_amount  = subtotal - Number(discount);
    const change_amount = Number(amount_paid) - total_amount;
    const d = new Date(); 
    const receipt_number = `RCP-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-5)}`;

    const [sr] = await conn.query(
      `INSERT INTO sales (receipt_number,employee_id,subtotal,discount,total_amount,amount_paid,change_amount,payment_method)
       VALUES (?,?,?,?,?,?,?,?)`,
      [receipt_number, req.user.id, subtotal, discount, total_amount, amount_paid, change_amount, payment_method]
    );
    const sale_id = sr.insertId;

    for (const item of items) {
      await conn.query(
        'INSERT INTO sale_items (sale_id,product_id,qty,unit_price) VALUES (?,?,?,?)',
        [sale_id, item.product_id, item.qty, item.unit_price]
      );
      await conn.query(
        'UPDATE products SET stock_qty=stock_qty-? WHERE product_id=?', [item.qty, item.product_id]
      );
    }

    await conn.commit();
    res.status(201).json({ sale_id, receipt_number, total_amount, change_amount });
  } catch (e) {
    await conn.rollback();
    res.status(400).json({ message: e.message });
  } finally { conn.release(); }
});

router.get('/', auth, async (req, res) => {
  try {
    const { from, to, limit=100 } = req.query;
    let sql = `SELECT s.sale_id,s.receipt_number,s.sale_datetime,s.total_amount,s.payment_method,
               CONCAT(e.first_name,' ',e.last_name) AS cashier
               FROM sales s JOIN employees e ON s.employee_id=e.employee_id WHERE 1=1`;
    const p = [];
    if (from) { sql+=' AND DATE(s.sale_datetime)>=?'; p.push(from); }
    if (to)   { sql+=' AND DATE(s.sale_datetime)<=?'; p.push(to); }
    sql += ' ORDER BY s.sale_datetime DESC LIMIT ?';
    p.push(Number(limit));
    const [rows] = await db.query(sql, p);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [[sale]] = await db.query(
      `SELECT s.*,CONCAT(e.first_name,' ',e.last_name) AS cashier
       FROM sales s JOIN employees e ON s.employee_id=e.employee_id WHERE s.sale_id=?`, [req.params.id]
    );
    if (!sale) return res.status(404).json({ message: 'ไม่พบบิล' });
    const [items] = await db.query(
      `SELECT si.*,p.product_name,p.barcode,u.unit_abbr FROM sale_items si
       JOIN products p ON si.product_id=p.product_id
       LEFT JOIN units u ON p.unit_id=u.unit_id WHERE si.sale_id=?`, [req.params.id]
    );
    res.json({ ...sale, items });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
