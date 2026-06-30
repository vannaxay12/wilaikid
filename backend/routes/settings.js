const router  = require('express').Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const db      = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

const QR_DIR = path.join(__dirname, '..', 'uploads', 'qr');
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive:true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, QR_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req.params.bank}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2*1024*1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const ok  = ['.jpg','.jpeg','.png','.webp'].includes(ext);
    ok ? cb(null, true) : cb(new Error('ອະນຸຍາດ JPG, PNG ເທົ່ານັ້ນ'));
  }
});

// GET /api/settings
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT `key`, `value` FROM shop_settings');
    const obj = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/settings/qr/:bank  — ຕ້ອງມາກ່ອນ /:key
router.post('/qr/:bank', auth, adminOnly, upload.single('qr'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'ກະລຸນາເລືອກຮູບ QR' });

    const qrUrl = `/uploads/qr/${req.file.filename}`;
    const settingKey = `qr_${req.params.bank}`;

    // ລົບຮູບເກົ່າ
    const [[old]] = await db.query(
      'SELECT `value` FROM shop_settings WHERE `key`=?', [settingKey]
    );
    if (old && old.value) {
      const oldPath = path.join(__dirname, '..', old.value);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await db.query(
      'INSERT INTO shop_settings (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?',
      [settingKey, qrUrl, qrUrl]
    );
    res.json({ ok: true, qrUrl });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/settings/:key  — ອັບເດດ setting ທົ່ວໄປ
router.post('/:key', auth, adminOnly, async (req, res) => {
  try {
    const val = req.body.value !== undefined ? req.body.value : '';
    await db.query(
      'INSERT INTO shop_settings (`key`, `value`) VALUES (?,?) ON DUPLICATE KEY UPDATE `value`=?',
      [req.params.key, val, val]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
