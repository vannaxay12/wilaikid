// frontend/src/utils/validate.js

// ເບີໂທລາວ: 020/030 + 7-8 ຕົວ ບໍ່ມີ -
export function validatePhone(phone) {
  if (!phone) return null;
  const clean = phone.replace(/-/g, '').trim();
  if (!/^(020|030|021|031)\d{7,8}$/.test(clean)) {
    return 'ເບີໂທຕ້ອງຂຶ້ນຕົ້ນ 020/030 ແລະ ມີ 10-11 ຕົວ';
  }
  return null;
}

// ຊື່/ນາມສະກຸນ: 1-50 ຕົວ
export function validateName(name, label = 'ຊື່') {
  if (!name || !name.trim()) return `${label} ຈຳເປັນ`;
  if (name.trim().length > 50) return `${label} ບໍ່ກາຍ 50 ຕົວ`;
  return null;
}

// Username: 3-25 ຕົວ a-z 0-9 _
export function validateUsername(username) {
  if (!username || !username.trim()) return 'ຊື່ຜູ້ໃຊ້ຈຳເປັນ';
  if (username.length < 3)  return 'ຊື່ຜູ້ໃຊ້ຢ່າງໜ້ອຍ 3 ຕົວ';
  if (username.length > 25) return 'ຊື່ຜູ້ໃຊ້ບໍ່ກາຍ 25 ຕົວ';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'ຊື່ຜູ້ໃຊ້ໃຊ້ໄດ້ສະເພາະ a-z, 0-9, _';
  return null;
}

// Email: ສູງສຸດ 50 ຕົວ
export function validateEmail(email) {
  if (!email) return null;
  if (email.length > 50) return 'ອີເມລບໍ່ກາຍ 50 ຕົວ';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'ຮູບແບບອີເມລບໍ່ຖືກຕ້ອງ';
  return null;
}

// ລະຫັດຜ່ານ: 6-30 ຕົວ
export function validatePassword(password) {
  if (!password) return 'ລະຫັດຜ່ານຈຳເປັນ';
  if (password.length < 6)  return 'ລະຫັດຜ່ານຢ່າງໜ້ອຍ 6 ຕົວ';
  if (password.length > 30) return 'ລະຫັດຜ່ານບໍ່ກາຍ 30 ຕົວ';
  return null;
}

// Format ເບີໂທ — ລົບ - ອອກ
export function formatPhone(phone) {
  return phone ? phone.replace(/-/g, '').trim() : '';
}
