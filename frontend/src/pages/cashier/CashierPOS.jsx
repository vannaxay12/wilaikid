import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

export default function CashierPOS() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [cart, setCart] = useState([]);
  const [search, setSrch] = useState("");
  const [discount, setDisc] = useState(0);
  const [paid, setPaid] = useState("");
  const [method, setMeth] = useState("cash");
  const [receipt, setRec] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const searchRef = useRef();

  const subtotal = cart.reduce((s, i) => s + i.qty * i.selling_price, 0);
  const total = subtotal - Number(discount);
  const change = Number(paid) - total;

  async function lookup() {
    if (!search.trim()) return;
    try {
      const { data } = await api.get(
        `/products/barcode/${encodeURIComponent(search.trim())}`,
      );
      addToCart(data);
      setSrch("");
    } catch {
      try {
        const { data } = await api.get(
          `/products?search=${encodeURIComponent(search.trim())}`,
        );
        if (data.length === 1) {
          addToCart(data[0]);
          setSrch("");
        } else if (!data.length) setErr("ບໍ່ພົບສິນຄ້າ");
        else setErr(`ພົບ ${data.length} ລາຍການ ກະລຸນາລະບຸບາໂຄດ`);
      } catch {
        setErr("ເກີດຂໍ້ຜິດພາດ");
      }
    }
  }

  function addToCart(product) {
    setErr("");
    setCart((c) => {
      const idx = c.findIndex((i) => i.product_id === product.product_id);
      if (idx >= 0) {
        const u = [...c];
        if (u[idx].qty + 1 > product.stock_qty) {
          setErr(`ສາງບໍ່ພໍ (ເຫຼືອ ${product.stock_qty})`);
          return c;
        }
        u[idx] = { ...u[idx], qty: u[idx].qty + 1 };
        return u;
      }
      if (product.stock_qty < 1) {
        setErr("ສິນຄ້າໝົດ");
        return c;
      }
      return [...c, { ...product, qty: 1 }];
    });
    setTimeout(() => searchRef.current?.focus(), 50);
  }

  function qtyChange(id, delta) {
    setCart((c) =>
      c.map((i) => {
        if (i.product_id !== id) return i;
        const nq = i.qty + delta;
        if (nq < 1) return i;
        if (nq > i.stock_qty) {
          setErr("ສາງບໍ່ພໍ");
          return i;
        }
        return { ...i, qty: nq };
      }),
    );
  }

  async function checkout() {
    if (!cart.length) return;
    if (method === "cash" && Number(paid) < total) {
      setErr("ເງິນບໍ່ພໍ");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const { data } = await api.post("/sales", {
        items: cart.map((i) => ({
          product_id: i.product_id,
          qty: i.qty,
          unit_price: i.selling_price,
        })),
        discount,
        amount_paid: Number(paid) || total,
        payment_method: method,
      });
      setRec({
        ...data,
        items: cart,
        discount,
        subtotal,
        total,
        paid: Number(paid) || total,
      });
      setCart([]);
      setDisc(0);
      setPaid("");
      setMeth("cash");
    } catch (e) {
      setErr(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        fontFamily: "var(--font)",
        background: "#f5f4f0",
      }}
    >
      {/* LEFT */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e2e0d8",
        }}
      >
        <div
          style={{
            background: "#0f3d22",
            color: "#fff",
            padding: "13px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div style={{ fontWeight: 700 }}>🏪 ວິໄລຄິດ POS</div>
            <div style={{ fontSize: ".76rem", opacity: 0.65 }}>
              {user?.name} · {new Date().toLocaleTimeString("lo-LA")}
            </div>
          </div>
          <div className="flex gap-2">
            {user?.role === "admin" && (
              <button
                className="btn btn-sm"
                style={{ background: "rgba(255,255,255,.15)", color: "#fff" }}
                onClick={() => nav("/admin")}
              >
                ⚙️ Admin
              </button>
            )}
            <button
              className="btn btn-sm"
              style={{ background: "rgba(255,255,255,.1)", color: "#fff" }}
              onClick={() => {
                logout();
                nav("/login");
              }}
            >
              ອອກຈາກລະບົບ
            </button>
          </div>
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid #e2e0d8",
            background: "#fff",
          }}
        >
          <div className="flex gap-2">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSrch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && lookup()}
              placeholder="🔍 ສະແກນບາໂຄດ ຫຼື ພິມຊື່ສິນຄ້າ ແລ້ວກົດ Enter"
              style={{ flex: 1 }}
              autoFocus
            />
            <button className="btn btn-primary" onClick={lookup}>
              ຄົ້ນຫາ
            </button>
          </div>
          {err && (
            <div style={{ color: "#c0392b", fontSize: ".82rem", marginTop: 5 }}>
              ⚠️ {err}
            </div>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {!cart.length ? (
            <div
              style={{
                textAlign: "center",
                color: "#aaa",
                padding: "60px 0",
                fontSize: "1rem",
              }}
            >
              🛒
              <br />
              ຍັງບໍ່ມີສິນຄ້າໃນລາຍການ
            </div>
          ) : (
            <table>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  background: "#fff",
                  zIndex: 1,
                }}
              >
                <tr>
                  <th>ສິນຄ້າ</th>
                  <th className="text-center">ຈຳນວນ</th>
                  <th className="text-right">ລາຄາ</th>
                  <th className="text-right">ລວມ</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.product_id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.product_name}</div>
                      <div style={{ fontSize: ".76rem", color: "#aaa" }}>
                        {fmt(item.selling_price)}/{item.unit_abbr || "ອັນ"}
                      </div>
                    </td>
                    <td>
                      <div
                        className="flex items-center gap-2"
                        style={{ justifyContent: "center" }}
                      >
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: "2px 9px" }}
                          onClick={() => qtyChange(item.product_id, -1)}
                        >
                          −
                        </button>
                        <span
                          className="mono"
                          style={{ minWidth: 28, textAlign: "center" }}
                        >
                          {item.qty}
                        </span>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ padding: "2px 9px" }}
                          onClick={() => qtyChange(item.product_id, 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="text-right mono">
                      {fmt(item.selling_price)}
                    </td>
                    <td className="text-right mono" style={{ fontWeight: 600 }}>
                      {fmt(item.qty * item.selling_price)}
                    </td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: "3px 8px" }}
                        onClick={() =>
                          setCart((c) =>
                            c.filter((i) => i.product_id !== item.product_id),
                          )
                        }
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div
        style={{
          width: 310,
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        <div style={{ padding: "18px 18px 0", flex: 1, overflowY: "auto" }}>
          <div style={{ fontWeight: 700, marginBottom: 14 }}>ສະຫຼຸບຍອດ</div>
          <div
            style={{
              borderBottom: "1px dashed #e2e0d8",
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            {cart.map((i) => (
              <div
                key={i.product_id}
                className="flex justify-between"
                style={{ fontSize: ".82rem", marginBottom: 3 }}
              >
                <span className="text-muted">
                  {i.product_name} ×{i.qty}
                </span>
                <span className="mono">{fmt(i.qty * i.selling_price)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between mb-2 text-sm">
            <span>ລາຄາລວມ</span>
            <span className="mono">{fmt(subtotal)}</span>
          </div>
          <div
            className="flex justify-between mb-3"
            style={{ alignItems: "center" }}
          >
            <span style={{ fontSize: ".88rem" }}>ສ່ວນຫຼຸດ</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDisc(Number(e.target.value))}
              min="0"
              style={{ width: 90, textAlign: "right" }}
            />
          </div>
          <div
            className="flex justify-between"
            style={{
              fontWeight: 700,
              fontSize: "1.2rem",
              borderTop: "2px solid #1a1917",
              paddingTop: 10,
              marginBottom: 14,
            }}
          >
            <span>ຍອດສຸດທິ</span>
            <span className="mono" style={{ color: "#1a6b3c" }}>
              {fmt(total)}
            </span>
          </div>
          <div className="form-group">
            <label>ວິທີຊຳລະ</label>
            <select value={method} onChange={(e) => setMeth(e.target.value)}>
              <option value="cash">💵 ເງິນສົດ</option>
              <option value="transfer">📱 ໂອນເງິນ</option>
              <option value="other">ອື່ນໆ</option>
            </select>
          </div>
          {method === "cash" && (
            <>
              <div className="form-group">
                <label>ຮັບເງິນມາ (₭)</label>
                <input
                  type="number"
                  value={paid}
                  onChange={(e) => setPaid(e.target.value)}
                  placeholder="0"
                  style={{ fontSize: "1.1rem", fontWeight: 600 }}
                />
              </div>
              {Number(paid) >= total && total > 0 && (
                <div
                  style={{
                    background: "#d4edda",
                    borderRadius: 8,
                    padding: "9px 12px",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: ".78rem", color: "#155724" }}>
                    ເງິນທອນ
                  </div>
                  <div
                    style={{
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      color: "#155724",
                      fontFamily: "var(--mono)",
                    }}
                  >
                    {fmt(change)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <div
          style={{ padding: "10px 18px 18px", borderTop: "1px solid #e2e0d8" }}
        >
          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "13px",
              fontSize: ".95rem",
              marginBottom: 8,
            }}
            onClick={checkout}
            disabled={busy || !cart.length}
          >
            {busy ? "ກຳລັງບັນທຶກ..." : `✅ ຊຳລະເງິນ ${fmt(total)}`}
          </button>
          <button
            className="btn btn-outline"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => {
              setCart([]);
              setDisc(0);
              setPaid("");
              setErr("");
            }}
          >
            🗑️ ລ້າງລາຍການ
          </button>
        </div>
      </div>

      {/* Receipt */}
      {receipt && (
        <div className="modal-overlay">
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: "26px 30px",
              width: 360,
              boxShadow: "0 20px 60px rgba(0,0,0,.3)",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 28 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: "1.15rem" }}>
                ຊຳລະເງິນສຳເລັດ
              </div>
              <div className="mono text-sm text-muted">
                {receipt.receipt_number}
              </div>
            </div>
            {receipt.items.map((i) => (
              <div
                key={i.product_id}
                className="flex justify-between text-sm mb-1"
              >
                <span>
                  {i.product_name} ×{i.qty}
                </span>
                <span className="mono">{fmt(i.qty * i.selling_price)}</span>
              </div>
            ))}
            <div
              style={{
                borderTop: "1px dashed #e2e0d8",
                margin: "10px 0",
                paddingTop: 10,
              }}
            >
              <div className="flex justify-between mb-1 text-sm">
                <span>ລາຄາລວມ</span>
                <span className="mono">{fmt(receipt.subtotal)}</span>
              </div>
              {receipt.discount > 0 && (
                <div className="flex justify-between mb-1 text-sm">
                  <span>ສ່ວນຫຼຸດ</span>
                  <span className="mono text-danger">
                    -{fmt(receipt.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between" style={{ fontWeight: 700 }}>
                <span>ສຸດທິ</span>
                <span className="mono" style={{ color: "#1a6b3c" }}>
                  {fmt(receipt.total)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>ຮັບມາ</span>
                <span className="mono">{fmt(receipt.paid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>ທອນ</span>
                <span className="mono">{fmt(receipt.change_amount)}</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", marginTop: 10 }}
              onClick={() => setRec(null)}
            >
              🧾 ຂາຍລາຍການຕໍ່ໄປ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
