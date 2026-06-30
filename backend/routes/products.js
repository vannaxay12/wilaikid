const router = require('express').Router();
const db     = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'wilaikid_secret_2025';

// Middleware ທີ່ຍອມຮັບທັງ employee ແລະ customer token
function authAny(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Session ໝົດອາຍຸ' });
  }
}

// GET /api/products
router.get('/', authAny, async (req, res) => {
  try {
    const { search, low_stock } = req.query;
    let sql = `
      SELECT p.*, c.category_name, u.unit_abbr,
        CASE WHEN p.stock_qty <= p.min_stock_level THEN 1 ELSE 0 END AS is_low
      FROM products p
      LEFT JOIN product_categories c ON p.category_id = c.category_id
      LEFT JOIN units u ON p.unit_id = u.unit_id
      WHERE p.is_active = 1`;
    const params = [];
    if (search) {
      sql += ' AND (p.product_name LIKE ? OR p.barcode LIKE ? OR c.category_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (low_stock) sql += ' AND p.stock_qty <= p.min_stock_level';
    sql += ' ORDER BY p.product_name';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/products/barcode/:code
router.get('/barcode/:code', authAny, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.*, u.unit_abbr FROM products p
       LEFT JOIN units u ON p.unit_id = u.unit_id
       WHERE p.barcode = ? AND p.is_active = 1`, [req.params.code]
    );
    if (!rows.length) return res.status(404).json({ message: 'ບໍ່ພົບສິນຄ້າ' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/products/:id
router.get('/:id', authAny, async (req, res) => {
  try {
    const [r] = await db.query('SELECT * FROM products WHERE product_id = ?', [req.params.id]);
    if (!r.length) return res.status(404).json({ message: 'ບໍ່ພົບ' });
    res.json(r[0]);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/products (admin only)
router.post('/', auth, adminOnly, async (req, res) => {
  try {
    const { barcode,product_name,category_id,unit_id,cost_price,selling_price,stock_qty,min_stock_level,expiry_date } = req.body;
    const [r] = await db.query(
      `INSERT INTO products (barcode,product_name,category_id,unit_id,cost_price,selling_price,stock_qty,min_stock_level,expiry_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [barcode||null,product_name,category_id,unit_id,cost_price,selling_price,stock_qty||0,min_stock_level||5,expiry_date||null]
    );
    res.status(201).json({ product_id: r.insertId });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/products/:id (admin only)
router.put('/:id', auth, adminOnly, async (req, res) => {
  try {
    const { barcode,product_name,category_id,unit_id,cost_price,selling_price,min_stock_level,expiry_date } = req.body;
    await db.query(
      `UPDATE products SET barcode=?,product_name=?,category_id=?,unit_id=?,
       cost_price=?,selling_price=?,min_stock_level=?,expiry_date=? WHERE product_id=?`,
      [barcode||null,product_name,category_id,unit_id,cost_price,selling_price,min_stock_level||5,expiry_date||null,req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/products/:id (admin only)
router.delete('/:id', auth, adminOnly, async (req, res) => {
  try {
    await db.query('UPDATE products SET is_active=0 WHERE product_id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
