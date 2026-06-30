import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function StaffLogin() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const timer = useRef(null);

  function showErr(msg) {
    setErr(msg);
    setInfo("");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setErr(""), 10000);
  }
  function showInfo(msg) {
    setInfo(msg);
    setErr("");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setInfo(""), 10000);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      const role = await login(form.username, form.password);
      nav(role === "admin" ? "/admin" : "/cashier", { replace: true });
    } catch (ex) {
      console.log("STAFF LOGIN ERROR:", ex);
      const d = ex?.response?.data;
      if (d?.status === "pending") showInfo(d.message || "ລໍຖ້າການອະນຸມັດ");
      else if (d?.status === "rejected")
        showErr(d.message || "ບັນຊີຖືກປະຕິເສດ");
      else showErr(d?.message || "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ");
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
    setBusy(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#1a6b3c 0%,#0f3d22 100%)",
        padding: 16,
      }}
    >
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)}
          40%{transform:translateX(10px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        .staff-shake{animation:shake .5s ease}
      `}</style>

      <div
        className={shake ? "staff-shake" : ""}
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          borderRadius: 16,
          padding: "36px 32px 28px",
          boxShadow: "0 20px 60px rgba(0,0,0,.4)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>👔</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a1917" }}>
            ໜ້າພະນັກງານ
          </h1>
          <p style={{ color: "#706e66", fontSize: ".82rem", marginTop: 4 }}>
            ຮ້ານໝາກຊຳ ວິໄລຄິດ — Staff Only
          </p>
        </div>

        {/* ERROR — plain inline, always visible */}
        {err && (
          <div
            style={{
              background: "#c0392b",
              color: "#ffffff",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 16,
              fontSize: ".95rem",
              fontWeight: 600,
              textAlign: "center",
              boxShadow: "0 4px 14px rgba(192,57,43,.5)",
            }}
          >
            🚫 {err}
          </div>
        )}

        {/* INFO */}
        {info && (
          <div
            style={{
              background: "#e67e22",
              color: "#ffffff",
              borderRadius: 10,
              padding: "14px 16px",
              marginBottom: 16,
              fontSize: ".95rem",
              fontWeight: 600,
              textAlign: "center",
              boxShadow: "0 4px 14px rgba(230,126,34,.5)",
            }}
          >
            ⏳ {info}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="s-un"
              style={{
                display: "block",
                fontSize: ".85rem",
                fontWeight: 600,
                color: "#1a1917",
                marginBottom: 6,
              }}
            >
              ຊື່ຜູ້ໃຊ້
            </label>
            <input
              id="s-un"
              name="username"
              autoComplete="username"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              placeholder="username"
              required
              autoFocus
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 8,
                fontSize: "1rem",
                border: err ? "2px solid #c0392b" : "1.5px solid #d0cec8",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <label
              htmlFor="s-pw"
              style={{
                display: "block",
                fontSize: ".85rem",
                fontWeight: 600,
                color: "#1a1917",
                marginBottom: 6,
              }}
            >
              ລະຫັດຜ່ານ
            </label>
            <input
              id="s-pw"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              placeholder="••••••••"
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: 8,
                fontSize: "1rem",
                border: err ? "2px solid #c0392b" : "1.5px solid #d0cec8",
                outline: "none",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            style={{
              width: "100%",
              padding: "13px",
              fontSize: "1rem",
              border: "none",
              borderRadius: 10,
              cursor: busy ? "not-allowed" : "pointer",
              color: "#fff",
              fontFamily: "inherit",
              fontWeight: 700,
              background: "#0f3d22",
              opacity: busy ? 0.7 : 1,
              marginBottom: 16,
            }}
          >
            {busy ? "⏳ ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
          </button>
        </form>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => nav("/register/employee")}
            style={{
              background: "none",
              border: "none",
              color: "#706e66",
              cursor: "pointer",
              fontSize: ".82rem",
              fontFamily: "inherit",
            }}
          >
            ສະໝັກເປັນພະນັກງານ →
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: 10 }}>
          <button
            onClick={() => nav("/")}
            style={{
              background: "none",
              border: "none",
              color: "#aaa",
              cursor: "pointer",
              fontSize: ".78rem",
              fontFamily: "inherit",
            }}
          >
            ← ກັບໜ້າຮ້ານ
          </button>
        </div>
      </div>
    </div>
  );
}
