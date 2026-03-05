import { useState, useEffect, useMemo } from "react";
import {
  Plus, Building2, Wallet, TrendingUp,
  ArrowUpRight, ArrowDownRight, RefreshCw,
  MoreHorizontal, CheckCircle2,
} from "lucide-react";
import api from "../api/axios";
import AccountForm from "../components/AccountForm";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);

const TYPE_CONFIG = {
  Checking:       { color: "#22d3ee", bg: "rgba(34,211,238,0.08)",  border: "rgba(34,211,238,0.2)"  },
  Savings:        { color: "#10b981", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.2)"  },
  Investment:     { color: "#8b5cf6", bg: "rgba(139,92,246,0.08)",  border: "rgba(139,92,246,0.2)"  },
  "Emergency Fund":{ color: "#f59e0b", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)"  },
  "Fixed Deposit":{ color: "#06b6d4", bg: "rgba(6,182,212,0.08)",   border: "rgba(6,182,212,0.2)"   },
  Other:          { color: "#64748b", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
};

const getTypeConfig = (type) => TYPE_CONFIG[type] || TYPE_CONFIG.Other;

// Bank initials avatar
function BankAvatar({ name, color }) {
  const initials = (name || "?")
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
      style={{
        background: `${color}12`,
        border: `1px solid ${color}25`,
        color,
        fontFamily: "DM Mono",
      }}
    >
      {initials}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="shimmer w-11 h-11 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <div className="shimmer h-3 w-28 rounded-full" />
            <div className="shimmer h-2.5 w-16 rounded-full" />
          </div>
        </div>
        <div className="shimmer h-5 w-20 rounded-full" />
      </div>
      <div className="shimmer h-7 w-32 rounded-full mt-2 mb-3" />
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
          background: "rgba(16,185,129,0.06)",
          border: "1px solid rgba(16,185,129,0.15)",
        }}
      >
        <Building2 size={22} style={{ color: "var(--text-muted)" }} strokeWidth={1.4} />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No bank accounts yet
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
          Add your bank accounts to track your total balance and net worth
        </p>
      </div>
      <button onClick={onAdd} className="btn-primary text-sm px-4 py-2"
        style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
        <Plus size={14} />
        Add first account
      </button>
    </div>
  );
}

// ── Account Card ──────────────────────────────────────────────────────────────

function AccountCard({ account, index }) {
  const cfg = getTypeConfig(account.type);
  const balance = Number(account.balance || 0);

  return (
    <div
      className="rounded-xl p-5 group transition-all duration-200 cursor-default"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        animation: `slideUp 0.35s ease ${index * 0.07}s forwards`,
        opacity: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = cfg.border;
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px ${cfg.border}`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BankAvatar
            name={account.bankName || account.name}
            color={cfg.color}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {account.name}
            </p>
            <p className="text-xs text-[var(--text-muted)] truncate">
              {account.bankName || "Personal Account"}
            </p>
          </div>
        </div>

        {/* Type badge */}
        <span
          className="badge text-[10px] font-semibold shrink-0"
          style={{
            background: cfg.bg,
            color: cfg.color,
            border: `1px solid ${cfg.border}`,
          }}
        >
          {account.type}
        </span>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-1">
          Current Balance
        </p>
        <p
          className="text-2xl font-mono font-semibold tracking-tight"
          style={{ color: balance >= 0 ? "var(--text-primary)" : "#ef4444" }}
        >
          {fmt(balance)}
        </p>
      </div>

      {/* Progress bar (visual only — shows relative fill) */}
      <div
        className="h-1 rounded-full overflow-hidden mb-3"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: balance > 0 ? `${Math.min((balance / 10000) * 100, 100)}%` : "0%",
            background: cfg.color,
            boxShadow: `0 0 8px ${cfg.color}60`,
          }}
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 size={11} style={{ color: "#10b981" }} />
          <span className="text-[10px] text-[var(--text-muted)]">Active</span>
        </div>
        {balance >= 0 ? (
          <div className="flex items-center gap-1">
            <ArrowUpRight size={11} style={{ color: "#10b981" }} />
            <span className="text-[10px]" style={{ color: "#10b981" }}>
              Positive balance
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <ArrowDownRight size={11} style={{ color: "#ef4444" }} />
            <span className="text-[10px]" style={{ color: "#ef4444" }}>
              Negative balance
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccounts = async () => {
    try {
      const { data } = await api.get("/api/accounts");
      setAccounts(Array.isArray(data) ? data : data.accounts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAccounts();
    setRefreshing(false);
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchAccounts();
  };

  // Derived stats
  const totalBalance = useMemo(
    () => accounts.reduce((s, a) => s + Number(a.balance || 0), 0),
    [accounts]
  );

  const byType = useMemo(() => {
    const map = {};
    accounts.forEach((a) => {
      map[a.type] = (map[a.type] || 0) + Number(a.balance || 0);
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [accounts]);

  const highestAccount = useMemo(
    () =>
      accounts.length
        ? accounts.reduce((best, a) =>
            Number(a.balance) > Number(best.balance) ? a : best
          )
        : null,
    [accounts]
  );

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "slideUp 0.3s ease forwards", opacity: 0 }}
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Bank Accounts
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""} connected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-secondary w-9 h-9 p-0 flex items-center justify-center"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowForm((p) => !p)}
            className="btn-primary text-sm"
            style={{
              background: "linear-gradient(135deg,#10b981,#059669)",
              boxShadow: "0 0 16px rgba(16,185,129,0.2)",
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Account
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      {!loading && accounts.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
          style={{ animation: "slideUp 0.3s ease 0.05s forwards", opacity: 0 }}
        >
          {[
            {
              label: "Total Balance",
              value: fmt(totalBalance),
              icon: Wallet,
              color: "#10b981",
              sub: `Across ${accounts.length} account${accounts.length !== 1 ? "s" : ""}`,
            },
            {
              label: "Highest Account",
              value: highestAccount ? fmt(highestAccount.balance) : "—",
              icon: TrendingUp,
              color: "#22d3ee",
              sub: highestAccount?.name || "—",
            },
            {
              label: "Account Types",
              value: `${byType.length} type${byType.length !== 1 ? "s" : ""}`,
              icon: Building2,
              color: "#8b5cf6",
              sub: byType.map(([t]) => t).join(", ") || "—",
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
                <div className="min-w-0">
                  <p className="text-xs text-[var(--text-muted)]">{stat.label}</p>
                  <p className="text-sm font-mono font-medium text-[var(--text-primary)] mt-0.5">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                    {stat.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add form ── */}
      {showForm && (
        <div style={{ animation: "slideUp 0.25s ease forwards", opacity: 0 }}>
          <AccountForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── Account cards grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
            style={{ animation: "slideUp 0.3s ease 0.1s forwards", opacity: 0 }}
          >
            {accounts.map((account, i) => (
              <AccountCard key={account.id || i} account={account} index={i} />
            ))}
          </div>

          {/* Balance breakdown */}
          {byType.length > 0 && (
            <div
              className="rounded-xl p-5"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                animation: "slideUp 0.3s ease 0.15s forwards",
                opacity: 0,
              }}
            >
              <p className="section-title mb-4">Balance by Account Type</p>
              <div className="flex flex-col gap-3">
                {byType.map(([type, amount]) => {
                  const cfg = getTypeConfig(type);
                  const pct = totalBalance > 0
                    ? ((amount / totalBalance) * 100).toFixed(1)
                    : 0;
                  return (
                    <div key={type}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: cfg.color,
                              boxShadow: `0 0 6px ${cfg.color}80`,
                            }}
                          />
                          <span className="text-xs text-[var(--text-secondary)]">
                            {type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className="text-[10px] font-mono"
                            style={{ color: cfg.color }}
                          >
                            {pct}%
                          </span>
                          <span className="text-xs font-mono text-[var(--text-primary)]">
                            {fmt(amount)}
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.04)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: cfg.color,
                            boxShadow: `0 0 8px ${cfg.color}50`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div
                className="flex items-center justify-between mt-4 pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span className="text-xs text-[var(--text-muted)]">
                  Total across all accounts
                </span>
                <span className="text-base font-mono font-semibold text-[var(--text-primary)]">
                  {fmt(totalBalance)}
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}