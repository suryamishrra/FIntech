import { useState, useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Sector,
} from "recharts";
import { BarChart2, PieChart as PieIcon } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  "#22d3ee", "#10b981", "#f59e0b", "#8b5cf6",
  "#ec4899", "#f97316", "#06b6d4", "#84cc16",
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function buildMonthlyData(expenses) {
  const map = {};
  MONTHS.forEach((m) => (map[m] = 0));
  expenses.forEach((exp) => {
    const d = new Date(exp.createdAt || exp.date || Date.now());
    const m = MONTHS[d.getMonth()];
    map[m] = (map[m] || 0) + Number(exp.amount || 0);
  });
  // Only return months that have data or the last 6
  const now = new Date().getMonth();
  return MONTHS.slice(Math.max(0, now - 5), now + 1).map((m) => ({
    month: m,
    amount: parseFloat(map[m].toFixed(2)),
  }));
}

function buildCategoryData(expenses) {
  const map = {};
  expenses.forEach((exp) => {
    const cat = exp.category || "Other";
    map[cat] = (map[cat] || 0) + Number(exp.amount || 0);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
}

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n);

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3.5 py-2.5 text-sm"
      style={{
        background: "var(--bg-card-alt)",
        border: "1px solid var(--border-hover)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-xs text-[var(--text-muted)] mb-1 uppercase tracking-widest">{label}</p>
      <p className="font-mono font-medium text-cyan-400">{fmt(payload[0].value)}</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg px-3.5 py-2.5 text-sm"
      style={{
        background: "var(--bg-card-alt)",
        border: "1px solid var(--border-hover)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      }}
    >
      <p className="text-xs text-[var(--text-muted)] mb-1">{payload[0].name}</p>
      <p className="font-mono font-medium" style={{ color: payload[0].payload.fill }}>
        {fmt(payload[0].value)}
      </p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5">
        {payload[0].payload.pct}% of total
      </p>
    </div>
  );
}

// ── Active Pie Sector ─────────────────────────────────────────────────────────

function renderActiveShape(props) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
    payload, percent,
  } = props;
  return (
    <g>
      <text x={cx} y={cy - 10} textAnchor="middle" fill="var(--text-primary)"
        fontSize={13} fontFamily="DM Mono" fontWeight={600}>
        {fmt(payload.value)}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="var(--text-muted)"
        fontSize={10} fontFamily="DM Sans">
        {payload.name}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill={fill}
        fontSize={10} fontFamily="DM Mono">
        {(percent * 100).toFixed(1)}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
        startAngle={startAngle} endAngle={endAngle} fill={fill}
        style={{ filter: `drop-shadow(0 0 8px ${fill}88)` }} />
      <Sector cx={cx} cy={cy} innerRadius={outerRadius + 10} outerRadius={outerRadius + 13}
        startAngle={startAngle} endAngle={endAngle} fill={fill} opacity={0.4} />
    </g>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="rounded-xl p-5" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-6">
        <div className="shimmer h-3 w-32 rounded-full" />
        <div className="flex gap-2">
          <div className="shimmer h-7 w-20 rounded-lg" />
          <div className="shimmer h-7 w-20 rounded-lg" />
        </div>
      </div>
      <div className="shimmer h-48 w-full rounded-xl" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-2">
      <BarChart2 size={28} style={{ color: "var(--text-muted)" }} strokeWidth={1.2} />
      <p className="text-sm text-[var(--text-muted)]">No expense data yet</p>
      <p className="text-xs text-[var(--text-muted)] opacity-60">
        Add expenses to see your charts
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function ExpenseChart({ expenses = [], loading }) {
  const [view, setView] = useState("line"); // "line" | "pie"
  const [activePieIndex, setActivePieIndex] = useState(0);

  const monthlyData = useMemo(() => buildMonthlyData(expenses), [expenses]);
  const categoryData = useMemo(() => {
    const raw = buildCategoryData(expenses);
    const total = raw.reduce((s, d) => s + d.value, 0);
    return raw.map((d) => ({
      ...d,
      pct: total > 0 ? ((d.value / total) * 100).toFixed(1) : 0,
    }));
  }, [expenses]);

  const hasData = expenses.length > 0;

  if (loading) return <Skeleton />;

  return (
    <div
      className="rounded-xl p-5 h-full"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="section-title">Expense Analytics</span>
          {hasData && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {expenses.length} transaction{expenses.length !== 1 ? "s" : ""} recorded
            </p>
          )}
        </div>

        {/* View toggle */}
        <div
          className="flex items-center rounded-lg p-0.5 gap-0.5"
          style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border)" }}
        >
          {[
            { id: "line", Icon: BarChart2,  label: "Trend" },
            { id: "pie",  Icon: PieIcon,    label: "Split" },
          ].map(({ id, Icon, label }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer"
              style={
                view === id
                  ? { background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid rgba(34,211,238,0.2)" }
                  : { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent" }
              }
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      {!hasData ? (
        <EmptyState />
      ) : view === "line" ? (
        <LineChartView data={monthlyData} />
      ) : (
        <PieChartView
          data={categoryData}
          activeIndex={activePieIndex}
          onMouseEnter={(_, i) => setActivePieIndex(i)}
        />
      )}
    </div>
  );
}

// ── Line Chart View ───────────────────────────────────────────────────────────

function LineChartView({ data }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease forwards" }}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(34,211,238,0.05)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "DM Sans" }}
            axisLine={false}
            tickLine={false}
            dy={8}
          />
          <YAxis
            tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "DM Mono" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
          />
          <Tooltip content={<LineTooltip />} cursor={{ stroke: "rgba(34,211,238,0.15)", strokeWidth: 1 }} />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#22d3ee"
            strokeWidth={2}
            dot={{ fill: "#22d3ee", r: 3, strokeWidth: 0 }}
            activeDot={{
              r: 5,
              fill: "#22d3ee",
              stroke: "rgba(34,211,238,0.3)",
              strokeWidth: 4,
            }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Monthly summary row */}
      <div
        className="flex items-center justify-between mt-3 pt-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {data.slice(-3).map((d) => (
          <div key={d.month} className="text-center">
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{d.month}</p>
            <p className="text-sm font-mono font-medium text-[var(--text-primary)] mt-0.5">
              {fmt(d.amount)}
            </p>
          </div>
        ))}
        <div className="text-center">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Total</p>
          <p className="text-sm font-mono font-medium text-cyan-400 mt-0.5">
            {fmt(data.reduce((s, d) => s + d.amount, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Pie Chart View ────────────────────────────────────────────────────────────

function PieChartView({ data, activeIndex, onMouseEnter }) {
  if (!data.length) return <EmptyState />;

  return (
    <div
      className="flex flex-col sm:flex-row items-center gap-4"
      style={{ animation: "fadeIn 0.3s ease forwards" }}
    >
      {/* Pie */}
      <div className="shrink-0">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              dataKey="value"
              onMouseEnter={onMouseEnter}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell
                  key={i}
                  fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex-1 flex flex-col gap-2 min-w-0 w-full">
        {data.slice(0, 6).map((item, i) => {
          const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
          const isActive = i === activeIndex;
          return (
            <div
              key={item.name}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                background: isActive ? `${color}10` : "transparent",
                border: `1px solid ${isActive ? `${color}25` : "transparent"}`,
              }}
              onMouseEnter={() => onMouseEnter(null, i)}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 6px ${color}88` }}
              />
              <span
                className="text-xs flex-1 truncate"
                style={{ color: isActive ? "var(--text-primary)" : "var(--text-secondary)" }}
              >
                {item.name}
              </span>
              <span className="text-xs font-mono shrink-0" style={{ color }}>
                {item.pct}%
              </span>
              <span
                className="text-xs font-mono shrink-0 hidden sm:block"
                style={{ color: "var(--text-muted)" }}
              >
                {fmt(item.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}