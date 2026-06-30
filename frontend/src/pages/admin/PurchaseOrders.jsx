import { useEffect, useState } from "react";
import api from "../../utils/api";
const SC = {
  pending: "badge-yellow",
  confirmed: "badge-blue",
  received: "badge-green",
  cancelled: "badge-red",
};
const ST = {
  pending: "ລໍຖ້າດຳເນີນການ",
  confirmed: "ຢືນຢັນແລ້ວ",
  received: "ຮັບສິນຄ້າແລ້ວ",
  cancelled: "ຍົກເລີກ",
};
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

export default function PurchaseOrders() {
  const [list, setList] = useState([]);
  const [suppliers, setSupps] = useState([]);
  const [products, setProds] = useState([]);
  const [modal, setModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().slice(0, 10),
    expected_date: "",
    notes: "",
    items: [],
  });

  useEffect(() => {
    api.get("/purchases").then((r) => setList(r.data));
    api.get("/suppliers").then((r) => setSupps(r.data));
    api.get("/products").then((r) => setProds(r.data));
  }, []);

  function addItem() {
    setForm((f) => ({
      ...f,
      items: [...f.items, { product_id: "", qty_ordered: 1, unit_cost: 0 }],
    }));
  }
  function setItem(i, k, v) {
    setForm((f) => {
      const it = [...f.items];
      it[i] = { ...it[i], [k]: v };
      return { ...f, items: it };
    });
  }
  function removeItem(i) {
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));
  }
  const total = form.items.reduce(
    (s, it) => s + it.qty_ordered * it.unit_cost,
    0,
  );

  async function save() {
    if (!form.supplier_id || !form.items.length)
      return alert("ກະລຸນາເລືອກຜູ້ສະໜອງ ແລະ ເພີ່ມສິນຄ້າ");
    setBusy(true);
    try {
      await api.post("/purchases", form);
      setModal(false);
      api.get("/purchases").then((r) => setList(r.data));
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>
          ໃບສັ່ງຊື້ສິນຄ້າ
        </h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm({
              supplier_id: "",
              order_date: new Date().toISOString().slice(0, 10),
              expected_date: "",
              notes: "",
              items: [],
            });
            setModal(true);
          }}
        >
          + ສ້າງໃບສັ່ງຊື້
        </button>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ເລກທີ PO</th>
              <th>ຜູ້ສະໜອງ</th>
              <th>ວັນທີສັ່ງ</th>
              <th className="text-right">ຍອດລວມ</th>
              <th>ສະຖານະ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.po_id}>
                <td className="mono">{p.po_number}</td>
                <td>{p.supplier_name}</td>
                <td>{p.order_date?.slice(0, 10)}</td>
                <td className="text-right mono">{fmt(p.total_amount)}</td>
                <td>
                  <span className={`badge ${SC[p.status]}`}>
                    {ST[p.status]}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={async () => {
                      const r = await api.get(`/purchases/${p.po_id}`);
                      setDetail(r.data);
                    }}
                  >
                    ລາຍລະອຽດ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 680 }}>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}
            >
              ສ້າງໃບສັ່ງຊື້ສິນຄ້າ
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ຜູ້ສະໜອງ *</label>
                <select
                  value={form.supplier_id}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, supplier_id: e.target.value }))
                  }
                >
                  <option value="">— ເລືອກ —</option>
                  {suppliers.map((s) => (
                    <option key={s.supplier_id} value={s.supplier_id}>
                      {s.supplier_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>ວັນທີສັ່ງ</label>
                <input
                  type="date"
                  value={form.order_date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, order_date: e.target.value }))
                  }
                />
              </div>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div className="flex items-center justify-between mb-2">
                <label style={{ margin: 0 }}>ລາຍການສິນຄ້າ</label>
                <button className="btn btn-outline btn-sm" onClick={addItem}>
                  + ເພີ່ມລາຍການ
                </button>
              </div>
              {form.items.map((it, i) => (
                <div
                  key={i}
                  className="flex gap-2 mb-2"
                  style={{ alignItems: "center" }}
                >
                  <select
                    style={{ flex: 2 }}
                    value={it.product_id}
                    onChange={(e) => {
                      const p = products.find(
                        (x) => x.product_id == e.target.value,
                      );
                      setItem(i, "product_id", e.target.value);
                      if (p) setItem(i, "unit_cost", p.cost_price);
                    }}
                  >
                    <option value="">ເລືອກສິນຄ້າ</option>
                    {products.map((p) => (
                      <option key={p.product_id} value={p.product_id}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    style={{ flex: 1 }}
                    placeholder="ຈຳນວນ"
                    value={it.qty_ordered}
                    onChange={(e) =>
                      setItem(i, "qty_ordered", Number(e.target.value))
                    }
                    min="1"
                  />
                  <input
                    type="number"
                    step="0.01"
                    style={{ flex: 1 }}
                    placeholder="ລາຄາທຶນ"
                    value={it.unit_cost}
                    onChange={(e) =>
                      setItem(i, "unit_cost", Number(e.target.value))
                    }
                  />
                  <span
                    className="mono text-sm"
                    style={{ minWidth: 80, textAlign: "right" }}
                  >
                    {fmt(it.qty_ordered * it.unit_cost)}
                  </span>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeItem(i)}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <div
                className="text-right mono"
                style={{ fontWeight: 600, marginTop: 8 }}
              >
                ລວມ: {fmt(total)}
              </div>
            </div>
            <div
              className="flex gap-2 mt-3"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setModal(false)}
              >
                ຍົກເລີກ
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={busy}
              >
                {busy ? "ກຳລັງບັນທຶກ..." : "ສ້າງໃບສັ່ງຊື້"}
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontWeight: 700 }}>PO: {detail.po_number}</div>
              <span className={`badge ${SC[detail.status]}`}>
                {ST[detail.status]}
              </span>
            </div>
            <table>
              <thead>
                <tr>
                  <th>ສິນຄ້າ</th>
                  <th className="text-right">ຈຳນວນ</th>
                  <th className="text-right">ລາຄາ</th>
                  <th className="text-right">ລວມ</th>
                </tr>
              </thead>
              <tbody>
                {detail.items?.map((it) => (
                  <tr key={it.po_item_id}>
                    <td>{it.product_name}</td>
                    <td className="text-right">{it.qty_ordered}</td>
                    <td className="text-right mono">{fmt(it.unit_cost)}</td>
                    <td className="text-right mono">{fmt(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div
              className="text-right mono"
              style={{ fontWeight: 700, marginTop: 12 }}
            >
              ລວມ: {fmt(detail.total_amount)}
            </div>
            <div
              className="flex gap-2 mt-3"
              style={{ justifyContent: "flex-end" }}
            >
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
