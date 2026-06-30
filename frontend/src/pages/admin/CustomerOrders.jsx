import { useState, useEffect } from "react";
import api from "../../utils/api";

const BASE = "http://localhost:4000";
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

const STATUS_TH = {
  pending: "ລໍຖ້າ",
  confirmed: "ຢືນຢັນ",
  completed: "ສຳເລັດ",
  cancelled: "ຍົກເລີກ",
};
const STATUS_BADGE = {
  pending: "badge-yellow",
  confirmed: "badge-blue",
  completed: "badge-green",
  cancelled: "badge-red",
};
const PAY_TH = { cash: "💵 ເງິນສົດ", transfer: "📱 ໂອນເງິນ" };
const PAY_STATUS_TH = { pending: "ລໍຖ້າຢືນຢັນ", paid: "ຊຳລະແລ້ວ" };

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = (status = "") => {
    api
      .get(`/customer-orders/admin/all${status ? `?status=${status}` : ""}`)
      .then((r) => setOrders(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    load(filter);
    const interval = setInterval(() => load(filter), 10000); // ດຶງໃໝ່ທຸກ 10 ວິນາທີ
    return () => clearInterval(interval);
  }, [filter]);

  async function openDetail(id) {
    try {
      const { data } = await api.get(`/customer-orders/admin/${id}`);
      setDetail(data);
    } catch (e) {
      alert("ບໍ່ສາມາດໂຫລດລາຍລະອຽດໄດ້");
    }
  }

  async function updateStatus(id, status) {
    if (!confirm(`ປ່ຽນສະຖານະເປັນ "${STATUS_TH[status]}"?`)) return;
    setBusy(true);
    try {
      await api.post(`/customer-orders/admin/${id}/status`, { status });
      load(filter);
      if (detail?.order_id === id) openDetail(id);
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  async function markPaid(id) {
    setBusy(true);
    try {
      await api.post(`/customer-orders/admin/${id}/status`, {
        payment_status: "paid",
      });
      load(filter);
      if (detail?.order_id === id) openDetail(id);
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <h1 className="page-title">ຄຳສັ່ງຊື້ຈາກລູກຄ້າ</h1>

      {/* Status filter tabs */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        <button
          className={`btn btn-sm ${!filter ? "btn-primary" : "btn-outline"}`}
          onClick={() => setFilter("")}
        >
          ທັງໝົດ ({orders.length})
        </button>
        {Object.entries(STATUS_TH).map(([key, label]) => (
          <button
            key={key}
            className={`btn btn-sm ${filter === key ? "btn-primary" : "btn-outline"}`}
            onClick={() => setFilter(key)}
          >
            {label} {counts[key] ? `(${counts[key]})` : ""}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th>ເລກທີ</th>
              <th>ລູກຄ້າ</th>
              <th>ວັນທີ</th>
              <th className="text-right">ຍອດ</th>
              <th>ການຊຳລະ</th>
              <th>ສະຖານະ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 24, color: "#aaa" }}
                >
                  ບໍ່ມີຄຳສັ່ງຊື້
                </td>
              </tr>
            )}
            {orders.map((o) => (
              <tr key={o.order_id}>
                <td
                  className="mono"
                  style={{ fontWeight: 600, color: "#185FA5" }}
                >
                  {o.order_number}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>
                    {o.first_name} {o.last_name}
                  </div>
                  <div style={{ fontSize: ".78rem", color: "#706e66" }}>
                    @{o.username} · {o.phone || "—"}
                  </div>
                </td>
                <td style={{ fontSize: ".85rem" }}>
                  {new Date(o.created_at).toLocaleString("lo-LA")}
                </td>
                <td className="text-right mono" style={{ fontWeight: 600 }}>
                  {fmt(o.total_amount)}
                </td>
                <td>
                  <div>{PAY_TH[o.payment_method]}</div>
                  <span
                    className={`badge ${o.payment_status === "paid" ? "badge-green" : "badge-yellow"}`}
                    style={{ fontSize: ".7rem" }}
                  >
                    {PAY_STATUS_TH[o.payment_status]}
                  </span>
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[o.status]}`}>
                    {STATUS_TH[o.status]}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => openDetail(o.order_id)}
                  >
                    ລາຍລະອຽດ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 600 }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    fontFamily: "monospace",
                    color: "#185FA5",
                  }}
                >
                  {detail.order_number}
                </div>
                <div
                  style={{ fontSize: ".82rem", color: "#706e66", marginTop: 2 }}
                >
                  {new Date(detail.created_at).toLocaleString("lo-LA")}
                </div>
              </div>
              <span
                className={`badge ${STATUS_BADGE[detail.status]}`}
                style={{ fontSize: ".85rem" }}
              >
                {STATUS_TH[detail.status]}
              </span>
            </div>

            {/* Customer info */}
            <div
              style={{
                background: "#f5f4f0",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 6 }}>👤 ລູກຄ້າ</div>
              <div style={{ fontSize: ".88rem" }}>
                {detail.first_name} {detail.last_name} (@{detail.username})
              </div>
              <div style={{ fontSize: ".82rem", color: "#706e66" }}>
                {detail.phone || "—"} · {detail.email || "—"}
              </div>
            </div>

            {/* Items */}
            <div style={{ fontWeight: 600, marginBottom: 10 }}>
              🛒 ລາຍການສິນຄ້າ
            </div>
            <div
              style={{
                border: "1px solid #e2e0d8",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              {detail.items?.map((item) => (
                <div
                  key={item.item_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    borderBottom: "1px solid #f0eeea",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      background: "#f5f4f0",
                      borderRadius: 6,
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
                      <span>📦</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: ".9rem" }}>
                      {item.product_name}
                    </div>
                    <div style={{ fontSize: ".78rem", color: "#706e66" }}>
                      {item.barcode || "—"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: ".85rem" }}>
                      {item.qty} × {fmt(item.unit_price)}
                    </div>
                    <div style={{ fontWeight: 600 }}>{fmt(item.subtotal)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment info */}
            <div
              style={{
                background:
                  detail.payment_method === "transfer" ? "#f0f7fc" : "#f5f4f0",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {PAY_TH[detail.payment_method]}
                  </div>
                  {detail.transfer_ref && (
                    <div
                      style={{
                        fontSize: ".85rem",
                        color: "#706e66",
                        marginTop: 4,
                      }}
                    >
                      ເລກອ້າງອີງ:{" "}
                      <span className="mono" style={{ color: "#185FA5" }}>
                        {detail.transfer_ref}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className={`badge ${detail.payment_status === "paid" ? "badge-green" : "badge-yellow"}`}
                  >
                    {PAY_STATUS_TH[detail.payment_status]}
                  </span>
                  {detail.payment_status === "pending" && (
                    <div style={{ marginTop: 8 }}>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => markPaid(detail.order_id)}
                        disabled={busy}
                      >
                        ✅ ຢືນຢັນຊຳລະແລ້ວ
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between"
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                borderTop: "2px solid #1a1917",
                paddingTop: 12,
                marginBottom: 20,
              }}
            >
              <span>ຍອດລວມ</span>
              <span style={{ color: "#185FA5" }}>
                {fmt(detail.total_amount)}
              </span>
            </div>

            {/* Status actions */}
            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                marginBottom: 16,
              }}
            >
              {detail.status === "pending" && (
                <>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => updateStatus(detail.order_id, "confirmed")}
                    disabled={busy}
                  >
                    ✅ ຢືນຢັນອໍເດີ (ຕັດສາງ)
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => updateStatus(detail.order_id, "cancelled")}
                    disabled={busy}
                  >
                    ❌ ຍົກເລີກ
                  </button>
                </>
              )}
              {detail.status === "confirmed" && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => updateStatus(detail.order_id, "completed")}
                  disabled={busy}
                >
                  📦 ສຳເລັດ (ສົ່ງມອບແລ້ວ)
                </button>
              )}
            </div>

            <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setDetail(null)}
              >
                ປິດ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
