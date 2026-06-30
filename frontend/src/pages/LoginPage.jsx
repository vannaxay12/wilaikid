import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { loginCustomer } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);
  const timer = useRef(null);

  function showErr(msg) {
    setErr(msg);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setErr(""), 10000);
  }

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      await loginCustomer(form.username, form.password);
      nav("/customer", { replace: true });
    } catch (ex) {
      console.log("LOGIN ERROR:", ex);
      const msg =
        ex?.response?.data?.message || "ຊື່ຜູ້ໃຊ້ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ";
      showErr(msg);
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
        background: "linear-gradient(135deg,#2471a3 0%,#0c3a5c 100%)",
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
        .cust-shake{animation:shake .5s ease}
      `}</style>

      <div
        className={shake ? "cust-shake" : ""}
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
          <div style={{ fontSize: 44, marginBottom: 8 }}>👤</div>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1a1917" }}>
            ເຂົ້າສູ່ລະບົບລູກຄ້າ
          </h1>
          <p style={{ color: "#706e66", fontSize: ".82rem", marginTop: 4 }}>
            ຮ້ານໝາກຊຳ ວິໄລຄິດ
          </p>
        </div>

        {/* ERROR — alert style, can't fail to show */}
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

        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="c-un"
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
              id="c-un"
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
              htmlFor="c-pw"
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
              id="c-pw"
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
              background: "#2471a3",
              opacity: busy ? 0.7 : 1,
              marginBottom: 16,
            }}
          >
            {busy ? "⏳ ກຳລັງເຂົ້າ..." : "🔑 ເຂົ້າສູ່ລະບົບ"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ fontSize: ".85rem", color: "#706e66" }}>
            ຍັງບໍ່ມີບັນຊີ?{" "}
          </span>
          <Link
            to="/register/customer"
            style={{
              fontSize: ".85rem",
              color: "#2471a3",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ສະໝັກສະມາຊິກ →
          </Link>
        </div>

        <div style={{ textAlign: "center" }}>
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
