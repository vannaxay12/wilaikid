import { useEffect, useState } from "react";
import api from "../../utils/api";

const empty = {
  barcode: "",
  product_name: "",
  category_id: "",
  unit_id: "",
  supplier_id: "",
  cost_price: "",
  selling_price: "",
  stock_qty: 0,
  min_stock_level: 5,
  expiry_date: "",
};
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;
const BASE = "http://localhost:4000";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [units, setUnits] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);

  const load = (q = "") =>
    api
      .get(`/products${q ? `?search=${q}` : ""}`)
      .then((r) => setProducts(r.data));
  useEffect(() => {
    load();
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/units").then((r) => setUnits(r.data));
    api.get("/suppliers").then((r) => setSuppliers(r.data));
  }, []);

  function openModal(mode, p = empty) {
    setForm(p);
    setModal(mode);
    setImgFile(null);
    setImgPreview(p.image ? BASE + p.image : null);
  }

  function onImgChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  }

  async function save() {
    setSaving(true);
    try {
      let savedId = form.product_id;

      if (modal === "add") {
        const r = await api.post("/products", form);
        savedId = r.data.product_id;
      } else {
        await api.put(`/products/${form.product_id}`, form);
      }

      // ອັບໂຫລດຮູບຖ້າເລືອກໃໝ່
      if (imgFile && savedId) {
        const fd = new FormData();
        fd.append("image", imgFile);
        fd.append("product_id", savedId);
        await api.post("/upload/product", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      setModal(null);
      load(search);
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setSaving(false);
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>
          ຈັດການສິນຄ້າ
        </h1>
        <div className="flex gap-2">
          <input
            placeholder="ຄົ້ນຫາສິນຄ້າ / ບາໂຄດ/ປະເພດສິນຄ້າ"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load(search)}
            style={{ width: 230 }}
          />
          <button
            className="btn btn-outline btn-sm"
            onClick={() => load(search)}
          >
            ຄົ້ນຫາ
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => openModal("add")}
          >
            + ເພີ່ມສິນຄ້າ
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table>
          <thead>
            <tr>
              <th style={{ width: 60 }}>ຮູບ</th>
              <th>ບາໂຄດ</th>
              <th>ຊື່ສິນຄ້າ</th>
              <th>ປະເພດສິນຄ້າ</th>
              <th className="text-right">ລາຄາທຶນ</th>
              <th className="text-right">ລາຄາຂາຍ</th>
              <th className="text-right">ສາງ</th>
              <th>ສະຖານະ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="text-center text-muted"
                  style={{ padding: 24 }}
                >
                  ບໍ່ພົບສິນຄ້າ
                </td>
              </tr>
            )}
            {products.map((p) => (
              <tr key={p.product_id}>
                <td>
                  {p.image ? (
                    <img
                      src={BASE + p.image}
                      alt={p.product_name}
                      style={{
                        width: 44,
                        height: 44,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid #e2e0d8",
                      }}
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: "#f5f4f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 20,
                      }}
                    >
                      📦
                    </div>
                  )}
                </td>
                <td className="mono text-sm">{p.barcode || "—"}</td>
                <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                <td>{p.category_name}</td>
                <td className="text-right mono">{fmt(p.cost_price)}</td>
                <td className="text-right mono">{fmt(p.selling_price)}</td>
                <td className="text-right mono">
                  {p.stock_qty} {p.unit_abbr}
                </td>
                <td>
                  {p.is_low ? (
                    <span className="badge badge-red">ສາງຕ່ຳ</span>
                  ) : (
                    <span className="badge badge-green">ປົກກະຕິ</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => openModal("edit", p)}
                    >
                      ແກ້ໄຂ
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={async () => {
                        if (confirm(`ລົບ "${p.product_name}"?`)) {
                          await api.delete(`/products/${p.product_id}`);
                          load(search);
                        }
                      }}
                    >
                      ລົບ
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 580 }}>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}
            >
              {modal === "add" ? "ເພີ່ມສິນຄ້າໃໝ່" : "ແກ້ໄຂສິນຄ້າ"}
            </div>

            {/* Image upload */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
                padding: "14px",
                background: "#f5f4f0",
                borderRadius: 10,
              }}
            >
              {imgPreview ? (
                <img
                  src={imgPreview}
                  alt="preview"
                  style={{
                    width: 72,
                    height: 72,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #e2e0d8",
                    flexShrink: 0,
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    background: "#e2e0d8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    flexShrink: 0,
                  }}
                >
                  📦
                </div>
              )}
              <div>
                <div
                  style={{
                    fontWeight: 500,
                    fontSize: ".88rem",
                    marginBottom: 6,
                  }}
                >
                  ຮູບສິນຄ້າ
                </div>
                <label style={{ cursor: "pointer" }}>
                  <span
                    className="btn btn-outline btn-sm"
                    style={{ display: "inline-flex" }}
                  >
                    📷 ເລືອກຮູບ
                  </span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    style={{ display: "none" }}
                    onChange={onImgChange}
                  />
                </label>
                <div
                  style={{ fontSize: ".75rem", color: "#aaa", marginTop: 4 }}
                >
                  JPG, PNG, WEBP · ສູງສຸດ 3MB
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>ບາໂຄດ</label>
                <input
                  value={form.barcode}
                  onChange={(e) => F("barcode", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ຊື່ສິນຄ້າ *</label>
                <input
                  value={form.product_name}
                  onChange={(e) => F("product_name", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ປະເພດ</label>
                <select
                  value={form.category_id}
                  onChange={(e) => F("category_id", e.target.value)}
                >
                  <option value="">— ເລືອກ —</option>
                  {cats.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>ໜ່ວຍນັບ</label>
                <select
                  value={form.unit_id}
                  onChange={(e) => F("unit_id", e.target.value)}
                >
                  <option value="">— ເລືອກ —</option>
                  {units.map((u) => (
                    <option key={u.unit_id} value={u.unit_id}>
                      {u.unit_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ລາຄາທຶນ (₭)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cost_price}
                  onChange={(e) => F("cost_price", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ລາຄາຂາຍ (₭)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.selling_price}
                  onChange={(e) => F("selling_price", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ສາງຄົງເຫຼືອ</label>
                <input
                  type="number"
                  value={form.stock_qty}
                  onChange={(e) => F("stock_qty", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ສາງຂັ້ນຕ່ຳ</label>
                <input
                  type="number"
                  value={form.min_stock_level}
                  onChange={(e) => F("min_stock_level", e.target.value)}
                />
              </div>
            </div>

            <div
              className="flex gap-2 mt-3"
              style={{ justifyContent: "flex-end" }}
            >
              <button
                className="btn btn-outline"
                onClick={() => setModal(null)}
              >
                ຍົກເລີກ
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={saving}
              >
                {saving ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
