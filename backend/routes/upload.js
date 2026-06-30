const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { auth } = require('../middleware/auth');

const PROFILE_DIR = path.join(__dirname, '..', 'uploads', 'profiles');
const PRODUCT_DIR = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(PROFILE_DIR)) fs.mkdirSync(PROFILE_DIR, { recursive: true });
if (!fs.existsSync(PRODUCT_DIR)) fs.mkdirSync(PRODUCT_DIR, { recursive: true });

function makeStorage(dir, prefix) {
    return multer.diskStorage({
        destination: (req, file, cb) => cb(null, dir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname).toLowerCase();
            cb(null, prefix + '_' + Date.now() + ext);
        }
    });
}

const fileFilter = (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) { cb(null, true); } else { cb(new Error('ອະນຸຍາດ JPG, PNG, WEBP ເທົ່ານັ້ນ')); }
};

const uploadProfile = multer({ storage: makeStorage(PROFILE_DIR, 'emp'), limits: { fileSize: 3 * 1024 * 1024 }, fileFilter });
const uploadProduct = multer({ storage: makeStorage(PRODUCT_DIR, 'prod'), limits: { fileSize: 3 * 1024 * 1024 }, fileFilter });

router.post('/profile', auth, uploadProfile.single('image'), async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'ກະລຸນາເລືອກຮູບ' });
        const imageUrl = '/uploads/profiles/' + req.file.filename;
        const rows = await db.query('SELECT profile_image FROM employees WHERE employee_id=?', [req.user.id]);
        const emp = rows[0][0];
        if (emp && emp.profile_image) {
            const old = path.join(__dirname, '..', emp.profile_image);
            if (fs.existsSync(old)) fs.unlinkSync(old);
        }
        await db.query('UPDATE employees SET profile_image=? WHERE employee_id=?', [imageUrl, req.user.id]);
        res.json({ message: 'ອັບໂຫລດສຳເລັດ', imageUrl });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get('/me', auth, async(req, res) => {
    try {
        const rows = await db.query(
            'SELECT employee_id,first_name,last_name,phone,username,role,profile_image FROM employees WHERE employee_id=?', [req.user.id]
        );
        res.json(rows[0][0]);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/product', auth, uploadProduct.single('image'), async(req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'ກະລຸນາເລືອກຮູບ' });
        const product_id = req.body.product_id;
        if (!product_id) return res.status(400).json({ message: 'ບໍ່ມີ product_id' });

        const imageUrl = '/uploads/products/' + req.file.filename;

        const rows = await db.query('SELECT image FROM products WHERE product_id=?', [product_id]);
        const prod = rows[0][0];
        if (prod && prod.image) {
            const old = path.join(__dirname, '..', prod.image);
            if (fs.existsSync(old)) fs.unlinkSync(old);
        }

        await db.query('UPDATE products SET image=? WHERE product_id=?', [imageUrl, product_id]);
        res.json({ message: 'ອັບໂຫລດສຳເລັດ', imageUrl });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;