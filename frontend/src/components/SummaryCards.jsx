import {
  TrendingUp, TrendingDown, Wallet,
  CreditCard, Activity, ArrowUpRight,
} from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD", maximumFractionDigits: 0,
  }).format(n ?? 0);

const pct = (n) => `${(Number(n) || 0).toFixed(1)}%`;

const CARDS = (data) => [
  {
    label: "Net Worth",
    value: fmt(data.netWorth),
    icon: TrendingUp,
    color: "#2563EB",
    lightBg: "rgba(37,99,235,0.07)",
    border: "rgba(37,99,235,0.15)",
    trend: (data.netWorth ?? 0) >= 0 ? "+Positive" : "Negative",
    trendUp: (data.netWorth ?? 0) >= 0,
    sub: "Total assets minus liabilities",
  },
  {
    label: "Bank Balance",
    value: fmt(data.bankBalance),
    icon: Wallet,
    color: "#22C55E",
    lightBg: "rgba(34,197,94,0.07)",
    border: "rgba(34,197,94,0.15)",
    trend: "Available funds",
    trendUp: true,
    sub: "Across all accounts",
  },
  {
    label: "Credit Outstanding",
    value: fmt(data.creditOutstanding),
    icon: CreditCard,
    color: "#F59E0B",
    lightBg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.15)",
    trend: "Total owed",
    trendUp: false,
    sub: "Credit card debt",
  },
  {
    label: "Credit Utilization",
    value: pct(data.creditUtilization),
    icon: Activity,
    color:
      (Number(data.creditUtilization) || 0) > 70
        ? "#EF4444"
        : (Number(data.creditUtilization) || 0) > 40
        ? "#F59E0B"
        : "#22C55E",
    lightBg:
      (Number(data.creditUtilization) || 0) > 70
        ? "rgba(239,68,68,0.07)"
        : (Number(data.creditUtilization) || 0) > 40
        ? "rgba(245,158,11,0.07)"
        : "rgba(34,197,94,0.07)",
    border:
      (Number(data.creditUtilization) || 0) > 70
        ? "rgba(239,68,68,0.2)"
        : (Number(data.creditUtilization) || 0) > 40
        ? "rgba(245,158,11,0.2)"
        : "rgba(34,197,94,0.2)",
    trend:
      (Number(data.creditUtilization) || 0) <= 30
        ? "Excellent"
        : (Number(data.creditUtilization) || 0) <= 70
        ? "Moderate"
        : "High Risk",
    trendUp: (Number(data.creditUtilization) || 0) <= 30,
    sub: "Recommended under 30%",
  },
];

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="shimmer h-3 w-28 rounded-full" />
        <div className="shimmer w-10 h-10 rounded-xl" />
      </div>
      <div className="shimmer h-8 w-36 rounded-lg mb-3" />
      <div className="shimmer h-2 w-full rounded-full mb-3" />
      <div className="shimmer h-3 w-24 rounded-full" />
    </div>
  );
}

export default function SummaryCards({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const cards = CARDS(data || {});

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-2xl p-5 cursor-default transition-all duration-200"
            style={{
              background: "#fff",
              border: `1px solid rgba(0,0,0,0.07)`,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              animationDelay: `${i * 0.07}s`,
              animation: "slideUp 0.4s ease forwards",
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.border;
              e.currentTarget.style.boxShadow = `0 8px 24px ${card.lightBg}, 0 0 0 1px ${card.border}`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(0,0,0,0.07)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Top row */}
            <div className="flex items-start justify-between mb-3">
              <span
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#9CA3AF" }}
              >
                {card.label}
              </span>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  background: card.lightBg,
                  border: `1px solid ${card.border}`,
                }}
              >
                <Icon size={16} style={{ color: card.color }} strokeWidth={2} />
              </div>
            </div>

            {/* Value */}
            <div className="mb-3">
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: "#111827", fontFamily: "DM Mono, monospace" }}
              >
                {card.value}
              </span>
            </div>

            {/* Mini progress bar for utilization */}
            {card.label === "Credit Utilization" && (
              <div
                className="h-1.5 rounded-full overflow-hidden mb-3"
                style={{ background: "#F3F4F6" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: card.value,
                    background: card.color,
                    transition: "width 0.7s ease",
                  }}
                />
              </div>
            )}

            {/* Trend row */}
            <div className="flex items-center gap-1.5">
              <div
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  background: card.trendUp
                    ? "rgba(34,197,94,0.1)"
                    : "rgba(239,68,68,0.08)",
                  color: card.trendUp ? "#22C55E" : "#EF4444",
                }}
              >
                {card.trendUp
                  ? <ArrowUpRight size={11} />
                  : <TrendingDown size={11} />}
                {card.trend}
              </div>
            </div>

            <p className="text-xs mt-2" style={{ color: "#9CA3AF" }}>
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}