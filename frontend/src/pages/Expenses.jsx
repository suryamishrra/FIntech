import { useState, useEffect, useMemo } from "react";
import {
  Plus, Search, Filter, TrendingDown, Receipt,
  Calendar, Tag, DollarSign, Trash2, ChevronDown, X,
} from "lucide-react";
import api from "../api/axios";
import ExpenseForm from "../components/expenseForm";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const CATEGORY_COLORS = {
  "Food & Dining":  "#22d3ee",
  Transport:        "#10b981",
  Shopping:         "#8b5cf6",
  Entertainment:    "#ec4899",
  Health:           "#f97316",
  Utilities:        "#f59e0b",
  Rent:             "#ef4444",
  Education:        "#06b6d4",
  Travel:           "#84cc16",
  Other:            "#64748b",
};

const getCategoryColor = (cat) => CATEGORY_COLORS[cat] || "#64748b";

// ── Skeleton Row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      className="flex items-center gap-4 px-5 py-4"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="shimmer w-9 h-9 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-1.5">
        <div className="shimmer h-3 w-36 rounded-full" />
        <div className="shimmer h-2.5 w-24 rounded-full" />
      </div>
      <div className="shimmer h-3 w-16 rounded-full" />
      <div className="shimmer h-5 w-20 rounded-full" />
      <div className="shimmer h-3 w-20 rounded-full" />
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ hasFilter, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: "rgba(34,211,238,0.06)",
          border: "1px solid rgba(34,211,238,0.12)",
        }}
      >
        <Receipt size={22} style={{ color: "var(--text-muted)" }} strokeWidth={1.4} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          {hasFilter ? "No matching expenses" : "No expenses yet"}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          {hasFilter
            ? "Try clearing your filters"
            : "Start tracking your spending by adding your first expense"}
        </p>
      </div>
      {!hasFilter && (
        <button onClick={onAdd} className="btn-primary text-sm px-4 py-2">
          <Plus size={14} />
          Add first expense
        </button>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

 const fetchExpenses = async () => {
  setLoading(true);
  try {
    const { data } = await api.get("/api/expenses");
    // Response structure: { success, message, data: { expenses: [...] } }
    const list = data?.data?.expenses || data?.data || data?.expenses || (Array.isArray(data) ? data : []);
    setExpenses(list);
  } catch (e) {
    console.error(e);
    setExpenses([]);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Derived categories list
  const categories = useMemo(() => {
    const cats = [...new Set(expenses.map((e) => e.category).filter(Boolean))];
    return ["All", ...cats];
  }, [expenses]);

  // Filtered + sorted list
  const filtered = useMemo(() => {
    let list = [...expenses];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
      );
    }
    if (filterCat !== "All") list = list.filter((e) => e.category === filterCat);
    list.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
      if (sortBy === "oldest")
        return new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date);
      if (sortBy === "highest") return Number(b.amount) - Number(a.amount);
      if (sortBy === "lowest")  return Number(a.amount) - Number(b.amount);
      return 0;
    });
    return list;
  }, [expenses, search, filterCat, sortBy]);

  // Stats
  const totalSpend = useMemo(
    () => filtered.reduce((s, e) => s + Number(e.amount || 0), 0),
    [filtered]
  );
  const avgSpend = filtered.length > 0 ? totalSpend / filtered.length : 0;
  const topCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + Number(e.amount || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  }, [expenses]);

  const handleSuccess = () => {
    setShowForm(false);
    fetchExpenses();
  };

  const hasFilter = search || filterCat !== "All";

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* ── Page header ── */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "slideUp 0.3s ease forwards", opacity: 0 }}
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Expenses
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {expenses.length} transaction{expenses.length !== 1 ? "s" : ""} recorded
          </p>
        </div>
        <button
          onClick={() => setShowForm((p) => !p)}
          className="btn-primary text-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Expense
        </button>
      </div>

      {/* ── Stats row ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        style={{ animation: "slideUp 0.3s ease 0.05s forwards", opacity: 0 }}
      >
        {[
          {
            label: "Total Spend",
            value: fmt(totalSpend),
            icon: DollarSign,
            color: "#22d3ee",
          },
          {
            label: "Avg per Transaction",
            value: fmt(avgSpend),
            icon: TrendingDown,
            color: "#f59e0b",
          },
          {
            label: "Top Category",
            value: topCategory,
            icon: Tag,
            color: getCategoryColor(topCategory),
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
                <Icon size={15} style={{ color: stat.color }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                <p className="text-sm font-mono font-medium text-[var(--text-primary)] mt-0.5">
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Add form ── */}
      {showForm && (
        <div style={{ animation: "slideUp 0.25s ease forwards", opacity: 0 }}>
          <ExpenseForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── Table card ── */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          animation: "slideUp 0.3s ease 0.1s forwards",
          opacity: 0,
        }}
      >
        {/* Toolbar */}
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {/* Search */}
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              className="input pl-9 h-9 text-xs"
              placeholder="Search expenses…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((p) => !p)}
              className="btn-secondary text-xs h-9 px-3 flex items-center gap-1.5"
              style={
                showFilters
                  ? { borderColor: "rgba(34,211,238,0.3)", color: "var(--accent)", background: "var(--accent-dim)" }
                  : {}
              }
            >
              <Filter size={12} />
              Filters
              {hasFilter && (
                <span
                  className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: "var(--accent)", color: "#060b18" }}
                >
                  !
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                className="input h-9 text-xs pr-8 cursor-pointer appearance-none pl-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ backgroundImage: "none", minWidth: "120px" }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
              </select>
              <ChevronDown
                size={11}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
            </div>
          </div>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div
            className="flex items-center gap-2 px-5 py-3 flex-wrap"
            style={{
              borderBottom: "1px solid var(--border)",
              background: "rgba(0,0,0,0.15)",
              animation: "slideUp 0.2s ease forwards",
            }}
          >
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mr-1">
              Category:
            </span>
            {categories.map((cat) => {
              const color = cat === "All" ? "var(--accent)" : getCategoryColor(cat);
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all duration-150"
                  style={{
                    background: active ? `${color}15` : "var(--bg-card-alt)",
                    border: `1px solid ${active ? color + "40" : "var(--border)"}`,
                    color: active ? color : "var(--text-muted)",
                  }}
                >
                  {cat}
                </button>
              );
            })}
            {hasFilter && (
              <button
                onClick={() => { setFilterCat("All"); setSearch(""); }}
                className="px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ml-auto"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
              >
                Clear all
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div>
            {[1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasFilter={!!hasFilter} onAdd={() => setShowForm(true)} />
        ) : (
          <>
            {/* Column headers */}
            <div
              className="hidden sm:grid grid-cols-12 gap-4 px-5 py-2.5"
              style={{
                borderBottom: "1px solid var(--border)",
                background: "rgba(0,0,0,0.1)",
              }}
            >
              {["Expense", "Category", "Amount", "Date"].map((h, i) => (
                <span
                  key={h}
                  className={`text-[10px] font-semibold uppercase tracking-widest col-span-${[4, 3, 2, 3][i]}`}
                  style={{ color: "var(--text-muted)" }}
                >
                  {h}
                </span>
              ))}
            </div>

            {/* Rows */}
            <div>
              {filtered.map((exp, idx) => {
                const color = getCategoryColor(exp.category);
                return (
                  <div
                    key={exp.id || idx}
                    className="grid grid-cols-12 gap-4 items-center px-5 py-3.5 group transition-all duration-150"
                    style={{
                      borderBottom: "1px solid var(--border)",
                      animationDelay: `${idx * 0.03}s`,
                      animation: "fadeIn 0.3s ease forwards",
                      opacity: 0,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Title + desc */}
                    <div className="col-span-12 sm:col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                        style={{
                          background: `${color}12`,
                          border: `1px solid ${color}25`,
                          color,
                        }}
                      >
                        {(exp.title || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                          {exp.title}
                        </p>
                        {exp.description && (
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Category */}
                    <div className="col-span-5 sm:col-span-3">
                      <span
                        className="badge text-[10px]"
                        style={{
                          background: `${color}12`,
                          color,
                          border: `1px solid ${color}25`,
                        }}
                      >
                        {exp.category || "Other"}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="col-span-4 sm:col-span-2">
                      <span className="text-sm font-mono font-medium text-[var(--text-primary)]">
                        {fmt(exp.amount)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-3 sm:col-span-3 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Calendar
                          size={11}
                          style={{ color: "var(--text-muted)" }}
                          className="shrink-0"
                        />
                        <span className="text-xs text-[var(--text-muted)]">
                          {fmtDate(exp.createdAt || exp.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer totals */}
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{
                borderTop: "1px solid var(--border)",
                background: "rgba(0,0,0,0.1)",
              }}
            >
              <span className="text-xs text-[var(--text-muted)]">
                Showing{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {expenses.length}
                </span>{" "}
                expenses
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[var(--text-muted)]">Total:</span>
                <span className="text-sm font-mono font-semibold text-cyan-400">
                  {fmt(totalSpend)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}