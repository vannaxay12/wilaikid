import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api";
import {
  validatePhone,
  validateName,
  validateUsername,
  validatePassword,
  formatPhone,
} from "../utils/validate";

export default function RegisterEmployee() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    username: "",
    password: "",
    confirm_password: "",
    requested_role: "cashier",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);
  const F = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validate() {
    const errs = {};
    const fn = validateName(form.first_name, "ຊື່");
    const ln = validateName(form.last_name, "ນາມສະກຸນ");
    const ph = validatePhone(form.phone);
    const un = validateUsername(form.username);
    if (fn) errs.first_name = fn;
    if (ln) errs.last_name = ln;
    if (ph) errs.phone = ph;
    if (un) errs.username = un;
    const pw = validatePassword(form.password);
    if (pw) errs.password = pw;
    if (form.password !== form.confirm_password)
      errs.confirm_password = "ລະຫັດຜ່ານບໍ່ຕົງກັນ";
    return errs;
  }

  async function submit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setBusy(true);
    try {
      await api.post("/auth/register", {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        phone: formatPhone(form.phone),
        username: form.username.trim(),
        password: form.password,
        requested_role: form.requested_role,
      });
      setSuccess(true);
    } catch (ex) {
      setErrors({ general: ex.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ" });
    } finally {
      setBusy(false);
    }
  }

  if (success)
    return (
      <div style={BG}>
        <div style={{ ...BOX, textAlign: "center" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>⏳</div>
          <h2 style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: 8 }}>
            ສະໝັກສຳເລັດ!
          </h2>
          <p style={{ color: "#706e66", lineHeight: 1.8, marginBottom: 24 }}>
            ບັນຊີພະນັກງານຂອງທ່ານຖືກສ້າງແລ້ວ
            <br />
            <strong>ລໍຖ້າການອະນຸມັດຈາກຜູ້ຈັດການ</strong>
          </p>
          <button
            className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "11px" }}
            onClick={() => nav("/login")}
          >
            ກັບໜ້າ Login
          </button>
        </div>
      </div>
    );

  return (
    <div style={BG}>
      <div style={BOX}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 36, marginBottom: 6 }}>👔</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700 }}>ສະໝັກພະນັກງານ</h1>
          <p style={{ color: "#706e66", fontSize: ".85rem", marginTop: 4 }}>
            ຮ້ານຂາຍເຄື່ອງວິໄລຄິດ
          </p>
          <div
            style={{
              display: "inline-block",
              background: "#fff3cd",
              color: "#856404",
              borderRadius: 20,
              padding: "4px 14px",
              fontSize: ".78rem",
              marginTop: 8,
            }}
          >
            ⏳ ຕ້ອງລໍຖ້າຜູ້ຈັດການອະນຸມັດ
          </div>
        </div>

        {errors.general && <div style={ERR_BOX}>⚠️ {errors.general}</div>}

        <form onSubmit={submit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emp-fn">
                ຊື່ *{" "}
                <span style={{ color: "#aaa", fontWeight: 400 }}>
                  (ສູງສຸດ 30 ຕົວ)
                </span>
              </label>
              <input
                id="emp-fn"
                name="first_name"
                autoComplete="given-name"
                value={form.first_name}
                onChange={(e) => F("first_name", e.target.value)}
                maxLength={30}
                placeholder="ຊື່"
                required
                style={{ borderColor: errors.first_name ? "#c0392b" : "" }}
              />
              {errors.first_name && (
                <div style={ERR_TXT}>{errors.first_name}</div>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="emp-ln">
                ນາມສະກຸນ *{" "}
                <span style={{ color: "#aaa", fontWeight: 400 }}>
                  (ສູງສຸດ 30 ຕົວ)
                </span>
              </label>
              <input
                id="emp-ln"
                name="last_name"
                autoComplete="family-name"
                value={form.last_name}
                onChange={(e) => F("last_name", e.target.value)}
                maxLength={30}
                placeholder="ນາມສະກຸນ"
                required
                style={{ borderColor: errors.last_name ? "#c0392b" : "" }}
              />
              {errors.last_name && (
                <div style={ERR_TXT}>{errors.last_name}</div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emp-ph">
              ເບີໂທ{" "}
              <span style={{ color: "#aaa", fontWeight: 400 }}>
                (020XXXXXXXX)
              </span>
            </label>
            <input
              id="emp-ph"
              name="phone"
              autoComplete="tel"
              value={form.phone}
              onChange={(e) => F("phone", e.target.value.replace(/-/g, ""))}
              maxLength={11}
              placeholder="02XXXXXXXXX"
              inputMode="numeric"
              style={{ borderColor: errors.phone ? "#c0392b" : "" }}
            />
            {errors.phone && <div style={ERR_TXT}>{errors.phone}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="emp-role">ຕຳແໜ່ງທີ່ຕ້ອງການ</label>
            <select
              id="emp-role"
              name="requested_role"
              value={form.requested_role}
              onChange={(e) => F("requested_role", e.target.value)}
            >
              <option value="cashier">💳 ແຄັດເຊຍ</option>
              <option value="stock">📦 ພະນັກງານສາງ</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="emp-un">
              ຊື່ຜູ້ໃຊ້{" "}
              <span style={{ color: "#aaa", fontWeight: 400 }}>
                (a-z, 0-9, _ ສູງສຸດ 25 ຕົວ)
              </span>
            </label>
            <input
              id="emp-un"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) =>
                F(
                  "username",
                  e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                )
              }
              maxLength={25}
              placeholder="username"
              required
              style={{ borderColor: errors.username ? "#c0392b" : "" }}
            />
            <div
              style={{
                fontSize: ".75rem",
                color: form.username.length > 20 ? "#c0392b" : "#aaa",
                marginTop: 3,
              }}
            >
              {form.username.length}/25
            </div>
            {errors.username && <div style={ERR_TXT}>{errors.username}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="emp-pw">ລະຫັດຜ່ານ(6-20 ຕົວ)</label>
              <input
                id="emp-pw"
                name="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => F("password", e.target.value)}
                placeholder="••••••"
                required
                style={{ borderColor: errors.password ? "#c0392b" : "" }}
              />
              {errors.password && <div style={ERR_TXT}>{errors.password}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="emp-cpw">ຢືນຢັນລະຫັດຜ່ານ </label>
              <input
                id="emp-cpw"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                value={form.confirm_password}
                onChange={(e) => F("confirm_password", e.target.value)}
                placeholder="••••••"
                required
                style={{
                  borderColor: errors.confirm_password ? "#c0392b" : "",
                }}
              />
              {errors.confirm_password && (
                <div style={ERR_TXT}>{errors.confirm_password}</div>
              )}
            </div>
          </div>

          <button
            className="btn btn-primary"
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "11px",
              fontSize: "1rem",
            }}
          >
            {busy ? "ກຳລັງສະໝັກ..." : "📝 ສະໝັກພະນັກງານ"}
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: ".84rem",
            color: "#706e66",
          }}
        >
          <Link to="/login" style={{ color: "#1a6b3c", fontWeight: 600 }}>
            ← ກັບໜ້າ Login
          </Link>
          {" · "}
          <Link
            to="/register/customer"
            style={{ color: "#2471a3", fontWeight: 600 }}
          >
            ສະໝັກເປັນລູກຄ້າ
          </Link>
        </div>
      </div>
    </div>
  );
}

const BG = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg,#1a6b3c 0%,#0f3d22 100%)",
  padding: 16,
};
const BOX = {
  width: 480,
  background: "#fff",
  borderRadius: 16,
  padding: "32px 36px",
  boxShadow: "0 20px 60px rgba(0,0,0,.3)",
};
const ERR_BOX = {
  background: "#f8d7da",
  color: "#721c24",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: ".85rem",
  marginBottom: 14,
};
const ERR_TXT = { color: "#c0392b", fontSize: ".78rem", marginTop: 4 };
