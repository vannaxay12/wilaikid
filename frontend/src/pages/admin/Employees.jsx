import { useEffect, useState } from "react";
import api from "../../utils/api";

const empty = {
  first_name: "",
  last_name: "",
  phone: "",
  username: "",
  password: "",
  role: "cashier",
  hire_date: "",
  is_active: 1,
};

export default function Employees() {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get("/employees")
      .then((r) => setList(r.data))
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setBusy(true);
    try {
      if (modal === "add") await api.post("/employees", form);
      else await api.put(`/employees/${form.employee_id}`, form);
      setModal(null);
      load();
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  const F = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>
          ຈັດການພະນັກງານ
        </h1>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setForm(empty);
            setModal("add");
          }}
        >
          + ເພີ່ມພະນັກງານ
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>ຊື່-ນາມສະກຸນ</th>
              <th>ເບີໂທ</th>
              <th>Username</th>
              <th>ສິດທິ</th>
              <th>ວັນເລີ່ມວຽກ</th>
              <th>ສະຖານະ</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: 24, color: "#aaa" }}
                >
                  ກຳລັງໂຫລດ...
                </td>
              </tr>
            )}
            {list.map((e) => (
              <tr key={e.employee_id}>
                <td style={{ fontWeight: 500 }}>
                  {e.first_name} {e.last_name}
                </td>
                <td>{e.phone}</td>
                <td className="mono">{e.username}</td>
                <td>
                  <span
                    className={`badge ${e.role === "admin" ? "badge-blue" : "badge-gray"}`}
                  >
                    {e.role}
                  </span>
                </td>
                <td>{e.hire_date?.slice(0, 10)}</td>
                <td>
                  <span
                    className={`badge ${e.is_active ? "badge-green" : "badge-red"}`}
                  >
                    {e.is_active ? "ກຳລັງວຽກ" : "ບໍ່ໃຊ້ງານ"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => {
                      setForm({ ...e, password: "" });
                      setModal("edit");
                    }}
                  >
                    ແກ້ໄຂ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 500 }}>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 20 }}
            >
              {modal === "add" ? "ເພີ່ມພະນັກງານ" : "ແກ້ໄຂພະນັກງານ"}
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ຊື່</label>
                <input
                  value={form.first_name}
                  onChange={(e) => F("first_name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ນາມສະກຸນ</label>
                <input
                  value={form.last_name}
                  onChange={(e) => F("last_name", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ເບີໂທ</label>
                <input
                  value={form.phone}
                  onChange={(e) => F("phone", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>ວັນທີເລີ່ມວຽກ</label>
                <input
                  type="date"
                  value={form.hire_date?.slice(0, 10) || ""}
                  onChange={(e) => F("hire_date", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Username</label>
                <input
                  value={form.username}
                  onChange={(e) => F("username", e.target.value)}
                  disabled={modal === "edit"}
                />
              </div>
              <div className="form-group">
                <label>
                  ລະຫັດຜ່ານ
                  {modal === "edit" ? " (ເວັ້ນວ່າງເພື່ອບໍ່ປ່ຽນ)" : " *"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => F("password", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>ສິດທິ</label>
                <select
                  value={form.role}
                  onChange={(e) => F("role", e.target.value)}
                >
                  <option value="admin">admin</option>
                  <option value="cashier">cashier</option>
                  <option value="stock">stock</option>
                </select>
              </div>
              {modal === "edit" && (
                <div className="form-group">
                  <label>ສະຖານະ</label>
                  <select
                    value={form.is_active}
                    onChange={(e) => F("is_active", Number(e.target.value))}
                  >
                    <option value={1}>ກຳລັງວຽກ</option>
                    <option value={0}>ບໍ່ໃຊ້ງານ</option>
                  </select>
                </div>
              )}
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
                disabled={busy}
              >
                {busy ? "ກຳລັງບັນທຶກ..." : "ບັນທຶກ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
