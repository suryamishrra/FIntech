import { useState, useEffect, useMemo } from "react";
import {
  Plus, PiggyBank, Target, TrendingUp, AlertTriangle,
  CheckCircle2, RefreshCw, Edit3, X, Save, Loader2,
  DollarSign, BarChart2, Zap,
} from "lucide-react";
import api from "../api/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Rent",
  "Education",
  "Travel",
  "Other",
];

const CATEGORY_COLORS = {
  "Food & Dining":   "#22d3ee",
  Transport:         "#10b981",
  Shopping:          "#8b5cf6",
  Entertainment:     "#ec4899",
  Health:            "#f97316",
  Utilities:         "#f59e0b",
  Rent:              "#ef4444",
  Education:         "#06b6d4",
  Travel:            "#84cc16",
  Other:             "#64748b",
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || "#64748b";

const getStatusColor = (pct) =>
  pct >= 100 ? "#ef4444" : pct >= 80 ? "#f59e0b" : "#10b981";

const getStatusLabel = (pct) =>
  pct >= 100 ? "Overspent" : pct >= 80 ? "Near limit" : "On track";

const getStatusIcon = (pct) =>
  pct >= 100 ? AlertTriangle : pct >= 80 ? AlertTriangle : CheckCircle2;

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-xl"
      style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="shimmer w-8 h-8 rounded-lg" />
          <div className="flex flex-col gap-1.5">
            <div className="shimmer h-3 w-28 rounded-full" />
            <div className="shimmer h-2.5 w-16 rounded-full" />
          </div>
        </div>
        <div className="shimmer h-5 w-16 rounded-full" />
      </div>
      <div className="shimmer h-1.5 w-full rounded-full" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(34,211,238,0.06)",
          border: "1px solid rgba(34,211,238,0.15)",
        }}
      >
        <PiggyBank
          size={22}
          style={{ color: "var(--text-muted)" }}
          strokeWidth={1.4}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No budgets set
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
          Create budgets for each spending category to track and control your expenses
        </p>
      </div>
      <button onClick={onAdd} className="btn-primary text-sm px-4 py-2">
        <Plus size={14} />
        Create first budget
      </button>
    </div>
  );
}

// ── Budget Form ───────────────────────────────────────────────────────────────

function BudgetForm({ onSuccess, onCancel, existingCategories = [] }) {
  const [form, setForm] = useState({ category: "", amount: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const available = CATEGORIES.filter((c) => !existingCategories.includes(c));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category || !form.amount) {
      setError("Please select a category and enter an amount.");
      return;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Please enter a valid budget amount.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/budget", {
        category: form.category,
        amount: parseFloat(form.amount),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save budget.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(34,211,238,0.15)",
        boxShadow: "0 0 32px rgba(34,211,238,0.06)",
        animation: "slideUp 0.25s ease forwards",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(34,211,238,0.1)",
              border: "1px solid rgba(34,211,238,0.2)",
            }}
          >
            <Target size={14} style={{ color: "var(--accent)" }} strokeWidth={2.2} />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            Set Budget
          </p>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150"
            style={{ color: "var(--text-muted)", background: "var(--bg-card-alt)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs mb-4"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "#f87171",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {available.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] col-span-full py-2">
                All categories have budgets set.
              </p>
            ) : (
              available.map((cat) => {
                const color = getCategoryColor(cat);
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, category: cat }))}
                    className="py-2 px-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer text-center"
                    style={
                      active
                        ? {
                            background: `${color}15`,
                            border: `1px solid ${color}40`,
                            color,
                          }
                        : {
                            background: "var(--bg-card-alt)",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                          }
                    }
                  >
                    {cat}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="label">Monthly Budget *</label>
          <div className="relative max-w-xs">
            <DollarSign
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="number"
              className="input pl-9 font-mono"
              placeholder="0.00"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) =>
                setForm((p) => ({ ...p, amount: e.target.value }))
              }
              required
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading || available.length === 0}
            className="btn-primary h-10 px-6 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={14} />
                Save Budget
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary h-10 px-4"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

// ── Inline Edit ───────────────────────────────────────────────────────────────

function InlineEdit({ budget, onSave, onCancel }) {
  const [value, setValue] = useState(String(budget.amount));
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!value || isNaN(Number(value)) || Number(value) <= 0) return;
    setLoading(true);
    try {
      await api.post("/api/budget", {
        category: budget.category,
        amount: parseFloat(value),
      });
      onSave();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <DollarSign
          size={12}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          type="number"
          className="input pl-7 h-8 text-xs font-mono w-28"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          min="1"
          step="0.01"
          autoFocus
        />
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          background: "rgba(34,211,238,0.1)",
          border: "1px solid rgba(34,211,238,0.2)",
          color: "var(--accent)",
        }}
      >
        {loading
          ? <Loader2 size={12} className="animate-spin" />
          : <Save size={12} />}
      </button>
      <button
        onClick={onCancel}
        className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          background: "var(--bg-card-alt)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Budget Row ────────────────────────────────────────────────────────────────

function BudgetRow({ budget, spent, index, onEdit }) {
  const [editing, setEditing] = useState(false);
  const color = getCategoryColor(budget.category);
  const amount = Number(budget.amount || 0);
  const spentAmt = Number(spent || 0);
  const pct = amount > 0 ? Math.min((spentAmt / amount) * 100, 100) : 0;
  const remaining = Math.max(amount - spentAmt, 0);
  const overspent = spentAmt > amount;
  const statusColor = getStatusColor(pct);
  const statusLabel = getStatusLabel(pct);
  const StatusIcon = getStatusIcon(pct);

  return (
    <div
      className="p-4 rounded-xl transition-all duration-200"
      style={{
        background: "var(--bg-card-alt)",
        border: `1px solid ${overspent ? "rgba(239,68,68,0.2)" : "var(--border)"}`,
        animation: `slideUp 0.35s ease ${index * 0.06}s forwards`,
        opacity: 0,
      }}
      onMouseEnter={(e) => {
        if (!overspent)
          e.currentTarget.style.borderColor = `${color}25`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = overspent
          ? "rgba(239,68,68,0.2)"
          : "var(--border)";
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          {/* Category dot + icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
            style={{
              background: `${color}12`,
              border: `1px solid ${color}25`,
              color,
            }}
          >
            {budget.category[0]}
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {budget.category}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              Monthly budget
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status badge */}
          <span
            className="badge text-[10px]"
            style={{
              background: `${statusColor}12`,
              color: statusColor,
              border: `1px solid ${statusColor}25`,
            }}
          >
            <StatusIcon size={10} />
            {statusLabel}
          </span>

          {/* Edit button / inline edit */}
          {editing ? (
            <InlineEdit
              budget={budget}
              onSave={() => { setEditing(false); onEdit(); }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-150"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = `${color}40`;
                e.currentTarget.style.color = color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
              title="Edit budget"
            >
              <Edit3 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${pct}%`,
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}50`,
            }}
          />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
            Spent
          </p>
          <p
            className="text-xs font-mono font-semibold"
            style={{ color: spentAmt > 0 ? statusColor : "var(--text-muted)" }}
          >
            {fmt(spentAmt)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
            Budget
          </p>
          <p className="text-xs font-mono font-semibold text-[var(--text-primary)]">
            {fmt(amount)}
          </p>
        </div>
        <div>
          <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-0.5">
            {overspent ? "Overspent" : "Remaining"}
          </p>
          <p
            className="text-xs font-mono font-semibold"
            style={{ color: overspent ? "#ef4444" : "#10b981" }}
          >
            {overspent ? `+${fmt(spentAmt - amount)}` : fmt(remaining)}
          </p>
        </div>
      </div>

      {/* Overspend warning */}
      {overspent && (
        <div
          className="flex items-center gap-2 mt-3 pt-2.5 text-xs"
          style={{ borderTop: "1px solid rgba(239,68,68,0.15)" }}
        >
          <AlertTriangle size={11} style={{ color: "#ef4444" }} className="shrink-0" />
          <span style={{ color: "#fca5a5" }}>
            Over budget by{" "}
            <span className="font-mono font-semibold">
              {fmt(spentAmt - amount)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = async () => {
    try {
      const [budgetRes, expenseRes] = await Promise.all([
        api.get("/api/budget"),
        api.get("/api/expenses"),
      ]);
      setBudgets(
        Array.isArray(budgetRes.data)
          ? budgetRes.data
          : budgetRes.data.budgets || []
      );
      setExpenses(
        Array.isArray(expenseRes.data)
          ? expenseRes.data
          : expenseRes.data.expenses || []
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchAll();
  };

  // Spending per category from expenses
  const spentByCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      const cat = e.category || "Other";
      map[cat] = (map[cat] || 0) + Number(e.amount || 0);
    });
    return map;
  }, [expenses]);

  // Summary stats
  const totalBudget = useMemo(
    () => budgets.reduce((s, b) => s + Number(b.amount || 0), 0),
    [budgets]
  );

  const totalSpent = useMemo(
    () =>
      budgets.reduce(
        (s, b) => s + Number(spentByCategory[b.category] || 0),
        0
      ),
    [budgets, spentByCategory]
  );

  const overBudgetCount = useMemo(
    () =>
      budgets.filter(
        (b) => Number(spentByCategory[b.category] || 0) > Number(b.amount || 0)
      ).length,
    [budgets, spentByCategory]
  );

  const overallPct =
    totalBudget > 0
      ? Math.min((totalSpent / totalBudget) * 100, 100).toFixed(1)
      : 0;

  const existingCategories = budgets.map((b) => b.category);

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "slideUp 0.3s ease forwards", opacity: 0 }}
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Budget Tracker
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {budgets.length} budget{budgets.length !== 1 ? "s" : ""} across{" "}
            {budgets.length} categor{budgets.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary w-9 h-9 p-0 flex items-center justify-center"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="btn-primary text-sm"
          >
            <Plus size={15} strokeWidth={2.5} />
            Set Budget
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      {!loading && budgets.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          style={{ animation: "slideUp 0.3s ease 0.05s forwards", opacity: 0 }}
        >
          {[
            {
              label: "Total Budget",
              value: fmt(totalBudget),
              icon: Target,
              color: "#22d3ee",
              sub: "Monthly allocation",
            },
            {
              label: "Total Spent",
              value: fmt(totalSpent),
              icon: TrendingUp,
              color: getStatusColor(Number(overallPct)),
              sub: `${overallPct}% of budget used`,
            },
            {
              label: "Remaining",
              value: fmt(Math.max(totalBudget - totalSpent, 0)),
              icon: PiggyBank,
              color: "#10b981",
              sub: "Available to spend",
            },
            {
              label: "Over Budget",
              value: `${overBudgetCount} categor${overBudgetCount !== 1 ? "ies" : "y"}`,
              icon: overBudgetCount > 0 ? AlertTriangle : CheckCircle2,
              color: overBudgetCount > 0 ? "#ef4444" : "#10b981",
              sub:
                overBudgetCount > 0
                  ? "Needs attention"
                  : "All within budget",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl px-4 py-3.5 flex items-center gap-3"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: `${stat.color}12`,
                    border: `1px solid ${stat.color}25`,
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: stat.color }}
                    strokeWidth={1.8}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-muted)]">
                    {stat.label}
                  </p>
                  <p className="text-sm font-mono font-medium text-[var(--text-primary)] mt-0.5">
                    {stat.value}
                  </p>
                  <p
                    className="text-[10px] mt-0.5"
                    style={{ color: stat.color }}
                  >
                    {stat.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Overall progress bar ── */}
      {!loading && budgets.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            animation: "slideUp 0.3s ease 0.08s forwards",
            opacity: 0,
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2
                size={14}
                style={{ color: "var(--text-muted)" }}
              />
              <span className="section-title">Overall Budget Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-sm font-mono font-semibold"
                style={{ color: getStatusColor(Number(overallPct)) }}
              >
                {overallPct}%
              </span>
              <span
                className="badge text-[10px]"
                style={{
                  background: `${getStatusColor(Number(overallPct))}12`,
                  color: getStatusColor(Number(overallPct)),
                  border: `1px solid ${getStatusColor(Number(overallPct))}25`,
                }}
              >
                {getStatusLabel(Number(overallPct))}
              </span>
            </div>
          </div>

          {/* Big progress bar */}
          <div
            className="h-3 rounded-full overflow-hidden mb-3"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700 relative"
              style={{
                width: `${overallPct}%`,
                background: `linear-gradient(90deg, ${getStatusColor(Number(overallPct))}, ${getStatusColor(Number(overallPct))}cc)`,
                boxShadow: `0 0 12px ${getStatusColor(Number(overallPct))}50`,
              }}
            />
          </div>

          {/* Spent vs Budget */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">
              Spent:{" "}
              <span
                className="font-mono font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {fmt(totalSpent)}
              </span>
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              Budget:{" "}
              <span
                className="font-mono font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {fmt(totalBudget)}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* ── Add form ── */}
      {showForm && (
        <div style={{ animation: "slideUp 0.25s ease forwards", opacity: 0 }}>
          <BudgetForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
            existingCategories={existingCategories}
          />
        </div>
      )}

      {/* ── Budget rows ── */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((budget, i) => (
            <BudgetRow
              key={budget.id || budget.category}
              budget={budget}
              spent={spentByCategory[budget.category] || 0}
              index={i}
              onEdit={fetchAll}
            />
          ))}
        </div>
      )}

      {/* ── Quick wins tip ── */}
      {!loading && budgets.length > 0 && overBudgetCount === 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "rgba(16,185,129,0.05)",
            border: "1px solid rgba(16,185,129,0.15)",
            animation: "slideUp 0.3s ease 0.2s forwards",
            opacity: 0,
          }}
        >
          <Zap size={14} style={{ color: "#10b981" }} className="shrink-0" />
          <p className="text-sm" style={{ color: "#6ee7b7" }}>
            <span className="font-semibold">Great job!</span>{" "}
            <span style={{ color: "var(--text-muted)" }}>
              All your spending categories are within budget this month.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}