const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async(req,res)=>{
  const { status } = req.query;
  let sql=`SELECT po.*,s.supplier_name,CONCAT(e.first_name,' ',e.last_name) AS employee_name
           FROM purchase_orders po
           JOIN suppliers s ON po.supplier_id=s.supplier_id
           JOIN employees e ON po.employee_id=e.employee_id WHERE 1=1`;
  const p=[];
  if(status){ sql+=' AND po.status=?'; p.push(status); }
  sql+=' ORDER BY po.order_date DESC';
  const [r]=await db.query(sql,p); res.json(r);
});
router.get('/:id', auth, async(req,res)=>{
  const [[po]]=await db.query('SELECT * FROM purchase_orders WHERE po_id=?',[req.params.id]);
  if(!po) return res.status(404).json({message:'ไม่พบ'});
  const [items]=await db.query(
    `SELECT poi.*,p.product_name FROM purchase_order_items poi
     JOIN products p ON poi.product_id=p.product_id WHERE poi.po_id=?`,[req.params.id]
  );
  res.json({...po,items});
});
router.post('/', auth, adminOnly, async(req,res)=>{
  const conn=await db.getConnection();
  try {
    await conn.beginTransaction();
    const { supplier_id,order_date,expected_date,notes,items } = req.body;
    const d=new Date();
    const po_number=`PO-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Date.now().toString().slice(-4)}`;
    const [r]=await conn.query(
      'INSERT INTO purchase_orders (po_number,supplier_id,employee_id,order_date,expected_date,notes) VALUES (?,?,?,?,?,?)',
      [po_number,supplier_id,req.user.id,order_date,expected_date||null,notes||null]
    );
    const po_id=r.insertId;
    for(const it of items){
      await conn.query('INSERT INTO purchase_order_items (po_id,product_id,qty_ordered,unit_cost) VALUES (?,?,?,?)',
        [po_id,it.product_id,it.qty_ordered,it.unit_cost]);
    }
    await conn.commit();
    res.status(201).json({po_id,po_number});
  } catch(e){ await conn.rollback(); res.status(500).json({message:e.message}); }
  finally{ conn.release(); }
});
router.put('/:id/status', auth, adminOnly, async(req,res)=>{
  await db.query('UPDATE purchase_orders SET status=? WHERE po_id=?',[req.body.status,req.params.id]);
  res.json({ok:true});
});
module.exports = router;
