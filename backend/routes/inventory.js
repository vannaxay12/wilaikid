const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async(_,res)=>{
  const [r]=await db.query(`SELECT ir.*,CONCAT(e.first_name,' ',e.last_name) AS employee_name
    FROM inventory_receipts ir JOIN employees e ON ir.employee_id=e.employee_id
    ORDER BY ir.received_at DESC LIMIT 100`);
  res.json(r);
});
router.post('/', auth, async(req,res)=>{
  const conn=await db.getConnection();
  try {
    await conn.beginTransaction();
    const { po_id,notes,items } = req.body;
    const d=new Date();
    const receipt_number=`IR-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;
    const [r]=await conn.query(
      'INSERT INTO inventory_receipts (receipt_number,po_id,employee_id,notes) VALUES (?,?,?,?)',
      [receipt_number,po_id||null,req.user.id,notes||null]
    );
    const receipt_id=r.insertId;
    for(const it of items){
      await conn.query(
        'INSERT INTO inventory_receipt_items (receipt_id,product_id,qty_received,unit_cost) VALUES (?,?,?,?)',
        [receipt_id,it.product_id,it.qty_received,it.unit_cost]
      );
      await conn.query('UPDATE products SET stock_qty=stock_qty+? WHERE product_id=?',
        [it.qty_received,it.product_id]);
    }
    if(po_id) await conn.query("UPDATE purchase_orders SET status='received' WHERE po_id=?",[po_id]);
    await conn.commit();
    res.status(201).json({receipt_id,receipt_number});
  } catch(e){ await conn.rollback(); res.status(500).json({message:e.message}); }
  finally{ conn.release(); }
});
module.exports = router;
