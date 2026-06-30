// categories.js
const r1 = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');
r1.get('/',      auth, async (_,res)=>{ const [r]=await db.query('SELECT * FROM product_categories ORDER BY category_name'); res.json(r); });
r1.post('/',     auth, adminOnly, async(req,res)=>{ const [r]=await db.query('INSERT INTO product_categories SET ?',[req.body]); res.status(201).json({category_id:r.insertId}); });
r1.put('/:id',  auth, adminOnly, async(req,res)=>{ await db.query('UPDATE product_categories SET ? WHERE category_id=?',[req.body,req.params.id]); res.json({ok:true}); });
r1.delete('/:id',auth,adminOnly, async(req,res)=>{ await db.query('DELETE FROM product_categories WHERE category_id=?',[req.params.id]); res.json({ok:true}); });
module.exports = r1;
