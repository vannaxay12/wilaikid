// ເພີ່ມ code ນີ້ໃນ backend/routes/auth.js ກ່ອນ module.exports

router.post('/change-password', auth, async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    if (!old_password || !new_password)
      return res.status(400).json({ message: 'ກະລຸນາກໍ່ລ໌ຂໍ້ມູນໃຫ້ຄົບ' });
    if (new_password.length < 6)
      return res.status(400).json({ message: 'ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ' });

    const [[emp]] = await db.query(
      'SELECT * FROM employees WHERE employee_id = ?', [req.user.id]
    );
    const ok = await bcrypt.compare(old_password, emp.password_hash);
    if (!ok) return res.status(400).json({ message: 'ລະຫັດຜ່ານເກົ່າບໍ່ຖືກຕ້ອງ' });

    const hash = await bcrypt.hash(new_password, 10);
    await db.query('UPDATE employees SET password_hash=? WHERE employee_id=?',
      [hash, req.user.id]);
    res.json({ message: 'ປ່ຽນລະຫັດຜ່ານສຳເລັດ' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});
