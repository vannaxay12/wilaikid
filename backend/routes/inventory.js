const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

// GET /api/inventory
router.get('/', auth, async(req, res) => {
    try {
        const [rows] = await db.query(`
      SELECT ir.*, CONCAT(e.first_name,' ',e.last_name) AS employee_name,
        SUM(rii.subtotal) AS total_cost, COUNT(rii.ri_item_id) AS item_count
      FROM inventory_receipts ir
      JOIN employees e ON ir.employee_id = e.employee_id
      LEFT JOIN inventory_receipt_items rii ON ir.receipt_id = rii.receipt_id
      GROUP BY ir.receipt_id
      ORDER BY ir.received_at DESC`);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/inventory/:id
router.get('/:id', auth, async(req, res) => {
    try {
        const [
            [receipt]
        ] = await db.query(
            `SELECT ir.*, CONCAT(e.first_name,' ',e.last_name) AS employee_name
       FROM inventory_receipts ir
       JOIN employees e ON ir.employee_id = e.employee_id
       WHERE ir.receipt_id = ?`, [req.params.id]
        );
        if (!receipt) return res.status(404).json({ message: 'ບໍ່ພົບ' });
        const [items] = await db.query(
            `SELECT rii.*, p.product_name FROM inventory_receipt_items rii
       JOIN products p ON rii.product_id = p.product_id
       WHERE rii.receipt_id = ?`, [req.params.id]
        );
        res.json({...receipt, items });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/inventory
router.post('/', auth, async(req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { items, notes = '', po_id = null } = req.body;

        if (!items || !items.length)
            return res.status(400).json({ message: 'ກະລຸນາໃສ່ລາຍການສິນຄ້າ' });

        // ສ້າງເລກທີໃບຮັບ
        const d = new Date();
        const receipt_number = `RCV-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;

        const [r] = await conn.query(
            `INSERT INTO inventory_receipts (receipt_number, po_id, employee_id, notes)
       VALUES (?, ?, ?, ?)`, [receipt_number, po_id, req.user.id, notes]
        );
        const receipt_id = r.insertId;

        for (const it of items) {
            await conn.query(
                `INSERT INTO inventory_receipt_items (receipt_id, product_id, qty_received, unit_cost)
         VALUES (?, ?, ?, ?)`, [receipt_id, it.product_id, it.qty_received, it.unit_cost]
            );
            // ເພີ່ມສາງ + ອັບເດດລາຄາທຶນ
            await conn.query(
                `UPDATE products SET stock_qty = stock_qty + ?, cost_price = ?
         WHERE product_id = ?`, [it.qty_received, it.unit_cost, it.product_id]
            );
        }

        await conn.commit();
        res.status(201).json({ receipt_id, receipt_number });
    } catch (e) {
        await conn.rollback();
        res.status(500).json({ message: e.message });
    } finally { conn.release(); }
});

module.exports = router;