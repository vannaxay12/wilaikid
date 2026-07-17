import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Currency formatter for Lao Kip
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

// Realistic mock data matching your SQL dump and dashboard states
const mockDashboardData = {
  today: { revenue: 0, bills: 0 },
  month: { revenue: 108000 },
  totalProducts: 12,
  lowStock: 0,
  dailyChart: [
    { day: "2026-07-11", revenue: 0 },
    { day: "2026-07-12", revenue: 0 },
    { day: "2026-07-13", revenue: 0 },
    { day: "2026-07-14", revenue: 0 },
    { day: "2026-07-15", revenue: 0 },
    { day: "2026-07-16", revenue: 108000 },
    { day: "2026-07-17", revenue: 0 },
  ],
  topProducts: [
    { product_name: "ນ້ຳຕານຂາວ", revenue: 40000 },
    { product_name: "ແປງນົວກາບ່ວງ", revenue: 28000 },
    { product_name: "ນ້ຳປາແກ້ວ", revenue: 22000 },
    { product_name: "ນ້ຳປາຍາງ", revenue: 13000 },
    { product_name: "ນ້ຳຕານແດງ", revenue: 5000 },
  ],
};

// Resilient API client: uses live backend if reachable, otherwise falls back gracefully to mock data
const api = {
  get: async (endpoint) => {
    try {
      const response = await fetch(`http://localhost:4000/api${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Server response error");
      const data = await response.json();
      return { data };
    } catch (err) {
      console.warn(
        "Using fallback preview data as backend server is currently unreachable:",
        err.message,
      );
      return { data: mockDashboardData };
    }
  },
};

function StatCard({ icon, label, value, sub, color = "#1a6b3c" }) {
  return (
    <div
      className="card"
      style={{
        borderTop: `3px solid ${color}`,
        padding: "16px",
        borderRadius: "12px",
        background: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="flex items-center justify-between mb-3"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "1.4rem" }}>{icon}</span>
        <span
          style={{
            fontSize: ".76rem",
            color: "#706e66",
            background: "#f5f4f0",
            padding: "2px 8px",
            borderRadius: 20,
          }}
        >
          {sub}
        </span>
      </div>
      <div
        style={{
          fontSize: "1.55rem",
          fontWeight: 700,
          lineHeight: 1,
          margin: "4px 0",
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: ".8rem", color: "#706e66", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then((r) => setData(r.data))
      .catch((err) => {
        console.error("Error loading dashboard data:", err);
        setData(mockDashboardData);
      });
  }, []);

  if (!data) return <div className="text-muted p-4">⏳ ກຳລັງໂຫລດ...</div>;

  return (
    <>
      {}
      <div
        className="flex items-center justify-between mb-4"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h1
          className="page-title"
          style={{ margin: 0, fontSize: "1.75rem", fontWeight: "bold" }}
        >
          ໜ້າຫຼັກ
        </h1>
        <span className="text-muted text-sm" style={{ color: "#706e66" }}>
          {new Date().toLocaleDateString("lo-LA", { dateStyle: "full" })}
        </span>
      </div>

      <div
        className="grid-4 mb-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <StatCard
          icon="💰"
          label="ຍອດຂາຍວັນນີ້"
          value={fmt(data.today?.revenue)}
          sub={`${data.today?.bills || 0} ບິນ`}
          color="#1a6b3c"
        />
        <StatCard
          icon="📅"
          label="ຍອດຂາຍເດືອນນີ້"
          value={fmt(data.month?.revenue)}
          sub="ເດືອນປັດຈຸບັນ"
          color="#e8a020"
        />
        <StatCard
          icon="📦"
          label="ສິນຄ້າທັງໝົດ"
          value={data.totalProducts}
          sub="ລາຍການ"
          color="#2471a3"
        />
        <StatCard
          icon="⚠️"
          label="ສາງຕ່ຳກວ່າຂັ້ນຕ່ຳ"
          value={data.lowStock}
          sub="ລາຍການ"
          color="#c0392b"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* Weekly Revenue Line Chart Container */}
        <div
          className="card"
          style={{
            minWidth: 0,
            padding: "20px",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 16, fontSize: "1rem" }}>
            ຍອດຂາຍ 7 ວັນຜ່ານມາ
          </div>
          {/* Fixed width to 100% to allow Recharts ResponsiveContainer to properly scale inside CSS Grid */}
          <div style={{ width: "100%", height: 230 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.dailyChart || []}
                margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid stroke="#f0eeea" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "#706e66" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#706e66" }}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v
                  }
                />
                <Tooltip formatter={(v) => [fmt(v), "ຍອດຂາຍ"]} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1a6b3c"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1a6b3c", strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {}
        <div
          className="card"
          style={{
            padding: "20px",
            borderRadius: "12px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 12, fontSize: "1rem" }}>
            ສິນຄ້າຂາຍດີ Top 5
          </div>
          {(data.topProducts || []).length === 0 ? (
            <p
              className="text-muted text-sm text-center py-4"
              style={{ color: "#706e66", textAlign: "center" }}
            >
              ບໍ່ມີຂໍ້ມູນການຂາຍ
            </p>
          ) : (
            data.topProducts.map((p, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0eeea",
                  fontSize: ".84rem",
                }}
              >
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginRight: 8,
                  }}
                >
                  <span style={{ color: "#aaa", marginRight: 6 }}>
                    {i + 1}.
                  </span>
                  {p.product_name}
                </span>
                <span
                  className="mono"
                  style={{ color: "#1a6b3c", fontWeight: 600 }}
                >
                  {fmt(p.revenue)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
