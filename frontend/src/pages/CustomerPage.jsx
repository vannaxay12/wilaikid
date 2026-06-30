import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../utils/api";

const BASE = "http://localhost:4000";
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

export default function CustomerPage() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("shop");
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [catFilter, setCatFilter] = useState("");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(null);
  const [orderDone, setOrderDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const [shopSettings, setShopSettings] = useState({});

  // Payment
  const [payMethod, setPayMethod] = useState("cash");
  const [transferRef, setTransferRef] = useState("");
  const [payErr, setPayErr] = useState("");

  useEffect(() => {
    api.get("/products").then((r) => setProducts(r.data));
    api.get("/categories").then((r) => setCats(r.data));
    api
      .get("/customers/me")
      .then((r) => setProfile(r.data))
      .catch(() => {});
    api
      .get("/customer-orders")
      .then((r) => setOrders(r.data))
      .catch(() => {});
    api
      .get("/settings")
      .then((r) => setShopSettings(r.data))
      .catch(() => {});
  }, []);

  function addToCart(p) {
    setCart((c) => {
      const idx = c.findIndex((i) => i.product_id === p.product_id);
      if (idx >= 0) {
        if (c[idx].qty >= p.stock_qty) return c;
        const u = [...c];
        u[idx] = { ...u[idx], qty: u[idx].qty + 1 };
        return u;
      }
      if (p.stock_qty < 1) return c;
      return [...c, { ...p, qty: 1 }];
    });
  }
  function qtyChange(id, delta) {
    setCart((c) =>
      c.map((i) => {
        if (i.product_id !== id) return i;
        const nq = i.qty + delta;
        if (nq < 1 || nq > i.stock_qty) return i;
        return { ...i, qty: nq };
      }),
    );
  }
  function removeFromCart(id) {
    setCart((c) => c.filter((i) => i.product_id !== id));
  }

  const subtotal = cart.reduce((s, i) => s + i.qty * i.selling_price, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  async function placeOrder() {
    setPayErr("");
    if (!cart.length) return;
    if (payMethod === "transfer" && !transferRef.trim()) {
      setPayErr("ກະລຸນາໃສ່ເລກອ້າງອີງການໂອນ");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/customer-orders", {
        items: cart.map((i) => ({
          product_id: i.product_id,
          qty: i.qty,
          unit_price: i.selling_price,
        })),
        payment_method: payMethod,
        transfer_ref: transferRef,
      });
      setOrderDone(data);
      setCart([]);
      setPayMethod("cash");
      setTransferRef("");
      api.get("/customer-orders").then((r) => setOrders(r.data));
      api.get("/customers/me").then((r) => setProfile(r.data));
    } catch (e) {
      setPayErr(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  const filtered = products.filter((p) => {
    const mc = !catFilter || p.category_id == catFilter;
    const ms =
      !search || p.product_name.toLowerCase().includes(search.toLowerCase());
    return mc && ms;
  });

  const STATUS_TH = {
    pending: "ລໍຖ້າ",
    confirmed: "ຢືນຢັນ",
    completed: "ສຳເລັດ",
    cancelled: "ຍົກເລີກ",
  };
  const STATUS_STYLE = {
    pending: { background: "#fff3cd", color: "#856404" },
    confirmed: { background: "#d1ecf1", color: "#0c5460" },
    completed: { background: "#d4edda", color: "#155724" },
    cancelled: { background: "#f8d7da", color: "#721c24" },
  };
  const PAY_TH = { cash: "💵 ເງິນສົດ", transfer: "📱 ໂອນເງິນ" };

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : "??";

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
        <div style={{ fontWeight: 700, fontSize: "1rem", flexShrink: 0 }}>
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
          onClick={() => setTab("cart")}
          style={{
            background: "rgba(255,255,255,.15)",
            border: "none",
            color: "#fff",
            width: 38,
            height: 38,
            borderRadius: 8,
            cursor: "pointer",
            position: "relative",
            flexShrink: 0,
            fontSize: 18,
          }}
        >
          🛒
          {cartCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                background: "#c0392b",
                color: "#fff",
                width: 18,
                height: 18,
                borderRadius: "50%",
                fontSize: 10,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Nav */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e0d8",
          display: "flex",
          gap: 4,
          padding: "6px 12px",
          overflowX: "auto",
        }}
      >
        {[
          { key: "shop", icon: "🏠", label: "ໜ້າຮ້ານ" },
          {
            key: "cart",
            icon: "🛒",
            label: `ກະຕ່າ${cartCount > 0 ? ` (${cartCount})` : ""}`,
          },
          { key: "history", icon: "🧾", label: "ປະຫວັດ" },
          { key: "profile", icon: "👤", label: "ໂປຣໄຟລ໌" },
        ].map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "7px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: ".85rem",
              fontFamily: "var(--font)",
              whiteSpace: "nowrap",
              background: tab === n.key ? "#2471a3" : "transparent",
              color: tab === n.key ? "#fff" : "#706e66",
              fontWeight: tab === n.key ? 600 : 400,
            }}
          >
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "20px 16px" }}>
        {/* ── SHOP ── */}
        {tab === "shop" && (
          <>
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
                  padding: "5px 14px",
                  borderRadius: 20,
                  cursor: "pointer",
                  fontSize: ".82rem",
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
                    padding: "5px 14px",
                    borderRadius: 20,
                    border: "1px solid #e2e0d8",
                    cursor: "pointer",
                    fontSize: ".82rem",
                    fontFamily: "var(--font)",
                    background: catFilter == c.category_id ? "#2471a3" : "#fff",
                    color: catFilter == c.category_id ? "#fff" : "#706e66",
                  }}
                >
                  {c.category_name}
                </button>
              ))}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
                gap: 12,
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
                  }}
                >
                  <div
                    style={{
                      height: 90,
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
                      <span style={{ fontSize: 32 }}>📦</span>
                    )}
                  </div>
                  <div style={{ padding: "8px 10px" }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: ".84rem",
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
                        marginBottom: 6,
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
                          fontSize: ".9rem",
                          color: "#185FA5",
                        }}
                      >
                        {fmt(p.selling_price)}
                      </span>
                      <button
                        onClick={() => addToCart(p)}
                        disabled={p.stock_qty < 1}
                        style={{
                          width: 26,
                          height: 26,
                          background: p.stock_qty < 1 ? "#e2e0d8" : "#2471a3",
                          border: "none",
                          borderRadius: 6,
                          color: "#fff",
                          cursor: p.stock_qty < 1 ? "not-allowed" : "pointer",
                          fontSize: 18,
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
                          marginTop: 2,
                        }}
                      >
                        ໝົດ
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── CART ── */}
        {tab === "cart" && (
          <>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}
            >
              ກະຕ່າສິນຄ້າ
            </div>
            {cart.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e2e0d8",
                  padding: "48px 20px",
                  color: "#aaa",
                }}
              >
                🛒
                <br />
                ກະຕ່າຫວ່າງເປົ່າ
                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => setTab("shop")}
                    style={{
                      background: "#2471a3",
                      color: "#fff",
                      border: "none",
                      padding: "9px 20px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                    }}
                  >
                    ເລືອກຊື້ສິນຄ້າ
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Cart items */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e0d8",
                    overflow: "hidden",
                    marginBottom: 14,
                  }}
                >
                  {cart.map((item) => (
                    <div
                      key={item.product_id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "12px 14px",
                        borderBottom: "1px solid #f5f4f0",
                      }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          background: "#f0f7fc",
                          borderRadius: 8,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                        }}
                      >
                        {item.image ? (
                          <img
                            src={BASE + item.image}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 22 }}>📦</span>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: ".88rem" }}>
                          {item.product_name}
                        </div>
                        <div style={{ fontSize: ".78rem", color: "#706e66" }}>
                          {fmt(item.selling_price)} / {item.unit_abbr || "ອັນ"}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <button
                          onClick={() => qtyChange(item.product_id, -1)}
                          style={{
                            width: 24,
                            height: 24,
                            border: "1px solid #e2e0d8",
                            background: "#f5f4f0",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          −
                        </button>
                        <span
                          style={{
                            minWidth: 24,
                            textAlign: "center",
                            fontWeight: 600,
                          }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => qtyChange(item.product_id, 1)}
                          style={{
                            width: 24,
                            height: 24,
                            border: "1px solid #e2e0d8",
                            background: "#f5f4f0",
                            borderRadius: 4,
                            cursor: "pointer",
                          }}
                        >
                          +
                        </button>
                      </div>
                      <div
                        style={{
                          minWidth: 70,
                          textAlign: "right",
                          fontWeight: 600,
                        }}
                      >
                        {fmt(item.qty * item.selling_price)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#aaa",
                          fontSize: 16,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Payment method */}
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e0d8",
                    padding: "16px",
                    marginBottom: 14,
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>
                    💳 ເລືອກວິທີຊຳລະ
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginBottom: 14,
                    }}
                  >
                    {[
                      {
                        key: "cash",
                        icon: "💵",
                        label: "ເງິນສົດ",
                        sub: "ຊຳລະຕອນຮັບສິນຄ້າ",
                      },
                      {
                        key: "transfer",
                        icon: "📱",
                        label: "ໂອນເງິນ",
                        sub: "BCEL / LDB / JDB",
                      },
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => {
                          setPayMethod(m.key);
                          setPayErr("");
                        }}
                        style={{
                          padding: "14px",
                          borderRadius: 10,
                          cursor: "pointer",
                          fontFamily: "var(--font)",
                          border:
                            payMethod === m.key
                              ? "2px solid #2471a3"
                              : "1.5px solid #e2e0d8",
                          background: payMethod === m.key ? "#f0f7fc" : "#fff",
                          textAlign: "center",
                        }}
                      >
                        <div style={{ fontSize: 28, marginBottom: 4 }}>
                          {m.icon}
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: ".9rem",
                            color: payMethod === m.key ? "#2471a3" : "#1a1917",
                          }}
                        >
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontSize: ".75rem",
                            color: "#706e66",
                            marginTop: 2,
                          }}
                        >
                          {m.sub}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Transfer info */}
                  {payMethod === "transfer" && (
                    <div
                      style={{
                        background: "#f0f7fc",
                        borderRadius: 10,
                        padding: "14px",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          marginBottom: 12,
                          fontSize: ".9rem",
                        }}
                      >
                        📋 ຂໍ້ມູນການໂອນ
                      </div>
                      {/* Amount to transfer */}
                      <div
                        style={{
                          background: "#1a6b3c",
                          borderRadius: 10,
                          padding: "12px 16px",
                          textAlign: "center",
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            fontSize: ".8rem",
                            color: "rgba(255,255,255,.8)",
                            marginBottom: 2,
                          }}
                        >
                          💸 ຈຳນວນທີ່ຕ້ອງໂອນ
                        </div>
                        <div
                          style={{
                            fontSize: "1.6rem",
                            fontWeight: 800,
                            color: "#fff",
                            fontFamily: "monospace",
                          }}
                        >
                          {fmt(subtotal)}
                        </div>
                      </div>

                      {/* QR codes */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            shopSettings.qr_bcel && shopSettings.qr_ldb
                              ? "1fr 1fr"
                              : "1fr",
                          gap: 12,
                          marginBottom: 12,
                        }}
                      >
                        {shopSettings.qr_bcel && (
                          <div
                            style={{
                              textAlign: "center",
                              background: "#fff",
                              borderRadius: 10,
                              padding: "12px",
                              border: "1px solid #e2e0d8",
                            }}
                          >
                            <div
                              style={{
                                fontSize: ".85rem",
                                fontWeight: 700,
                                marginBottom: 8,
                                color: "#1a1917",
                              }}
                            >
                              📱 BCEL One
                            </div>
                            <img
                              src={
                                "http://localhost:4000" + shopSettings.qr_bcel
                              }
                              alt="BCEL QR"
                              style={{
                                width: "100%",
                                maxWidth: 200,
                                height: 200,
                                objectFit: "contain",
                                borderRadius: 8,
                                display: "block",
                                margin: "0 auto",
                              }}
                            />
                            {shopSettings.bank_bcel && (
                              <div
                                style={{
                                  fontSize: ".78rem",
                                  color: "#706e66",
                                  marginTop: 8,
                                  background: "#f5f4f0",
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                }}
                              >
                                {shopSettings.bank_bcel}
                              </div>
                            )}
                          </div>
                        )}
                        {shopSettings.qr_ldb && (
                          <div
                            style={{
                              textAlign: "center",
                              background: "#fff",
                              borderRadius: 10,
                              padding: "12px",
                              border: "1px solid #e2e0d8",
                            }}
                          >
                            <div
                              style={{
                                fontSize: ".85rem",
                                fontWeight: 700,
                                marginBottom: 8,
                                color: "#1a1917",
                              }}
                            >
                              🏦 LDB
                            </div>
                            <img
                              src={
                                "http://localhost:4000" + shopSettings.qr_ldb
                              }
                              alt="LDB QR"
                              style={{
                                width: "100%",
                                maxWidth: 200,
                                height: 200,
                                objectFit: "contain",
                                borderRadius: 8,
                                display: "block",
                                margin: "0 auto",
                              }}
                            />
                            {shopSettings.bank_ldb && (
                              <div
                                style={{
                                  fontSize: ".78rem",
                                  color: "#706e66",
                                  marginTop: 8,
                                  background: "#f5f4f0",
                                  borderRadius: 6,
                                  padding: "4px 8px",
                                }}
                              >
                                {shopSettings.bank_ldb}
                              </div>
                            )}
                          </div>
                        )}
                        {!shopSettings.qr_bcel && !shopSettings.qr_ldb && (
                          <div
                            style={{
                              fontSize: ".88rem",
                              lineHeight: 2,
                              color: "#1a1917",
                              padding: "8px 0",
                            }}
                          >
                            {shopSettings.bank_bcel && (
                              <div>
                                🏦 <strong>BCEL:</strong>{" "}
                                {shopSettings.bank_bcel}
                              </div>
                            )}
                            {shopSettings.bank_ldb && (
                              <div>
                                🏦 <strong>LDB:</strong> {shopSettings.bank_ldb}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Paid confirmation */}
                      <div
                        style={{
                          background: "#d4edda",
                          borderRadius: 10,
                          padding: "12px 14px",
                          marginBottom: 12,
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <span style={{ fontSize: 20 }}>✅</span>
                        <div style={{ fontSize: ".85rem", color: "#155724" }}>
                          <strong>ຫຼັງໂອນແລ້ວ</strong> — ໃສ່ເລກ Reference
                          ດ້ານລຸ່ມ ແລ້ວກົດຢືນຢັນ
                        </div>
                      </div>
                      <div style={{ marginTop: 12 }}>
                        <label
                          style={{
                            display: "block",
                            fontSize: ".84rem",
                            fontWeight: 600,
                            color: "#1a1917",
                            marginBottom: 5,
                          }}
                        >
                          ເລກອ້າງອີງ / ສະລີບ *
                        </label>
                        <input
                          value={transferRef}
                          onChange={(e) => {
                            setTransferRef(e.target.value);
                            setPayErr("");
                          }}
                          placeholder="ເຊັ່ນ: TXN202505210001"
                          style={{
                            width: "100%",
                            padding: "9px 12px",
                            borderRadius: 8,
                            fontSize: ".9rem",
                            border: payErr
                              ? "1.5px solid #c0392b"
                              : "1.5px solid #e2e0d8",
                            outline: "none",
                            fontFamily: "var(--font)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      fontSize: ".9rem",
                    }}
                  >
                    <span style={{ color: "#706e66" }}>
                      ລາຄາລວມ ({cartCount} ລາຍ)
                    </span>
                    <span>{fmt(subtotal)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      paddingTop: 10,
                      borderTop: "1px solid #f0eeea",
                      fontSize: "1.05rem",
                      fontWeight: 700,
                    }}
                  >
                    <span>ຍອດສຸດທິ</span>
                    <span style={{ color: "#185FA5" }}>{fmt(subtotal)}</span>
                  </div>
                  <div
                    style={{
                      fontSize: ".78rem",
                      color: "#1a6b3c",
                      marginTop: 6,
                    }}
                  >
                    ✨ ຈະໄດ້ຄະແນນ {Math.floor(subtotal / 1000)} ຄະແນນ
                  </div>

                  {payErr && (
                    <div
                      style={{
                        background: "#f8d7da",
                        color: "#721c24",
                        borderRadius: 8,
                        padding: "9px 12px",
                        fontSize: ".85rem",
                        marginTop: 10,
                      }}
                    >
                      ⚠️ {payErr}
                    </div>
                  )}

                  <button
                    onClick={placeOrder}
                    disabled={busy}
                    style={{
                      width: "100%",
                      background: "#2471a3",
                      color: "#fff",
                      border: "none",
                      padding: "13px",
                      borderRadius: 10,
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: 14,
                      fontFamily: "var(--font)",
                    }}
                  >
                    {busy
                      ? "ກຳລັງສັ່ງ..."
                      : `✅ ຢືນຢັນ — ${payMethod === "cash" ? "💵 ເງິນສົດ" : "📱 ໂອນເງິນ"}`}
                  </button>
                </div>
              </>
            )}

            {/* Order success */}
            {orderDone && (
              <div
                style={{
                  position: "fixed",
                  inset: 0,
                  background: "rgba(0,0,0,.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: 16,
                    padding: "32px",
                    width: 340,
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      marginBottom: 8,
                    }}
                  >
                    ສັ່ງຊື້ສຳເລັດ!
                  </div>
                  <div
                    style={{
                      fontFamily: "monospace",
                      color: "#185FA5",
                      marginBottom: 6,
                    }}
                  >
                    {orderDone.order_number}
                  </div>
                  <div style={{ fontSize: ".88rem", marginBottom: 6 }}>
                    {orderDone.payment_method === "cash"
                      ? "💵 ຊຳລະເງິນສົດຕອນຮັບສິນຄ້າ"
                      : "📱 ລໍຖ້າຢືນຢັນການໂອນ"}
                  </div>
                  <div
                    style={{
                      fontSize: ".88rem",
                      color: "#1a6b3c",
                      marginBottom: 20,
                    }}
                  >
                    +{orderDone.points_earned} ຄະແນນ
                  </div>
                  <button
                    onClick={() => {
                      setOrderDone(null);
                      setTab("history");
                    }}
                    style={{
                      background: "#2471a3",
                      color: "#fff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: 8,
                      cursor: "pointer",
                      fontFamily: "var(--font)",
                      fontWeight: 600,
                    }}
                  >
                    ດູປະຫວັດ
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── HISTORY ── */}
        {tab === "history" && (
          <>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}
            >
              ປະຫວັດການສັ່ງຊື້
            </div>
            {orders.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e2e0d8",
                  padding: 40,
                  color: "#aaa",
                }}
              >
                ຍັງບໍ່ມີປະຫວັດ
              </div>
            ) : (
              orders.map((o) => (
                <div
                  key={o.order_id}
                  style={{
                    background: "#fff",
                    borderRadius: 12,
                    border: "1px solid #e2e0d8",
                    padding: "14px 16px",
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "monospace",
                        fontWeight: 600,
                        color: "#185FA5",
                      }}
                    >
                      {o.order_number}
                    </div>
                    <span
                      style={{
                        fontSize: ".75rem",
                        padding: "2px 8px",
                        borderRadius: 20,
                        ...STATUS_STYLE[o.status],
                      }}
                    >
                      {STATUS_TH[o.status]}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: ".82rem",
                      color: "#706e66",
                      marginBottom: 4,
                    }}
                  >
                    {new Date(o.created_at).toLocaleString("lo-LA")} ·{" "}
                    {o.item_count} ລາຍ
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "#185FA5" }}>
                      {fmt(o.total_amount)}
                    </div>
                    <span
                      style={{
                        fontSize: ".78rem",
                        padding: "2px 8px",
                        borderRadius: 20,
                        background:
                          o.payment_method === "cash" ? "#d4edda" : "#d1ecf1",
                        color:
                          o.payment_method === "cash" ? "#155724" : "#0c5460",
                      }}
                    >
                      {PAY_TH[o.payment_method] || o.payment_method}
                    </span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* ── PROFILE ── */}
        {tab === "profile" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                padding: "20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "#2471a3",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {initials}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div style={{ fontSize: ".82rem", color: "#706e66" }}>
                  @{profile?.username}
                </div>
                <div
                  style={{ fontSize: ".78rem", color: "#1a6b3c", marginTop: 4 }}
                >
                  ⭐ {profile?.points || 0} ຄະແນນ
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 10,
                marginBottom: 16,
              }}
            >
              {[
                { label: "ຄັ້ງທີ່ຊື້", value: orders.length },
                {
                  label: "ຍອດທັງໝົດ",
                  value: fmt(
                    orders.reduce((s, o) => s + Number(o.total_amount), 0),
                  ),
                },
                { label: "ຄະແນນ", value: profile?.points || 0 },
              ].map((m, i) => (
                <div
                  key={i}
                  style={{
                    background: "#fff",
                    borderRadius: 10,
                    border: "1px solid #e2e0d8",
                    padding: "12px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "#185FA5",
                    }}
                  >
                    {m.value}
                  </div>
                  <div
                    style={{
                      fontSize: ".78rem",
                      color: "#706e66",
                      marginTop: 2,
                    }}
                  >
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  fontWeight: 600,
                  borderBottom: "1px solid #f0eeea",
                }}
              >
                ຂໍ້ມູນສ່ວນຕົວ
              </div>
              {[
                {
                  label: "ຊື່",
                  value: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
                },
                { label: "Username", value: profile?.username },
                { label: "ເບີໂທ", value: profile?.phone || "—" },
                { label: "ອີເມລ", value: profile?.email || "—" },
              ].map((r, i, a) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    padding: "10px 16px",
                    fontSize: ".88rem",
                    borderBottom:
                      i < a.length - 1 ? "1px solid #f5f4f0" : "none",
                  }}
                >
                  <span style={{ color: "#706e66", minWidth: 90 }}>
                    {r.label}
                  </span>
                  <span>{r.value}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                logout();
                nav("/login");
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #e2e0d8",
                color: "#c0392b",
                padding: "11px",
                borderRadius: 10,
                cursor: "pointer",
                fontFamily: "var(--font)",
                fontSize: ".9rem",
              }}
            >
              ອອກຈາກລະບົບ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
