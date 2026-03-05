import { useState, useEffect, useMemo } from "react";
import {
  Plus, CreditCard, DollarSign, AlertTriangle,
  TrendingDown, RefreshCw, Wifi, CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import api from "../api/axios";
import CardForm from "../components/cardForm";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n ?? 0);

const NETWORK_COLORS = {
  Visa:       { color: "#1a56db", bg: "rgba(26,86,219,0.12)"  },
  Mastercard: { color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
  Amex:       { color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  Discover:   { color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  Other:      { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)" },
};

const getNetworkConfig = (type) =>
  NETWORK_COLORS[type] || NETWORK_COLORS.Other;

const getUtilizationColor = (pct) =>
  pct > 70 ? "#ef4444" : pct > 40 ? "#f59e0b" : "#10b981";

const getUtilizationLabel = (pct) =>
  pct > 70 ? "High Risk" : pct > 40 ? "Moderate" : "Healthy";

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--border)" }}
    >
      {/* Card face */}
      <div className="shimmer h-44 w-full" />
      {/* Details */}
      <div
        className="p-4 flex flex-col gap-2"
        style={{ background: "var(--bg-card)" }}
      >
        <div className="shimmer h-3 w-24 rounded-full" />
        <div className="shimmer h-1.5 w-full rounded-full" />
        <div className="flex justify-between mt-1">
          <div className="shimmer h-2.5 w-16 rounded-full" />
          <div className="shimmer h-2.5 w-16 rounded-full" />
        </div>
      </div>
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
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.15)",
        }}
      >
        <CreditCard
          size={22}
          style={{ color: "var(--text-muted)" }}
          strokeWidth={1.4}
        />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          No credit cards yet
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
          Add your credit cards to track utilization and outstanding balances
        </p>
      </div>
      <button
        onClick={onAdd}
        className="btn-primary text-sm px-4 py-2"
        style={{
          background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
          boxShadow: "0 0 16px rgba(139,92,246,0.2)",
        }}
      >
        <Plus size={14} />
        Add first card
      </button>
    </div>
  );
}

// ── Credit Card Visual ────────────────────────────────────────────────────────

function CardVisual({ card, index }) {
  const cfg = getNetworkConfig(card.cardType);
  const outstanding = Number(card.outstanding || 0);
  const limit = Number(card.limit || 1);
  const utilPct = Math.min((outstanding / limit) * 100, 100);
  const utilColor = getUtilizationColor(utilPct);

  // Card gradient based on network
  const gradients = {
    Visa:       "linear-gradient(135deg, #0d1e35 0%, #1a3353 50%, #0a2540 100%)",
    Mastercard: "linear-gradient(135deg, #1a0a0a 0%, #3d1515 50%, #1a0a0a 100%)",
    Amex:       "linear-gradient(135deg, #0a1a14 0%, #0d2d20 50%, #063d1e 100%)",
    Discover:   "linear-gradient(135deg, #1a120a 0%, #2d1f00 50%, #1a0f00 100%)",
    Other:      "linear-gradient(135deg, #130a2d 0%, #1e0f47 50%, #120a2d 100%)",
  };

  const cardGradient = gradients[card.cardType] || gradients.Other;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 cursor-default group"
      style={{
        border: "1px solid var(--border)",
        animation: `slideUp 0.35s ease ${index * 0.08}s forwards`,
        opacity: 0,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 16px 40px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.color}30`;
        e.currentTarget.style.borderColor = `${cfg.color}40`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--border)";
      }}
    >
      {/* ── Card Face ── */}
      <div
        className="relative p-5 h-44 flex flex-col justify-between overflow-hidden"
        style={{ background: cardGradient }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-20"
          style={{ background: cfg.color }}
        />
        <div
          className="absolute -right-4 top-8 w-20 h-20 rounded-full opacity-10"
          style={{ background: cfg.color }}
        />

        {/* Top row */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Wifi
              size={16}
              style={{ color: "rgba(255,255,255,0.5)" }}
              strokeWidth={1.5}
            />
          </div>
          <span
            className="text-xs font-bold tracking-widest px-2 py-0.5 rounded"
            style={{
              background: `${cfg.color}20`,
              color: cfg.color,
              border: `1px solid ${cfg.color}40`,
              fontFamily: "DM Mono",
            }}
          >
            {card.cardType || "CARD"}
          </span>
        </div>

        {/* Card number placeholder */}
        <div className="relative z-10">
          <p
            className="text-sm tracking-[0.25em] mb-3 opacity-60"
            style={{ color: "rgba(255,255,255,0.7)", fontFamily: "DM Mono" }}
          >
            •••• •••• •••• ••••
          </p>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-widest opacity-50 text-white mb-0.5">
                Card Name
              </p>
              <p
                className="text-sm font-semibold text-white truncate max-w-[140px]"
              >
                {card.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest opacity-50 text-white mb-0.5">
                Issuer
              </p>
              <p className="text-xs text-white opacity-80">
                {card.bankName || "—"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Card Details ── */}
      <div
        className="p-4"
        style={{
          background: "var(--bg-card)",
          borderTop: "1px solid var(--border)",
        }}
      >
        {/* Utilization bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              Credit Utilization
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="text-[10px] font-mono font-semibold"
                style={{ color: utilColor }}
              >
                {utilPct.toFixed(1)}%
              </span>
              <span
                className="badge text-[9px] px-1.5 py-0.5"
                style={{
                  background: `${utilColor}12`,
                  color: utilColor,
                  border: `1px solid ${utilColor}25`,
                }}
              >
                {getUtilizationLabel(utilPct)}
              </span>
            </div>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${utilPct}%`,
                background: utilColor,
                boxShadow: `0 0 8px ${utilColor}60`,
              }}
            />
          </div>
        </div>

        {/* Balance row */}
        <div className="grid grid-cols-2 gap-3">
          <div
            className="rounded-lg p-2.5"
            style={{
              background: "var(--bg-card-alt)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Outstanding
            </p>
            <p
              className="text-sm font-mono font-semibold"
              style={{
                color: outstanding > 0 ? "#f59e0b" : "var(--text-primary)",
              }}
            >
              {fmt(outstanding)}
            </p>
          </div>
          <div
            className="rounded-lg p-2.5"
            style={{
              background: "var(--bg-card-alt)",
              border: "1px solid var(--border)",
            }}
          >
            <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
              Credit Limit
            </p>
            <p className="text-sm font-mono font-semibold text-[var(--text-primary)]">
              {fmt(limit)}
            </p>
          </div>
        </div>

        {/* Available credit */}
        <div
          className="flex items-center justify-between mt-3 pt-3"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={11} style={{ color: "#10b981" }} />
            <span className="text-[10px] text-[var(--text-muted)]">
              Available Credit
            </span>
          </div>
          <span
            className="text-xs font-mono font-medium"
            style={{ color: "#10b981" }}
          >
            {fmt(Math.max(limit - outstanding, 0))}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Cards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCards = async () => {
    try {
      const { data } = await api.get("/api/cards");
      setCards(Array.isArray(data) ? data : data.cards || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  };

  const handleSuccess = () => {
    setShowForm(false);
    fetchCards();
  };

  // Derived stats
  const totalOutstanding = useMemo(
    () => cards.reduce((s, c) => s + Number(c.outstanding || 0), 0),
    [cards]
  );

  const totalLimit = useMemo(
    () => cards.reduce((s, c) => s + Number(c.limit || 0), 0),
    [cards]
  );

  const overallUtilization = useMemo(
    () => (totalLimit > 0 ? (totalOutstanding / totalLimit) * 100 : 0),
    [totalOutstanding, totalLimit]
  );

  const highRiskCards = useMemo(
    () =>
      cards.filter((c) => {
        const pct = (Number(c.outstanding || 0) / Number(c.limit || 1)) * 100;
        return pct > 70;
      }),
    [cards]
  );

  const utilizationColor = getUtilizationColor(overallUtilization);

  return (
    <div className="flex flex-col gap-6 pb-8">

      {/* ── Header ── */}
      <div
        className="flex items-center justify-between"
        style={{ animation: "slideUp 0.3s ease forwards", opacity: 0 }}
      >
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Credit Cards
          </h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">
            {cards.length} card{cards.length !== 1 ? "s" : ""} tracked
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
            style={{
              background: "linear-gradient(135deg,#8b5cf6,#7c3aed)",
              boxShadow: "0 0 16px rgba(139,92,246,0.2)",
            }}
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Card
          </button>
        </div>
      </div>

      {/* ── Summary stats ── */}
      {!loading && cards.length > 0 && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
          style={{ animation: "slideUp 0.3s ease 0.05s forwards", opacity: 0 }}
        >
          {[
            {
              label: "Total Outstanding",
              value: fmt(totalOutstanding),
              icon: DollarSign,
              color: "#f59e0b",
              sub: "Total owed across cards",
            },
            {
              label: "Total Credit Limit",
              value: fmt(totalLimit),
              icon: CreditCard,
              color: "#8b5cf6",
              sub: "Combined credit limit",
            },
            {
              label: "Overall Utilization",
              value: `${overallUtilization.toFixed(1)}%`,
              icon: TrendingDown,
              color: utilizationColor,
              sub: getUtilizationLabel(overallUtilization),
            },
            {
              label: "High Risk Cards",
              value: `${highRiskCards.length} card${highRiskCards.length !== 1 ? "s" : ""}`,
              icon: ShieldAlert,
              color: highRiskCards.length > 0 ? "#ef4444" : "#10b981",
              sub:
                highRiskCards.length > 0
                  ? "Above 70% utilization"
                  : "All cards healthy",
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

      {/* ── High risk alert ── */}
      {!loading && highRiskCards.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{
            background: "rgba(239,68,68,0.06)",
            border: "1px solid rgba(239,68,68,0.18)",
            animation: "slideUp 0.3s ease 0.08s forwards",
            opacity: 0,
          }}
        >
          <AlertTriangle
            size={15}
            style={{ color: "#ef4444" }}
            className="shrink-0"
          />
          <p className="text-sm" style={{ color: "#fca5a5" }}>
            <span className="font-semibold">
              {highRiskCards.length} card
              {highRiskCards.length !== 1 ? "s" : ""}
            </span>{" "}
            {highRiskCards.length !== 1 ? "are" : "is"} above 70% utilization —{" "}
            <span style={{ color: "var(--text-muted)" }}>
              {highRiskCards.map((c) => c.name).join(", ")}
            </span>
          </p>
        </div>
      )}

      {/* ── Add form ── */}
      {showForm && (
        <div style={{ animation: "slideUp 0.25s ease forwards", opacity: 0 }}>
          <CardForm
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* ── Cards grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : cards.length === 0 ? (
        <EmptyState onAdd={() => setShowForm(true)} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <CardVisual key={card.id || i} card={card} index={i} />
            ))}
          </div>

          {/* ── Overall utilization breakdown ── */}
          <div
            className="rounded-xl p-5"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              animation: "slideUp 0.3s ease 0.15s forwards",
              opacity: 0,
            }}
          >
            <p className="section-title mb-4">Utilization Overview</p>

            <div className="flex flex-col gap-3">
              {cards.map((card) => {
                const outstanding = Number(card.outstanding || 0);
                const limit = Number(card.limit || 1);
                const pct = Math.min((outstanding / limit) * 100, 100);
                const color = getUtilizationColor(pct);
                return (
                  <div key={card.id || card.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            background: color,
                            boxShadow: `0 0 5px ${color}80`,
                          }}
                        />
                        <span className="text-xs text-[var(--text-secondary)]">
                          {card.name}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded font-mono"
                          style={{
                            background: "var(--bg-card-alt)",
                            color: "var(--text-muted)",
                          }}
                        >
                          {card.cardType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className="text-[10px] font-mono"
                          style={{ color }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">
                          {fmt(outstanding)} / {fmt(limit)}
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
                          background: color,
                          boxShadow: `0 0 8px ${color}50`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Totals footer */}
            <div
              className="grid grid-cols-3 gap-3 mt-4 pt-4"
              style={{ borderTop: "1px solid var(--border)" }}
            >
              {[
                { label: "Total Outstanding", value: fmt(totalOutstanding), color: "#f59e0b" },
                { label: "Total Limit",       value: fmt(totalLimit),       color: "var(--text-primary)" },
                { label: "Available Credit",  value: fmt(Math.max(totalLimit - totalOutstanding, 0)), color: "#10b981" },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-[10px] text-[var(--text-muted)] mb-1">{item.label}</p>
                  <p
                    className="text-sm font-mono font-semibold"
                    style={{ color: item.color }}
                  >
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}