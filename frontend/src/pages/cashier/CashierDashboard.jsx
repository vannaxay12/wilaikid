import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";

const BASE = "http://localhost:4000";
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

export default function CashierDashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("pos");

  // Profile
  const [profile, setProfile] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);
  const [imgFile, setImgFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pwForm, setPwForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwMsg, setPwMsg] = useState("");
  const [pwErr, setPwErr] = useState("");
  const imgRef = useRef();

  // Sales history
  const [sales, setSales] = useState([]);
  const [today, setToday] = useState({ revenue: 0, bills: 0 });

  // Stock
  const [stock, setStock] = useState([]);

  useEffect(() => {
    const d = new Date().toISOString().slice(0, 10);
    api
      .get(`/sales?from=${d}&to=${d}&limit=50`)
      .then((r) => {
        setSales(r.data);
        const rev = r.data.reduce((s, i) => s + Number(i.total_amount), 0);
        setToday({ revenue: rev, bills: r.data.length });
      })
      .catch(() => {});
    api
      .get("/products")
      .then((r) => setStock(r.data))
      .catch(() => {});
    api
      .get("/upload/me")
      .then((r) => {
        setProfile(r.data);
        if (r.data.profile_image) setImgPreview(BASE + r.data.profile_image);
      })
      .catch(() => {});
  }, []);

  function onImgChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setImgPreview(URL.createObjectURL(f));
  }

  async function uploadImg() {
    if (!imgFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", imgFile);
      const { data } = await api.post("/upload/profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImgPreview(BASE + data.imageUrl);
      setImgFile(null);
      alert("ອັບໂຫລດຮູບສຳເລັດ ✅");
    } catch (e) {
      alert(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    } finally {
      setUploading(false);
    }
  }

  async function changePassword() {
    setPwMsg("");
    setPwErr("");
    if (!pwForm.old_password || !pwForm.new_password)
      return setPwErr("ກະລຸນາກໍ່ລ໌ຂໍ້ມູນໃຫ້ຄົບ");
    if (pwForm.new_password !== pwForm.confirm_password)
      return setPwErr("ລະຫັດຜ່ານໃໝ່ບໍ່ຕົງກັນ");
    if (pwForm.new_password.length < 6)
      return setPwErr("ລະຫັດຜ່ານໃໝ່ຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວ");
    try {
      await api.post("/auth/change-password", {
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwMsg("ປ່ຽນລະຫັດຜ່ານສຳເລັດ ✅");
      setPwForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (e) {
      setPwErr(e.response?.data?.message || "ເກີດຂໍ້ຜິດພາດ");
    }
  }

  const initials = profile
    ? `${profile.first_name?.[0] || ""}${profile.last_name?.[0] || ""}`.toUpperCase()
    : user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??";

  const NAV = [
    { key: "pos", icon: "ti-device-desktop", label: "POS ຂາຍ" },
    { key: "history", icon: "ti-receipt", label: "ປະຫວັດຂາຍ" },
    { key: "stock", icon: "ti-box", label: "ສາງສິນຄ້າ" },
    { key: "profile", icon: "ti-user-circle", label: "ໂປຣໄຟລ໌" },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f4f0",
        fontFamily: "var(--font)",
      }}
    >
      {/* Topbar */}
      <div
        style={{
          background: "#0f3d22",
          color: "#fff",
          padding: "12px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>
            🏪 ຮ້ານໝາກຊຳ ວິໄລຄິດ
          </div>
          <div style={{ fontSize: ".76rem", opacity: 0.65, marginTop: 2 }}>
            ສະວັດດີ, {user?.name} · Cashier
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            nav("/login");
          }}
          style={{
            background: "rgba(255,255,255,.12)",
            border: "none",
            color: "#fff",
            padding: "7px 14px",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: ".82rem",
          }}
        >
          ອອກຈາກລະບົບ
        </button>
      </div>

      {/* Nav tabs */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e0d8",
          display: "flex",
          gap: 4,
          padding: "8px 16px",
          overflowX: "auto",
        }}
      >
        {NAV.map((n) => (
          <button
            key={n.key}
            onClick={() => setTab(n.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              fontSize: ".88rem",
              fontFamily: "var(--font)",
              fontWeight: tab === n.key ? 600 : 400,
              whiteSpace: "nowrap",
              background: tab === n.key ? "#0f3d22" : "transparent",
              color: tab === n.key ? "#fff" : "#706e66",
            }}
          >
            <i className={`ti ${n.icon}`} aria-hidden="true" />
            {n.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
        {/* ── POS Tab ── */}
        {tab === "pos" && (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {[
                {
                  icon: "ti-cash",
                  label: "ຍອດຂາຍວັນນີ້",
                  value: fmt(today.revenue),
                },
                {
                  icon: "ti-receipt",
                  label: "ຈຳນວນບິນ",
                  value: `${today.bills} ບິນ`,
                },
                {
                  icon: "ti-clock",
                  label: "ເວລາປັດຈຸບັນ",
                  value: new Date().toLocaleTimeString("lo-LA"),
                },
              ].map((m, i) => (
                <div
                  key={i}
                  className="card"
                  style={{
                    background: "#fff",
                    border: "1px solid #e2e0d8",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: ".78rem",
                      color: "#706e66",
                      marginBottom: 4,
                    }}
                  >
                    <i
                      className={`ti ${m.icon}`}
                      aria-hidden="true"
                      style={{ marginRight: 4 }}
                    />
                    {m.label}
                  </div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>
                    {m.value}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                textAlign: "center",
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                padding: "40px 20px",
              }}
            >
              <div style={{ fontSize: 48, marginBottom: 12 }}>🖥️</div>
              <div
                style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: 8 }}
              >
                ໜ້າຂາຍສິນຄ້າ POS
              </div>
              <div
                style={{
                  color: "#706e66",
                  fontSize: ".88rem",
                  marginBottom: 20,
                }}
              >
                ກົດປຸ່ມດ້ານລຸ່ມເພື່ອໄປໜ້າຮັບເງິນ
              </div>
              <button
                onClick={() => nav("/pos")}
                style={{
                  background: "#1a6b3c",
                  color: "#fff",
                  border: "none",
                  padding: "12px 32px",
                  borderRadius: 10,
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                }}
              >
                💳 ເປີດໜ້າ POS
              </button>
            </div>
          </>
        )}

        {/* ── History Tab ── */}
        {tab === "history" && (
          <>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}
            >
              ປະຫວັດການຂາຍຂອງຂ້ອຍ
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: ".88rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f5f4f0" }}>
                    <th style={TH}>ເລກທີບິນ</th>
                    <th style={TH}>ເວລາ</th>
                    <th style={{ ...TH, textAlign: "right" }}>ຍອດ</th>
                    <th style={{ ...TH, textAlign: "center" }}>ວິທີຊຳລະ</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          textAlign: "center",
                          padding: 24,
                          color: "#aaa",
                        }}
                      >
                        ຍັງບໍ່ມີລາຍການ
                      </td>
                    </tr>
                  )}
                  {sales.map((s) => (
                    <tr
                      key={s.sale_id}
                      style={{ borderBottom: "1px solid #f0eeea" }}
                    >
                      <td style={TD} className="mono">
                        {s.receipt_number}
                      </td>
                      <td style={TD}>
                        {new Date(s.sale_datetime).toLocaleTimeString("lo-LA")}
                      </td>
                      <td
                        style={{ ...TD, textAlign: "right", fontWeight: 600 }}
                      >
                        {fmt(s.total_amount)}
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: ".75rem",
                            padding: "2px 8px",
                            borderRadius: 20,
                            background:
                              s.payment_method === "cash"
                                ? "#d4edda"
                                : "#d1ecf1",
                            color:
                              s.payment_method === "cash"
                                ? "#155724"
                                : "#0c5460",
                          }}
                        >
                          {s.payment_method === "cash"
                            ? "💵 ເງິນສົດ"
                            : "📱 ໂອນ"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Stock Tab ── */}
        {tab === "stock" && (
          <>
            <div
              style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 16 }}
            >
              ສາງສິນຄ້າ
              <span
                style={{
                  fontSize: ".78rem",
                  fontWeight: 400,
                  color: "#706e66",
                  marginLeft: 8,
                }}
              >
                (ດູໄດ້ ແຕ່ແກ້ໄຂບໍ່ໄດ້)
              </span>
            </div>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                overflow: "hidden",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: ".88rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f5f4f0" }}>
                    <th style={TH}>ສິນຄ້າ</th>
                    <th style={TH}>ປະເພດ</th>
                    <th style={{ ...TH, textAlign: "right" }}>ສາງ</th>
                    <th style={{ ...TH, textAlign: "center" }}>ສະຖານະ</th>
                  </tr>
                </thead>
                <tbody>
                  {stock.map((p) => (
                    <tr
                      key={p.product_id}
                      style={{ borderBottom: "1px solid #f0eeea" }}
                    >
                      <td style={TD}>{p.product_name}</td>
                      <td style={TD}>{p.category_name}</td>
                      <td
                        style={{
                          ...TD,
                          textAlign: "right",
                          fontFamily: "var(--mono)",
                        }}
                      >
                        {p.stock_qty} {p.unit_abbr}
                      </td>
                      <td style={{ ...TD, textAlign: "center" }}>
                        {p.is_low ? (
                          <span style={BADGE_RED}>ສາງຕ່ຳ</span>
                        ) : (
                          <span style={BADGE_GREEN}>ປົກກະຕິ</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ── Profile Tab ── */}
        {tab === "profile" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "260px 1fr",
              gap: 20,
            }}
          >
            {/* Photo card */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #e2e0d8",
                padding: "28px 20px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  marginBottom: 14,
                }}
              >
                {imgPreview ? (
                  <img
                    src={imgPreview}
                    alt="profile"
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #e2e0d8",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: "50%",
                      background: "#0f3d22",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color: "#fff",
                      margin: "0 auto",
                      border: "3px solid #e2e0d8",
                    }}
                  >
                    {initials}
                  </div>
                )}
                <button
                  onClick={() => imgRef.current.click()}
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "#1a6b3c",
                    border: "2px solid #fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: 12,
                  }}
                >
                  📷
                </button>
              </div>
              <input
                ref={imgRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                style={{ display: "none" }}
                onChange={onImgChange}
              />
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                {profile?.first_name} {profile?.last_name}
              </div>
              <div
                style={{
                  fontSize: ".82rem",
                  color: "#706e66",
                  margin: "4px 0 12px",
                }}
              >
                @{profile?.username}
              </div>
              <span style={{ ...BADGE_BLUE }}>cashier</span>

              {imgFile && (
                <div style={{ marginTop: 14 }}>
                  <div
                    style={{
                      fontSize: ".78rem",
                      color: "#706e66",
                      marginBottom: 8,
                    }}
                  >
                    ເລືອກ: {imgFile.name}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => {
                        setImgFile(null);
                        setImgPreview(
                          profile?.profile_image
                            ? BASE + profile.profile_image
                            : null,
                        );
                      }}
                      style={BTN_OUT}
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      onClick={uploadImg}
                      disabled={uploading}
                      style={BTN_PRI}
                    >
                      {uploading ? "..." : "💾 ບັນທຶກ"}
                    </button>
                  </div>
                </div>
              )}
              {!imgFile && (
                <button
                  onClick={() => imgRef.current.click()}
                  style={{
                    ...BTN_OUT,
                    marginTop: 14,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  📷 ປ່ຽນຮູບ
                </button>
              )}
            </div>

            {/* Info + password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e2e0d8",
                  padding: "20px",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 14 }}>
                  ຂໍ້ມູນສ່ວນຕົວ
                </div>
                {[
                  {
                    label: "ຊື່",
                    value: `${profile?.first_name || ""} ${profile?.last_name || ""}`,
                  },
                  { label: "Username", value: profile?.username, mono: true },
                  { label: "ເບີໂທ", value: profile?.phone || "—" },
                  { label: "ສິດທິ", value: profile?.role },
                ].map((row, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      padding: "8px 0",
                      borderBottom: i < 3 ? "1px solid #f0eeea" : "none",
                    }}
                  >
                    <span
                      style={{
                        color: "#706e66",
                        fontSize: ".85rem",
                        minWidth: 100,
                      }}
                    >
                      {row.label}
                    </span>
                    <span
                      style={{
                        fontSize: ".85rem",
                        fontFamily: row.mono ? "var(--mono)" : "inherit",
                      }}
                    >
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #e2e0d8",
                  padding: "20px",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 14 }}>
                  ປ່ຽນລະຫັດຜ່ານ
                </div>
                {[
                  { label: "ລະຫັດຜ່ານເກົ່າ", key: "old_password" },
                  { label: "ລະຫັດຜ່ານໃໝ່", key: "new_password" },
                  { label: "ຢືນຢັນລະຫັດຜ່ານ", key: "confirm_password" },
                ].map((f) => (
                  <div key={f.key} style={{ marginBottom: 12 }}>
                    <label
                      style={{
                        fontSize: ".82rem",
                        color: "#706e66",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {f.label}
                    </label>
                    <input
                      type="password"
                      value={pwForm[f.key]}
                      onChange={(e) =>
                        setPwForm((p) => ({ ...p, [f.key]: e.target.value }))
                      }
                      placeholder="••••••••"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: 8,
                        border: "1px solid #e2e0d8",
                        fontFamily: "var(--font)",
                        fontSize: ".9rem",
                      }}
                    />
                  </div>
                ))}
                {pwErr && (
                  <div
                    style={{
                      background: "#f8d7da",
                      color: "#721c24",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: ".82rem",
                      marginBottom: 10,
                    }}
                  >
                    ⚠️ {pwErr}
                  </div>
                )}
                {pwMsg && (
                  <div
                    style={{
                      background: "#d4edda",
                      color: "#155724",
                      borderRadius: 8,
                      padding: "8px 12px",
                      fontSize: ".82rem",
                      marginBottom: 10,
                    }}
                  >
                    {pwMsg}
                  </div>
                )}
                <button
                  onClick={changePassword}
                  style={{
                    ...BTN_PRI,
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  ປ່ຽນລະຫັດຜ່ານ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const TH = {
  textAlign: "left",
  padding: "10px 14px",
  fontSize: ".78rem",
  color: "#706e66",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: ".04em",
};
const TD = { padding: "10px 14px", verticalAlign: "middle" };
const BADGE_GREEN = {
  fontSize: ".74rem",
  padding: "2px 8px",
  borderRadius: 20,
  background: "#d4edda",
  color: "#155724",
};
const BADGE_RED = {
  fontSize: ".74rem",
  padding: "2px 8px",
  borderRadius: 20,
  background: "#f8d7da",
  color: "#721c24",
};
const BADGE_BLUE = {
  fontSize: ".74rem",
  padding: "3px 10px",
  borderRadius: 20,
  background: "#d1ecf1",
  color: "#0c5460",
};
const BTN_PRI = {
  background: "#1a6b3c",
  color: "#fff",
  border: "none",
  padding: "7px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: ".82rem",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "var(--font)",
};
const BTN_OUT = {
  background: "transparent",
  color: "#1a1917",
  border: "1px solid #e2e0d8",
  padding: "7px 14px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: ".82rem",
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontFamily: "var(--font)",
};
