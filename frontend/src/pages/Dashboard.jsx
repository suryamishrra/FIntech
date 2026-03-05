import { useState, useEffect } from "react";
import {
  RefreshCw, Sparkles, TrendingUp, TrendingDown,
  Wallet, CreditCard, Activity, ArrowUpRight,
  ArrowDownRight, ShieldCheck, AlertTriangle, Zap,
} from "lucide-react";
import api from "../api/axios";
import SummaryCards from "../components/SummaryCards";
import RiskBadge from "../components/RiskBadge";
import ExpenseChart from "../components/ExpenseChart";
import AIInsights from "../components/AIInsights";
import { useAuth } from "../context/authContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const fetchSummary = async () => {
    try {
      const { data } = await api.get("/api/finance/summary");
      setSummary(data);
    } catch (e) { console.error(e); }
    finally { setLoadingSummary(false); }
  };

 const fetchExpenses = async () => {
  try {
    const { data } = await api.get("/api/expenses");
    const list = data?.data?.expenses || data?.data || data?.expenses || (Array.isArray(data) ? data : []);
    setExpenses(list);
  } catch (e) {
    console.error(e);
  } finally {
    setLoadingExpenses(false);
  }
};

  useEffect(() => { fetchSummary(); fetchExpenses(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    setLoadingSummary(true);
    setLoadingExpenses(true);
    await Promise.all([fetchSummary(), fetchExpenses()]);
    setRefreshing(false);
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const fmt = (n) =>
    new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD", maximumFractionDigits: 0,
    }).format(n ?? 0);

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Hero Header ─────────────────────────────── */}
      <div
        className="relative rounded-2xl overflow-hidden px-6 py-6"
        style={{
          background: "linear-gradient(135deg, #1e40af 0%, #2563EB 50%, #3b82f6 100%)",
          boxShadow: "0 8px 32px rgba(37,99,235,0.25)",
          animation: "slideUp 0.4s ease forwards",
          opacity: 0,
        }}
      >
        {/* Decorative circles */}
        <div style={{
          position: "absolute", top: "-40px", right: "-40px",
          width: "180px", height: "180px", borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: "-30px", right: "120px",
          width: "100px", height: "100px", borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
        }} />
        <div style={{
          position: "absolute", top: "10px", right: "200px",
          width: "60px", height: "60px", borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }} />

        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">
              {greeting()}, {user?.name?.split(" ")[0] || "there"} 👋
            </p>
            <h2 className="text-white text-2xl font-bold tracking-tight">
              Your Financial Overview
            </h2>
            <p className="text-blue-200 text-sm mt-1">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long", month: "long", day: "numeric", year: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAI((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-150"
              style={{
                background: showAI ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = showAI ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.15)")}
            >
              <Sparkles size={15} />
              AI Insights
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-150"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "#fff",
              }}
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Quick net worth display inside hero */}
        {!loadingSummary && summary && (
          <div
            className="mt-5 pt-4 flex items-center gap-6 flex-wrap"
            style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}
          >
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-0.5">Net Worth</p>
              <p className="text-white text-xl font-bold font-mono">{fmt(summary.netWorth)}</p>
            </div>
            <div
              className="w-px h-8 hidden sm:block"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-0.5">Bank Balance</p>
              <p className="text-white text-xl font-bold font-mono">{fmt(summary.bankBalance)}</p>
            </div>
            <div
              className="w-px h-8 hidden sm:block"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-0.5">Credit Used</p>
              <p className="text-white text-xl font-bold font-mono">{fmt(summary.creditOutstanding)}</p>
            </div>
            <div className="ml-auto">
              <span
                className="px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: summary.riskLevel === "Low"
                    ? "rgba(34,197,94,0.2)"
                    : summary.riskLevel === "Moderate"
                    ? "rgba(245,158,11,0.2)"
                    : "rgba(239,68,68,0.2)",
                  color: summary.riskLevel === "Low"
                    ? "#86efac"
                    : summary.riskLevel === "Moderate"
                    ? "#fde68a"
                    : "#fca5a5",
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              >
                {summary.riskLevel || "Low"} Risk
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Summary Cards ───────────────────────────── */}
      <div style={{ animation: "slideUp 0.4s ease 0.08s forwards", opacity: 0 }}>
        <SummaryCards data={summary} loading={loadingSummary} />
      </div>

      {/* ── Risk + Charts ────────────────────────────── */}
      <div
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        style={{ animation: "slideUp 0.4s ease 0.14s forwards", opacity: 0 }}
      >
        <div className="lg:col-span-1 flex flex-col gap-5">
          <RiskBadge data={summary} loading={loadingSummary} />

          {/* Quick status pills */}
          {!loadingSummary && summary && (
            <div className="flex flex-col gap-2">
              {[
                {
                  label: "Credit Utilization",
                  value: `${(Number(summary.creditUtilization) || 0).toFixed(1)}%`,
                  color: (summary.creditUtilization || 0) <= 30
                    ? "#22C55E"
                    : (summary.creditUtilization || 0) <= 70
                    ? "#F59E0B"
                    : "#EF4444",
                  sub: (summary.creditUtilization || 0) <= 30
                    ? "Healthy range"
                    : "Monitor closely",
                  Icon: Activity,
                },
                {
                  label: "Net Position",
                  value: (summary.netWorth || 0) >= 0 ? "Positive" : "Negative",
                  color: (summary.netWorth || 0) >= 0 ? "#22C55E" : "#EF4444",
                  sub: fmt(summary.netWorth),
                  Icon: (summary.netWorth || 0) >= 0 ? TrendingUp : TrendingDown,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "#fff",
                    border: "1px solid rgba(0,0,0,0.07)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: `${item.color}14`,
                      border: `1px solid ${item.color}30`,
                    }}
                  >
                    <item.Icon size={15} style={{ color: item.color }} strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-sm font-semibold text-gray-900 font-mono">{item.value}</p>
                  </div>
                  <span className="text-xs font-medium" style={{ color: item.color }}>
                    {item.sub}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <ExpenseChart expenses={expenses} loading={loadingExpenses} />
        </div>
      </div>

      {/* ── AI Insights ──────────────────────────────── */}
      {showAI && (
        <div style={{ animation: "slideUp 0.3s ease forwards", opacity: 0 }}>
          <AIInsights summary={summary} />
        </div>
      )}

      {/* ── Alerts + Activity Row ─────────────────────── */}
      {!loadingSummary && summary && (
        <div
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
          style={{ animation: "slideUp 0.4s ease 0.2s forwards", opacity: 0 }}
        >
          {/* Alerts panel */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}
                >
                  <AlertTriangle size={13} color="#EF4444" />
                </div>
                <span className="text-sm font-semibold text-gray-800">Active Alerts</span>
              </div>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: (summary.alerts || []).length > 0
                    ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                  color: (summary.alerts || []).length > 0 ? "#EF4444" : "#22C55E",
                }}
              >
                {(summary.alerts || []).length} alert{(summary.alerts || []).length !== 1 ? "s" : ""}
              </span>
            </div>

            {(summary.alerts || []).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.1)" }}
                >
                  <ShieldCheck size={18} color="#22C55E" />
                </div>
                <p className="text-sm font-medium text-gray-700">All clear!</p>
                <p className="text-xs text-gray-400">No financial alerts at this time</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(summary.alerts || []).map((alert, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                    style={{
                      background: "rgba(239,68,68,0.04)",
                      border: "1px solid rgba(239,68,68,0.1)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                      style={{ background: "#EF4444" }}
                    />
                    <p className="text-sm text-gray-700">{alert}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Health Score */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "#fff",
              border: "1px solid rgba(0,0,0,0.07)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(37,99,235,0.15)" }}
              >
                <Zap size={13} color="#2563EB" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Financial Health</span>
            </div>

            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Savings Rate",
                  pct: Math.min(
                    summary.bankBalance > 0
                      ? Math.round((summary.bankBalance / (summary.bankBalance + summary.creditOutstanding + 1)) * 100)
                      : 0,
                    100
                  ),
                  color: "#2563EB",
                },
                {
                  label: "Debt Control",
                  pct: Math.min(
                    100 - Math.round(Number(summary.creditUtilization) || 0),
                    100
                  ),
                  color: "#22C55E",
                },
                {
                  label: "Risk Management",
                  pct: Math.max(100 - (summary.riskScore || 0), 0),
                  color: summary.riskLevel === "Low"
                    ? "#22C55E"
                    : summary.riskLevel === "Moderate"
                    ? "#F59E0B"
                    : "#EF4444",
                },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600">{item.label}</span>
                    <span
                      className="text-xs font-mono font-semibold"
                      style={{ color: item.color }}
                    >
                      {item.pct}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "#F3F4F6" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${item.pct}%`,
                        background: item.color,
                        boxShadow: `0 0 8px ${item.color}40`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Overall score */}
            <div
              className="mt-4 pt-4 flex items-center justify-between"
              style={{ borderTop: "1px solid #F3F4F6" }}
            >
              <span className="text-xs text-gray-500">Overall Score</span>
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => {
                    const score = Math.max(100 - (summary.riskScore || 0), 0);
                    const filled = i <= Math.round((score / 100) * 5);
                    return (
                      <div
                        key={i}
                        className="w-4 h-1.5 rounded-full"
                        style={{ background: filled ? "#2563EB" : "#E5E7EB" }}
                      />
                    );
                  })}
                </div>
                <span className="text-xs font-semibold text-gray-700">
                  {summary.riskLevel === "Low"
                    ? "Excellent"
                    : summary.riskLevel === "Moderate"
                    ? "Fair"
                    : "Needs Work"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}