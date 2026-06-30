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
import api from "../../utils/api";

const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

function StatCard({ icon, label, value, sub, color = "#1a6b3c" }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div className="flex items-center justify-between mb-3">
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
      <div style={{ fontSize: "1.55rem", fontWeight: 700, lineHeight: 1 }}>
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
      .catch(() => {});
  }, []);
  if (!data) return <div className="text-muted">⏳ ກຳລັງໂຫລດ...</div>;
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h1 className="page-title" style={{ margin: 0 }}>
          ໜ້າຫຼັກ
        </h1>
        <span className="text-muted text-sm">
          {new Date().toLocaleDateString("lo-LA", { dateStyle: "full" })}
        </span>
      </div>
      <div className="grid-4 mb-4">
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
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 16 }}>
            ຍອດຂາຍ 7 ວັນຜ່ານມາ
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.dailyChart}>
              <CartesianGrid stroke="#f0eeea" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip formatter={(v) => fmt(v)} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1a6b3c"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "#1a6b3c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: 12 }}>
            ສິນຄ້າຂາຍດີ Top 5
          </div>
          {(data.topProducts || []).map((p, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "7px 0",
                borderBottom: "1px solid #f0eeea",
                fontSize: ".84rem",
              }}
            >
              <span>
                <span style={{ color: "#aaa", marginRight: 6 }}>{i + 1}.</span>
                {p.product_name}
              </span>
              <span className="mono" style={{ color: "#1a6b3c" }}>
                {fmt(p.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
