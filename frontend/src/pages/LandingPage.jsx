import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1a6b3c 0%,#0f3d22 100%)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font)",
      }}
    >
      {/* Header */}
      <div style={{ padding: "24px 32px", textAlign: "center" }}>
        <div style={{ fontSize: 52, marginBottom: 10 }}>🏪</div>
        <h1
          style={{
            color: "#fff",
            fontSize: "1.8rem",
            fontWeight: 700,
            marginBottom: 6,
          }}
        >
          ຮ້ານໝາກຊຳ ວິໄລຄິດ
        </h1>
        <p style={{ color: "rgba(255,255,255,.7)", fontSize: ".95rem" }}>
          ລະບົບຈັດການຮ້ານຄ້າຄົບວົງຈອນ
        </p>
      </div>

      {/* Main cards */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 700,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {/* ລູກຄ້າ */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,.2)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>👤</div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: 8,
                color: "#1a1917",
              }}
            >
              ລູກຄ້າ
            </h2>
            <p
              style={{
                fontSize: ".85rem",
                color: "#706e66",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              ເລືອກ ສັ່ງຊື້ ແລະ ຊຳລະສິນຄ້າ
              <br />
              ສະສົມຄະແນນ ດູປະຫວັດ
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => nav("/login")}
                style={{
                  background: "#2471a3",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: ".95rem",
                  fontWeight: 700,
                  fontFamily: "var(--font)",
                  width: "100%",
                }}
              >
                🔑 ເຂົ້າສູ່ລະບົບ
              </button>
              <button
                onClick={() => nav("/register/customer")}
                style={{
                  background: "transparent",
                  color: "#2471a3",
                  border: "2px solid #2471a3",
                  padding: "11px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: ".88rem",
                  fontWeight: 600,
                  fontFamily: "var(--font)",
                  width: "100%",
                }}
              >
                ✨ ສະໝັກສະມາຊິກໃໝ່
              </button>
            </div>
            <div style={{ marginTop: 16, fontSize: ".75rem", color: "#aaa" }}>
              ✅ ໃຊ້ງານໄດ້ທັນທີຫຼັງສະໝັກ
            </div>
          </div>

          {/* ພະນັກງານ */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "32px 24px",
              textAlign: "center",
              boxShadow: "0 8px 32px rgba(0,0,0,.2)",
            }}
          >
            <div style={{ fontSize: 52, marginBottom: 14 }}>👔</div>
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: 8,
                color: "#1a1917",
              }}
            >
              ພະນັກງານ
            </h2>
            <p
              style={{
                fontSize: ".85rem",
                color: "#706e66",
                lineHeight: 1.7,
                marginBottom: 24,
              }}
            >
              ເຂົ້າໃຊ້ POS ຂາຍສິນຄ້າ
              <br />
              ຈັດການສາງ ແລະ ລາຍງານ
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                onClick={() => nav("/login")}
                style={{
                  background: "#0f3d22",
                  color: "#fff",
                  border: "none",
                  padding: "12px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: ".95rem",
                  fontWeight: 700,
                  fontFamily: "var(--font)",
                  width: "100%",
                }}
              >
                🔑 ເຂົ້າສູ່ລະບົບ
              </button>
              <button
                onClick={() => nav("/register/employee")}
                style={{
                  background: "transparent",
                  color: "#0f3d22",
                  border: "2px solid #0f3d22",
                  padding: "11px",
                  borderRadius: 10,
                  cursor: "pointer",
                  fontSize: ".88rem",
                  fontWeight: 600,
                  fontFamily: "var(--font)",
                  width: "100%",
                }}
              >
                📝 ສະໝັກພະນັກງານ
              </button>
            </div>
            <div style={{ marginTop: 16, fontSize: ".75rem", color: "#aaa" }}>
              ⏳ ລໍຖ້າຜູ້ຈັດການອະນຸມັດ
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "rgba(255,255,255,.4)",
          fontSize: ".78rem",
        }}
      >
        © 2026 ຮ້ານໝາກຊຳ ວິໄລຄິດ
      </div>
    </div>
  );
}
