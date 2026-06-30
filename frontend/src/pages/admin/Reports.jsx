import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import api from "../../utils/api";
const fmt = (n) => `₭${Number(n || 0).toLocaleString()}`;

const STATUS_STYLE = {
  ໝົດ: { bg: "#e2e3e5", color: "#383d41", icon: "⬛" },
  ຕ່ຳ: { bg: "#f8d7da", color: "#721c24", icon: "🔴" },
  ກາງ: { bg: "#fff3cd", color: "#856404", icon: "🟡" },
  ສູງ: { bg: "#d1ecf1", color: "#0c5460", icon: "🔵" },
};

export default function Reports() {
  const [period, setPeriod] = useState("month");
  const [ie, setIE] = useState({ income: [], expense: [] });
  const [stock, setStock] = useState([]);

  useEffect(() => {
    api
      .get(`/reports/income-expense?period=${period}`)
      .then((r) => setIE(r.data));
  }, [period]);

  useEffect(() => {
    api.get("/reports/stock").then((r) => setStock(r.data));
  }, []);

  const merged = ie.income
    .map((row) => ({
      period: row.period,
      income: Number(row.income),
      expense: Number(
        ie.expense.find((e) => e.period === row.period)?.expense || 0,
      ),
    }))
    .map((r) => ({ ...r, profit: r.income - r.expense }));

  const counts = stock.reduce((acc, p) => {
    acc[p.stock_status] = (acc[p.stock_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <h1 className="page-title">ລາຍງານ</h1>

      {/* Summary badges */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}
      >
        {Object.entries(STATUS_STYLE).map(([label, style]) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              background: style.bg,
              color: style.color,
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: ".85rem",
              fontWeight: 600,
            }}
          >
            {style.icon} {label}: {counts[label] || 0} ລາຍ
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div style={{ fontWeight: 600 }}>ລາຍຮັບ – ລາຍຈ່າຍ</div>
          <div className="flex gap-2">
            {["day", "month", "year"].map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${period === p ? "btn-primary" : "btn-outline"}`}
                onClick={() => setPeriod(p)}
              >
                {p === "day" ? "ລາຍວັນ" : p === "month" ? "ລາຍເດືອນ" : "ລາຍປີ"}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={merged}>
            <CartesianGrid stroke="#f0eeea" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip formatter={(v) => fmt(v)} />
            <Legend />
            <Bar
              dataKey="income"
              name="ລາຍຮັບ"
              fill="#1a6b3c"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="ລາຍຈ່າຍ"
              fill="#c0392b"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="profit"
              name="ກຳໄລ"
              fill="#e8a020"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stock table */}
      <div className="card">
        <div style={{ fontWeight: 600, marginBottom: 14 }}>ລາຍງານສາງສິນຄ້າ</div>
        <table>
          <thead>
            <tr>
              <th>ສິນຄ້າ</th>
              <th>ປະເພດ</th>
              <th className="text-right">ສາງ</th>
              <th className="text-right">ຂັ້ນຕ່ຳ</th>
              <th className="text-right">ລາຄາຂາຍ</th>
              <th>ສະຖານະ</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((p) => {
              const s = STATUS_STYLE[p.stock_status] || STATUS_STYLE["ກາງ"];
              return (
                <tr key={p.product_id}>
                  <td style={{ fontWeight: 500 }}>{p.product_name}</td>
                  <td>{p.category_name}</td>
                  <td className="text-right mono">
                    {p.stock_qty} {p.unit_abbr}
                  </td>
                  <td className="text-right mono">{p.min_stock_level}</td>
                  <td className="text-right mono">{fmt(p.selling_price)}</td>
                  <td>
                    <span
                      style={{
                        fontSize: ".74rem",
                        padding: "2px 10px",
                        borderRadius: 20,
                        background: s.bg,
                        color: s.color,
                        fontWeight: 600,
                      }}
                    >
                      {s.icon} {p.stock_status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
