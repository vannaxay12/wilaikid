const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, async(_,res)=>{ 
  const [r]=await db.query('SELECT * FROM suppliers WHERE is_active=1 ORDER BY supplier_name'); 
  res.json(r); 
});
router.post('/', auth, adminOnly, async(req,res)=>{ 
  const [r]=await db.query('INSERT INTO suppliers SET ?',[req.body]); 
  res.status(201).json({supplier_id:r.insertId}); 
});
router.put('/:id', auth, adminOnly, async(req,res)=>{ 
  await db.query('UPDATE suppliers SET ? WHERE supplier_id=?',[req.body,req.params.id]); 
  res.json({ok:true}); 
});
router.delete('/:id', auth, adminOnly, async(req,res)=>{ 
  await db.query('UPDATE suppliers SET is_active=0 WHERE supplier_id=?',[req.params.id]); 
  res.json({ok:true}); 
});

module.exports = router;
