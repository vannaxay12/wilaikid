import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../utils/api";

const BASE = "http://localhost:4000";

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [profileImg, setProfileImg] = useState(null);

  useEffect(() => {
    const check = () => {
      api
        .get("/auth/pending")
        .then((r) => setPendingCount(r.data.length))
        .catch(() => {});
    };
    check();
    const t = setInterval(check, 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const check = () => {
      api
        .get("/customer-orders/admin/all?status=pending")
        .then((r) => setPendingOrders(r.data.length))
        .catch(() => {});
    };
    check();
    const t = setInterval(check, 10000); // ກວດທຸກ 10 ວິນາທີ
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    api
      .get("/upload/me")
      .then((r) => {
        if (r.data.profile_image) setProfileImg(BASE + r.data.profile_image);
      })
      .catch(() => {});
  }, []);

  const NAV = [
    { to: "/admin", label: "📊 ໜ້າຫຼັກ", end: true },
    { to: "/admin/products", label: "📦 ສິນຄ້າ" },
    { to: "/admin/suppliers", label: "🚚 ຜູ້ສະໜອງ" },
    { to: "/admin/purchases", label: "🛒 ໃບສັ່ງຊື້" },
    { to: "/admin/inventory", label: "📥 ນຳເຂົ້າສິນຄ້າ" },
    {
      to: "/admin/customer-orders",
      label: "📥 ຄຳສັ່ງຊື້ລູກຄ້າ",
      badge: pendingOrders,
    },
    { to: "/admin/employees", label: "👥 ພະນັກງານ" },
    { to: "/admin/reports", label: "📈 ລາຍງານ" },
    { to: "/admin/approvals", label: "🔔 ອະນຸມັດ", badge: pendingCount },
    { to: "/admin/settings", label: "⚙️ ຕັ້ງຄ່າຮ້ານ" },
  ];

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 224,
          background: "#0f3d22",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        <div
          style={{
            padding: "22px 20px 14px",
            borderBottom: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>
            🏪 ວິໄລຄິດ
          </div>
          <div
            style={{
              fontSize: ".76rem",
              color: "rgba(255,255,255,.45)",
              marginTop: 2,
            }}
          >
            ລະບົບຈັດການຮ້ານຄ້າ
          </div>
        </div>
        <nav style={{ flex: 1, padding: "10px 0", overflowY: "auto" }}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 20px",
                fontSize: ".88rem",
                color: isActive ? "#fff" : "rgba(255,255,255,.62)",
                background: isActive ? "rgba(255,255,255,.13)" : "transparent",
                borderLeft: isActive
                  ? "3px solid #4caf7d"
                  : "3px solid transparent",
                textDecoration: "none",
                transition: "all .15s",
              })}
            >
              <span>{n.label}</span>
              {n.badge > 0 && (
                <span
                  style={{
                    background: "#c0392b",
                    color: "#fff",
                    borderRadius: 20,
                    fontSize: ".72rem",
                    fontWeight: 700,
                    padding: "1px 7px",
                  }}
                >
                  {n.badge}
                </span>
              )}
            </NavLink>
          ))}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,.08)",
              margin: "8px 0",
            }}
          />
          <NavLink
            to="/pos"
            style={{
              display: "block",
              padding: "10px 20px",
              fontSize: ".88rem",
              color: "rgba(255,255,255,.55)",
              borderLeft: "3px solid transparent",
              textDecoration: "none",
            }}
          >
            💳 ໜ້າແຄັດເຊຍ
          </NavLink>
        </nav>
        <div
          style={{
            padding: "14px 20px",
            borderTop: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <NavLink
            to="/admin/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
              marginBottom: 10,
            }}
          >
            {profileImg ? (
              <img
                src={profileImg}
                alt="p"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "2px solid rgba(255,255,255,.3)",
                  flexShrink: 0,
                }}
              />
            ) : (
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: ".82rem",
                  fontWeight: 700,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
            )}
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: ".82rem",
                  color: "rgba(255,255,255,.9)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.name}
              </div>
              <div
                style={{ fontSize: ".72rem", color: "rgba(255,255,255,.45)" }}
              >
                ⚙️ {user?.role}
              </div>
            </div>
          </NavLink>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
            style={{
              background: "rgba(255,255,255,.1)",
              border: "none",
              color: "rgba(255,255,255,.6)",
              padding: "6px 12px",
              borderRadius: 7,
              cursor: "pointer",
              fontSize: ".8rem",
              width: "100%",
            }}
          >
            ອອກຈາກລະບົບ
          </button>
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          minWidth: 0,
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
