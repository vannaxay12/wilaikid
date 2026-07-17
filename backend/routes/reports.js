const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

// Dashboard
router.get('/dashboard', auth, adminOnly, async(_, res) => {
    try {
        const today = new Date().toISOString().slice(0, 10);
        const [
            [todaySales]
        ] = await db.query(`SELECT COALESCE(SUM(total_amount),0) AS revenue,COUNT(*) AS bills FROM sales WHERE DATE(sale_datetime)=?`, [today]);
        const [
            [monthSales]
        ] = await db.query(`SELECT COALESCE(SUM(total_amount),0) AS revenue FROM sales WHERE MONTH(sale_datetime)=MONTH(NOW()) AND YEAR(sale_datetime)=YEAR(NOW())`);
        const [
            [lowStock]
        ] = await db.query(`SELECT COUNT(*) AS cnt FROM products WHERE stock_qty<=min_stock_level AND is_active=1`);
        const [
            [totalProd]
        ] = await db.query(`SELECT COUNT(*) AS cnt FROM products WHERE is_active=1`);
        // ປ່ຽນໃນ routes/reports.js ບ່ອນ topProducts:
        const [topProducts] = await db.query(`
  SELECT 
    p.product_name,
    CAST(SUM(si.qty) AS SIGNED) AS qty_sold,
    CAST(SUM(si.qty * si.unit_price) AS DOUBLE) AS revenue
  FROM sale_items si 
  JOIN products p ON si.product_id = p.product_id 
  GROUP BY si.product_id 
  ORDER BY revenue DESC 
  LIMIT 5
`);
        // ປ່ຽນໃນ routes/reports.js ບ່ອນ dailyChart:
        const [dailyChart] = await db.query(`
  SELECT 
    DATE_FORMAT(sale_datetime, '%Y-%m-%d') AS day, 
    CAST(SUM(total_amount) AS DOUBLE) AS revenue
  FROM sales 
  WHERE sale_datetime >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
  GROUP BY DATE(sale_datetime) 
  ORDER BY day ASC
`);
        res.json({ today: todaySales, month: monthSales, lowStock: lowStock.cnt, totalProducts: totalProd.cnt, topProducts, dailyChart });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Income/Expense
router.get('/income-expense', auth, adminOnly, async(req, res) => {
    try {
        const { period = 'month' } = req.query;
        const grp = period === 'day' ? "DATE(sale_datetime)" : period === 'year' ? "YEAR(sale_datetime)" : "DATE_FORMAT(sale_datetime,'%Y-%m')";
        const [income] = await db.query(`SELECT ${grp} AS period,SUM(total_amount) AS income,SUM(discount) AS total_discount FROM sales GROUP BY ${grp} ORDER BY period DESC LIMIT 24`);
        const grp2 = period === 'day' ? "DATE(ir.received_at)" : period === 'year' ? "YEAR(ir.received_at)" : "DATE_FORMAT(ir.received_at,'%Y-%m')";
        const [expense] = await db.query(`SELECT ${grp2} AS period,SUM(rii.subtotal) AS expense
      FROM inventory_receipt_items rii JOIN inventory_receipts ir ON rii.receipt_id=ir.receipt_id
      GROUP BY ${grp2} ORDER BY period DESC LIMIT 24`);
        res.json({ income, expense });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// Stock
router.get('/stock', auth, adminOnly, async(_, res) => {
    try {
        // ປ່ຽນ Query ໃນ router.get('/stock') ໃຫ້ເປັນແບບນີ້:
        const [rows] = await db.query(`
  SELECT p.product_id, p.product_name, p.stock_qty, p.min_stock_level,
    p.selling_price, p.image, c.category_name, u.unit_abbr,
    CASE
      WHEN p.stock_qty = 0                 THEN 'ໝົດ'
      WHEN p.stock_qty <= p.min_stock_level  THEN 'ຕ່ຳ'
      WHEN p.stock_qty <= 35                 THEN 'ກາງ'
      ELSE 'ສູງ'
    END AS stock_status
  FROM products p
  JOIN product_categories c ON p.category_id=c.category_id
  JOIN units u ON p.unit_id=u.unit_id
  WHERE p.is_active=1
  ORDER BY 
    CASE
      WHEN p.stock_qty = 0                 THEN 1
      WHEN p.stock_qty <= p.min_stock_level  THEN 2
      WHEN p.stock_qty <= 35                 THEN 3
      ELSE 4
    END, 
    p.product_name
`);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ລາຍງານພະນັກງານ
router.get('/employees', auth, adminOnly, async(_, res) => {
    try {
        const [rows] = await db.query(`
      SELECT employee_id, first_name, last_name, phone, username, role,
             hire_date, is_active, approval_status, created_at
      FROM employees ORDER BY role, first_name`);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ລາຍງານໃບສັ່ງຊື້
router.get('/purchases', auth, adminOnly, async(req, res) => {
    try {
        const { from, to } = req.query;
        let sql = `SELECT po.*, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
      COUNT(poi.po_item_id) AS item_count
      FROM purchase_orders po
      JOIN employees e ON po.employee_id=e.employee_id
      LEFT JOIN purchase_order_items poi ON po.po_id=poi.po_id
      WHERE 1=1`;
        const p = [];
        if (from) {
            sql += ' AND po.order_date>=?';
            p.push(from);
        }
        if (to) {
            sql += ' AND po.order_date<=?';
            p.push(to);
        }
        sql += ' GROUP BY po.po_id ORDER BY po.order_date DESC';
        const [rows] = await db.query(sql, p);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ລາຍງານນຳເຂົ້າສິນຄ້າ
router.get('/inventory', auth, adminOnly, async(req, res) => {
    try {
        const { from, to } = req.query;
        let sql = `SELECT ir.*, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
      SUM(rii.subtotal) AS total_cost, COUNT(rii.ri_item_id) AS item_count
      FROM inventory_receipts ir
      JOIN employees e ON ir.employee_id=e.employee_id
      LEFT JOIN inventory_receipt_items rii ON ir.receipt_id=rii.receipt_id
      WHERE 1=1`;
        const p = [];
        if (from) {
            sql += ' AND DATE(ir.received_at)>=?';
            p.push(from);
        }
        if (to) {
            sql += ' AND DATE(ir.received_at)<=?';
            p.push(to);
        }
        sql += ' GROUP BY ir.receipt_id ORDER BY ir.received_at DESC';
        const [rows] = await db.query(sql, p);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// ລາຍງານການຂາຍ
router.get('/sales', auth, adminOnly, async(req, res) => {
    try {
        const { from, to } = req.query;
        let sql = `SELECT s.*, CONCAT(e.first_name,' ',e.last_name) AS cashier
      FROM sales s JOIN employees e ON s.employee_id=e.employee_id WHERE 1=1`;
        const p = [];
        if (from) {
            sql += ' AND DATE(s.sale_datetime)>=?';
            p.push(from);
        }
        if (to) {
            sql += ' AND DATE(s.sale_datetime)<=?';
            p.push(to);
        }
        sql += ' ORDER BY s.sale_datetime DESC LIMIT 200';
        const [rows] = await db.query(sql, p);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;