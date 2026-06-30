import { useEffect, useState } from "react";
import api from "../../utils/api";

const ROLE_LABEL = {
  cashier: "💳 ແຄັດເຊຍ",
  stock: "📦 ສາງ",
  admin: "⚙️ ແອດມິນ",
};

export default function ApprovalQueue() {
  const [pending, setPending] = useState([]);
  const [modal, setModal] = useState(null);
  const [role, setRole] = useState("cashier");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [allEmps, setAllEmps] = useState([]);
  const [tab, setTab] = useState("pending");

  const loadPending = () =>
    api.get("/auth/pending").then((r) => setPending(r.data));
  const loadAll = () => api.get("/employees").then((r) => setAllEmps(r.data));
  useEffect(() => {
    loadPending();
    loadAll();
  }, []);

  async function approve() {
    setBusy(true);
    try {
      await api.post(`/auth/approve/${modal.emp.employee_id}`, { role });
      setModal(null);
      loadPending();
      loadAll();
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  async function reject() {
    setBusy(true);
    try {
      await api.post(`/auth/reject/${modal.emp.employee_id}`, { reason });
      setModal(null);
      setReason("");
      loadPending();
      loadAll();
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setBusy(false);
    }
  }

  const STATUS_BADGE = {
    approved: <span className="badge badge-green">✅ ອະນຸມັດແລ້ວ</span>,
    pending: <span className="badge badge-yellow">⏳ ລໍຖ້າອະນຸມັດ</span>,
    rejected: <span className="badge badge-red">❌ ປະຕິເສດ</span>,
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>
          ຈັດການບັນຊີພະນັກງານ
        </h1>
        {pending.length > 0 && (
          <span
            className="badge badge-red"
            style={{ fontSize: ".85rem", padding: "5px 12px" }}
          >
            🔔 ລໍຖ້າອະນຸມັດ {pending.length} ຄົນ
          </span>
        )}
      </div>
      <div className="flex gap-2 mb-4">
        <button
          className={`btn btn-sm ${tab === "pending" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("pending")}
        >
          ⏳ ລໍຖ້າອະນຸມັດ {pending.length > 0 && `(${pending.length})`}
        </button>
        <button
          className={`btn btn-sm ${tab === "all" ? "btn-primary" : "btn-outline"}`}
          onClick={() => setTab("all")}
        >
          👥 ພະນັກງານທັງໝົດ
        </button>
      </div>

      {tab === "pending" && (
        <div className="card" style={{ padding: 0 }}>
          {pending.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#aaa" }}>
              ✅ ບໍ່ມີຄຳຂໍລໍຖ້າອະນຸມັດ
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ຊື່-ນາມສະກຸນ</th>
                  <th>Username</th>
                  <th>ເບີໂທ</th>
                  <th>ຕຳແໜ່ງທີ່ຂໍ</th>
                  <th>ວັນທີສະໝັກ</th>
                  <th>ດຳເນີນການ</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((emp) => (
                  <tr key={emp.employee_id}>
                    <td style={{ fontWeight: 500 }}>
                      {emp.first_name} {emp.last_name}
                    </td>
                    <td className="mono">{emp.username}</td>
                    <td>{emp.phone || "—"}</td>
                    <td>
                      <span className="badge badge-blue">
                        {ROLE_LABEL[emp.requested_role]}
                      </span>
                    </td>
                    <td style={{ fontSize: ".82rem", color: "#706e66" }}>
                      {new Date(emp.created_at).toLocaleString("lo-LA")}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            setRole(emp.requested_role);
                            setModal({ emp, action: "approve" });
                          }}
                        >
                          ✅ ອະນຸມັດ
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            setReason("");
                            setModal({ emp, action: "reject" });
                          }}
                        >
                          ❌ ປະຕິເສດ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "all" && (
        <div className="card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ຊື່-ນາມສະກຸນ</th>
                <th>Username</th>
                <th>ສິດທິ</th>
                <th>ສະຖານະບັນຊີ</th>
                <th>ວັນທີສະໝັກ</th>
              </tr>
            </thead>
            <tbody>
              {allEmps.map((e) => (
                <tr key={e.employee_id}>
                  <td style={{ fontWeight: 500 }}>
                    {e.first_name} {e.last_name}
                  </td>
                  <td className="mono">{e.username}</td>
                  <td>
                    <span
                      className={`badge ${e.role === "admin" ? "badge-blue" : "badge-gray"}`}
                    >
                      {e.role}
                    </span>
                  </td>
                  <td>
                    {STATUS_BADGE[e.approval_status] ||
                      STATUS_BADGE["approved"]}
                  </td>
                  <td style={{ fontSize: ".82rem", color: "#706e66" }}>
                    {e.hire_date?.slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal?.action === "approve" && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}
            >
              ✅ ອະນຸມັດບັນຊີ
            </div>
            <p
              style={{ color: "#706e66", fontSize: ".9rem", marginBottom: 20 }}
            >
              <strong>
                {modal.emp.first_name} {modal.emp.last_name}
              </strong>{" "}
              (@{modal.emp.username})
            </p>
            <div className="form-group">
              <label>ກຳນົດສິດທິການໃຊ້ງານ</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="cashier">💳 Cashier — ແຄັດເຊຍ</option>
                <option value="stock">📦 Stock — ພະນັກງານສາງ</option>
                <option value="admin">⚙️ Admin — ຜູ້ຈັດການ</option>
              </select>
            </div>
            <div
              style={{
                background: "#d4edda",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: ".82rem",
                color: "#155724",
                marginBottom: 16,
              }}
            >
              ພະນັກງານຈະສາມາດ login ເຂົ້າລະບົບໄດ້ທັນທີຫຼັງອະນຸມັດ
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setModal(null)}
              >
                ຍົກເລີກ
              </button>
              <button
                className="btn btn-primary"
                onClick={approve}
                disabled={busy}
              >
                {busy ? "ກຳລັງດຳເນີນການ..." : "✅ ຢືນຢັນອະນຸມັດ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal?.action === "reject" && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 440 }}>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}
            >
              ❌ ປະຕິເສດຄຳຂໍ
            </div>
            <p
              style={{ color: "#706e66", fontSize: ".9rem", marginBottom: 20 }}
            >
              <strong>
                {modal.emp.first_name} {modal.emp.last_name}
              </strong>{" "}
              (@{modal.emp.username})
            </p>
            <div className="form-group">
              <label>ເຫດຜົນການປະຕິເສດ (ບໍ່ບັງຄັບ)</label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="ເຊັ່ນ: ຂໍ້ມູນບໍ່ຄົບຖ້ວນ"
              />
            </div>
            <div
              style={{
                background: "#f8d7da",
                borderRadius: 8,
                padding: "10px 12px",
                fontSize: ".82rem",
                color: "#721c24",
                marginBottom: 16,
              }}
            >
              ບັນຊີຈະຖືກລະງັບ ພະນັກງານຈະບໍ່ສາມາດ login ໄດ້
            </div>
            <div className="flex gap-2" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn btn-outline"
                onClick={() => setModal(null)}
              >
                ຍົກເລີກ
              </button>
              <button
                className="btn btn-danger"
                onClick={reject}
                disabled={busy}
              >
                {busy ? "ກຳລັງດຳເນີນການ..." : "❌ ຢືນຢັນປະຕິເສດ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
