const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');
router.get('/', auth, async(_,res)=>{ const [r]=await db.query('SELECT * FROM units ORDER BY unit_name'); res.json(r); });
module.exports = router;
