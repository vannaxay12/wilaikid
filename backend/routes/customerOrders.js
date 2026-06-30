const router = require('express').Router();
const jwt = require('jsonwebtoken');
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
const SECRET = process.env.JWT_SECRET || 'wilaikid_secret_2025';

function authCustomer(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'ກະລຸນາເຂົ້າສູ່ລະບົບ' });
    try {
        req.customer = jwt.verify(token, SECRET);
        next();
    } catch { res.status(401).json({ message: 'Session ໝົດອາຍຸ' }); }
}

// ── ລູກຄ້າ ────────────────────────────────────────────────
router.get('/', authCustomer, async(req, res) => {
    try {
        const [orders] = await db.query(
            `SELECT o.*, COUNT(i.item_id) AS item_count
       FROM customer_orders o
       LEFT JOIN customer_order_items i ON o.order_id = i.order_id
       WHERE o.customer_id = ?
       GROUP BY o.order_id ORDER BY o.created_at DESC`, [req.customer.id]
        );
        res.json(orders);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/:id', authCustomer, async(req, res) => {
    try {
        const [
            [order]
        ] = await db.query(
            'SELECT * FROM customer_orders WHERE order_id=? AND customer_id=?', [req.params.id, req.customer.id]
        );
        if (!order) return res.status(404).json({ message: 'ບໍ່ພົບ order' });
        const [items] = await db.query(
            `SELECT i.*, p.product_name, p.image FROM customer_order_items i
       JOIN products p ON i.product_id=p.product_id WHERE i.order_id=?`, [req.params.id]
        );
        res.json({...order, items });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', authCustomer, async(req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { items, notes = '', payment_method = 'cash', transfer_ref = '' } = req.body;

        if (!items || !items.length)
            return res.status(400).json({ message: 'ກະຕ່າຫວ່າງເປົ່າ' });
        if (!['cash', 'transfer'].includes(payment_method))
            return res.status(400).json({ message: 'ວິທີຊຳລະບໍ່ຖືກຕ້ອງ' });
        if (payment_method === 'transfer' && !transfer_ref.trim())
            return res.status(400).json({ message: 'ກະລຸນາໃສ່ເລກອ້າງອີງການໂອນ' });

        for (const it of items) {
            const [
                [p]
            ] = await conn.query(
                'SELECT stock_qty, product_name FROM products WHERE product_id=? AND is_active=1', [it.product_id]
            );
            if (!p) throw new Error('ບໍ່ພົບສິນຄ້າ');
            if (p.stock_qty < it.qty)
                throw new Error(`"${p.product_name}" ສາງບໍ່ພໍ (ເຫຼືອ ${p.stock_qty})`);
        }

        const total = items.reduce((s, i) => s + i.qty * i.unit_price, 0);
        const d = new Date();
        const order_number = `ORD-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;

        const [r] = await conn.query(
            `INSERT INTO customer_orders
        (order_number,customer_id,total_amount,payment_method,payment_status,transfer_ref,notes)
       VALUES (?,?,?,?,?,?,?)`, [order_number, req.customer.id, total, payment_method, 'pending',
                transfer_ref || null, notes
            ]
        );
        const order_id = r.insertId;

        for (const it of items) {
            await conn.query(
                'INSERT INTO customer_order_items (order_id,product_id,qty,unit_price) VALUES (?,?,?,?)', [order_id, it.product_id, it.qty, it.unit_price]
            );
        }

        const points = Math.floor(total / 1000);
        if (points > 0) {
            await conn.query(
                'UPDATE customers SET points=points+? WHERE customer_id=?', [points, req.customer.id]
            );
        }

        await conn.commit();
        res.status(201).json({ order_id, order_number, total, points_earned: points, payment_method });
    } catch (e) {
        await conn.rollback();
        res.status(400).json({ message: e.message });
    } finally { conn.release(); }
});

// ── ADMIN ────────────────────────────────────────────────
// GET /api/customer-orders/admin/all — ດຶງທຸກ order ສຳລັບ admin
router.get('/admin/all', auth, adminOnly, async(req, res) => {
    try {
        const { status } = req.query;
        let sql = `
      SELECT o.*, c.first_name, c.last_name, c.phone, c.username,
        COUNT(i.item_id) AS item_count
      FROM customer_orders o
      JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN customer_order_items i ON o.order_id = i.order_id
      WHERE 1=1`;
        const params = [];
        if (status) {
            sql += ' AND o.status = ?';
            params.push(status);
        }
        sql += ' GROUP BY o.order_id ORDER BY o.created_at DESC';
        const [rows] = await db.query(sql, params);
        res.json(rows);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/customer-orders/admin/:id — ລາຍລະອຽດ order ສຳລັບ admin
router.get('/admin/:id', auth, adminOnly, async(req, res) => {
    try {
        const [
            [order]
        ] = await db.query(
            `SELECT o.*, c.first_name, c.last_name, c.phone, c.email, c.username
       FROM customer_orders o
       JOIN customers c ON o.customer_id = c.customer_id
       WHERE o.order_id = ?`, [req.params.id]
        );
        if (!order) return res.status(404).json({ message: 'ບໍ່ພົບ order' });
        const [items] = await db.query(
            `SELECT i.*, p.product_name, p.image, p.barcode FROM customer_order_items i
       JOIN products p ON i.product_id=p.product_id WHERE i.order_id=?`, [req.params.id]
        );
        res.json({...order, items });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/customer-orders/admin/:id/status — ປ່ຽນສະຖານະ
router.post('/admin/:id/status', auth, adminOnly, async(req, res) => {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        const { status, payment_status } = req.body;
        const validStatus = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (status && !validStatus.includes(status))
            return res.status(400).json({ message: 'ສະຖານະບໍ່ຖືກຕ້ອງ' });

        const [
            [order]
        ] = await conn.query(
            'SELECT * FROM customer_orders WHERE order_id=?', [req.params.id]
        );
        if (!order) return res.status(404).json({ message: 'ບໍ່ພົບ order' });

        // ຖ້າຍືນຍັນ → ຕັດສາງ
        if (status === 'confirmed' && order.status === 'pending') {
            const [items] = await conn.query(
                'SELECT * FROM customer_order_items WHERE order_id=?', [req.params.id]
            );
            for (const it of items) {
                const [
                    [p]
                ] = await conn.query(
                    'SELECT stock_qty FROM products WHERE product_id=?', [it.product_id]
                );
                if (p.stock_qty < it.qty) {
                    throw new Error(`ສາງສິນຄ້າບໍ່ພໍ (product_id ${it.product_id})`);
                }
                await conn.query(
                    'UPDATE products SET stock_qty = stock_qty - ? WHERE product_id=?', [it.qty, it.product_id]
                );
            }
        }

        const updates = [];
        const params = [];
        if (status) {
            updates.push('status=?');
            params.push(status);
        }
        if (payment_status) {
            updates.push('payment_status=?');
            params.push(payment_status);
        }
        params.push(req.params.id);

        if (updates.length) {
            await conn.query(
                `UPDATE customer_orders SET ${updates.join(',')} WHERE order_id=?`,
                params
            );
        }

        await conn.commit();
        res.json({ ok: true });
    } catch (e) {
        await conn.rollback();
        res.status(400).json({ message: e.message });
    } finally { conn.release(); }
});

module.exports = router;