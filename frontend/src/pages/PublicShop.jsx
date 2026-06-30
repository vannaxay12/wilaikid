import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";

const BASE = "http://localhost:4000";
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

export default function PublicShop() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .catch(() => {});
    api
      .get("/categories")
      .then((r) => setCats(r.data))
      .catch(() => {});
  }, []);

  // ຖ້າ login ແລ້ວ redirect ໄປໜ້າທີ່ຖືກຕ້ອງ
  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") nav("/admin", { replace: true });
    if (user.role === "cashier") nav("/cashier", { replace: true });
    if (user.role === "customer") nav("/customer", { replace: true });
  }, [user]);

  const filtered = products.filter((p) => {
    const mc = !catFilter || p.category_id == catFilter;
    const ms =
      !search || p.product_name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f0f7fc",
        fontFamily: "var(--font)",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          background: "#2471a3",
          color: "#fff",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>
          🏪 ວິໄລຄິດ
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ຄົ້ນຫາສິນຄ້າ..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,.15)",
            border: "none",
            borderRadius: 8,
            padding: "7px 12px",
            color: "#fff",
            fontSize: ".88rem",
            outline: "none",
          }}
        />
        <button
          onClick={() => nav("/login")}
          style={{
            background: "rgba(255,255,255,.2)",
            border: "none",
            color: "#fff",
            padding: "7px 16px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: ".88rem",
            fontFamily: "var(--font)",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          🛒 ເຂົ້າສູ່ລະບົບ
        </button>
      </div>

      {/* Banner */}
      <div
        style={{
          background: "linear-gradient(135deg,#1a6b3c,#2471a3)",
          padding: "28px 16px",
          textAlign: "center",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: ".95rem", opacity: 0.85, marginBottom: 6 }}>
          🛍️ ສິນຄ້າຄຸນນະພາບ ລາຄາໂຕ
        </div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>
          ຮ້ານໝາກຊຳ ວິໄລຄິດ — ຍິນດີຕ້ອນຮັບ
        </div>
        <div style={{ marginTop: 12, fontSize: ".85rem", opacity: 0.75 }}>
          ສະໝັກສະມາຊິກ ຊື້ສິນຄ້າ ສະສົມຄະແນນ ✨
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "center",
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => nav("/login")}
            style={{
              background: "#fff",
              color: "#1a6b3c",
              border: "none",
              padding: "9px 22px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: ".9rem",
              fontWeight: 700,
              fontFamily: "var(--font)",
            }}
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => nav("/register/customer")}
            style={{
              background: "transparent",
              color: "#fff",
              border: "1.5px solid rgba(255,255,255,.7)",
              padding: "9px 22px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: ".9rem",
              fontFamily: "var(--font)",
            }}
          >
            ສະໝັກສະມາຊິກໃໝ່
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
        {/* Category filter */}
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setCatFilter("")}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              cursor: "pointer",
              fontSize: ".85rem",
              fontFamily: "var(--font)",
              border: "none",
              background: !catFilter ? "#2471a3" : "#fff",
              color: !catFilter ? "#fff" : "#706e66",
              outline: catFilter ? "1px solid #e2e0d8" : "none",
            }}
          >
            ທັງໝົດ
          </button>
          {cats.map((c) => (
            <button
              key={c.category_id}
              onClick={() => setCatFilter(c.category_id)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "1px solid #e2e0d8",
                cursor: "pointer",
                fontSize: ".85rem",
                fontFamily: "var(--font)",
                background: catFilter == c.category_id ? "#2471a3" : "#fff",
                color: catFilter == c.category_id ? "#fff" : "#706e66",
              }}
            >
              {c.category_name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))",
            gap: 14,
          }}
        >
          {filtered.map((p) => (
            <div
              key={p.product_id}
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0,0,0,.06)",
              }}
            >
              {/* Image */}
              <div
                style={{
                  height: 130,
                  background: "#f0f7fc",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                }}
              >
                {p.image ? (
                  <img
                    src={BASE + p.image}
                    alt={p.product_name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <span style={{ fontSize: 40 }}>📦</span>
                )}
              </div>
              {/* Info */}
              <div style={{ padding: "10px 12px" }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: ".9rem",
                    marginBottom: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {p.product_name}
                </div>
                <div
                  style={{
                    fontSize: ".75rem",
                    color: "#706e66",
                    marginBottom: 8,
                  }}
                >
                  {p.category_name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: "#185FA5",
                      fontSize: "1rem",
                    }}
                  >
                    {fmt(p.selling_price)}
                  </span>
                  <button
                    onClick={() => nav("/login")}
                    disabled={p.stock_qty < 1}
                    style={{
                      width: 30,
                      height: 30,
                      background: p.stock_qty < 1 ? "#e2e0d8" : "#2471a3",
                      border: "none",
                      borderRadius: 6,
                      color: "#fff",
                      cursor: p.stock_qty < 1 ? "not-allowed" : "pointer",
                      fontSize: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    +
                  </button>
                </div>
                {p.stock_qty < 1 && (
                  <div
                    style={{
                      fontSize: ".72rem",
                      color: "#c0392b",
                      marginTop: 4,
                    }}
                  >
                    ໝົດ
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA bottom */}
        <div
          style={{
            marginTop: 40,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e2e0d8",
            padding: "28px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>🛒</div>
          <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 6 }}>
            ຢາກຊື້ສິນຄ້າ?
          </div>
          <div
            style={{ color: "#706e66", fontSize: ".88rem", marginBottom: 16 }}
          >
            ສະໝັກສະມາຊິກຟຣີ ຊື້ສິນຄ້າ ສະສົມຄະແນນ ໂອນຊຳລະໄດ້
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={() => nav("/register/customer")}
              style={{
                background: "#2471a3",
                color: "#fff",
                border: "none",
                padding: "10px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: ".9rem",
                fontWeight: 700,
                fontFamily: "var(--font)",
              }}
            >
              👤 ສະໝັກສະມາຊິກ
            </button>
            <button
              onClick={() => nav("/login")}
              style={{
                background: "transparent",
                color: "#2471a3",
                border: "1.5px solid #2471a3",
                padding: "10px 24px",
                borderRadius: 8,
                cursor: "pointer",
                fontSize: ".9rem",
                fontFamily: "var(--font)",
              }}
            >
              🔑 Login ເພື່ອຊື້
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#aaa",
          fontSize: ".8rem",
          marginTop: 20,
          borderTop: "1px solid #e2e0d8",
        }}
      >
        © 2026 ຮ້ານໝາກຊຳ ວິໄລຄິດ
        <span style={{ margin: "0 10px" }}>·</span>
        <span
          style={{ cursor: "pointer", color: "#aaa" }}
          onClick={() => nav("/staff")}
        >
          ໜ້າພະນັກງານ
        </span>
      </div>
    </div>
  );
}
