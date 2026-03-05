import { ShieldCheck, ShieldAlert, ShieldX, AlertTriangle } from "lucide-react";

const RISK_CONFIG = {
  Low: {
    color: "#22C55E", bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)", Icon: ShieldCheck,
    gradient: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
    textColor: "#15803d",
  },
  Moderate: {
    color: "#F59E0B", bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)", Icon: ShieldAlert,
    gradient: "linear-gradient(135deg, #fef9c3, #fde68a)",
    textColor: "#b45309",
  },
  High: {
    color: "#EF4444", bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)", Icon: ShieldX,
    gradient: "linear-gradient(135deg, #fee2e2, #fecaca)",
    textColor: "#b91c1c",
  },
};

function RiskArc({ score }) {
  const radius = 52;
  const cx = 64, cy = 64;
  const startAngle = -210;
  const totalArc = 240;
  const angle = startAngle + (score / 100) * totalArc;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (start, end, r) => {
    const s = { x: cx + r * Math.cos(toRad(start)), y: cy + r * Math.sin(toRad(start)) };
    const e = { x: cx + r * Math.cos(toRad(end)),   y: cy + r * Math.sin(toRad(end)) };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };
  const scoreColor = score <= 33 ? "#22C55E" : score <= 66 ? "#F59E0B" : "#EF4444";

  return (
    <svg width="128" height="128" viewBox="0 0 128 128">
      <path d={arcPath(startAngle, startAngle + totalArc, radius)}
        fill="none" stroke="#F3F4F6" strokeWidth="8" strokeLinecap="round" />
      <path d={arcPath(startAngle, angle, radius)}
        fill="none" stroke={scoreColor} strokeWidth="8" strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${scoreColor}60)` }} />
      <text x="64" y="60" textAnchor="middle" fill="#111827"
        fontSize="22" fontWeight="700" fontFamily="DM Mono">
        {score}
      </text>
      <text x="64" y="76" textAnchor="middle" fill="#9CA3AF"
        fontSize="9" fontFamily="DM Sans" letterSpacing="2">
        RISK SCORE
      </text>
    </svg>
  );
}

export default function RiskBadge({ data, loading }) {
  if (loading) {
    return (
      <div className="rounded-2xl p-5"
        style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div className="shimmer h-3 w-28 rounded-full mb-5" />
        <div className="flex items-center gap-4">
          <div className="shimmer w-28 h-28 rounded-full" />
          <div className="flex-1 flex flex-col gap-2">
            <div className="shimmer h-5 w-24 rounded-full" />
            <div className="shimmer h-3 w-32 rounded-full" />
            <div className="shimmer h-3 w-28 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  const level = data?.riskLevel || "Low";
  const score = data?.riskScore ?? 0;
  const alerts = data?.alerts || [];
  const cfg = RISK_CONFIG[level] || RISK_CONFIG.Low;
  const { Icon } = cfg;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.07)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="section-title">Risk Assessment</span>
        <span
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{
            background: cfg.gradient,
            color: cfg.textColor,
          }}
        >
          <Icon size={11} />
          {level} Risk
        </span>
      </div>

      {/* Arc + details */}
      <div className="flex items-center gap-3">
        <div className="shrink-0">
          <RiskArc score={score} />
        </div>
        <div className="flex-1 min-w-0">
          {/* Score bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">Score</span>
              <span
                className="text-xs font-mono font-bold"
                style={{ color: cfg.color }}
              >
                {score}/100
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${score}%`,
                  background: cfg.color,
                  boxShadow: `0 0 8px ${cfg.color}50`,
                }}
              />
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                Alerts
              </span>
              {alerts.slice(0, 2).map((alert, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <AlertTriangle size={10} className="shrink-0 mt-0.5" style={{ color: cfg.color }} />
                  <span className="text-xs leading-snug text-gray-600">{alert}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
              style={{ background: "rgba(34,197,94,0.08)" }}>
              <ShieldCheck size={12} style={{ color: "#22C55E" }} />
              <span className="text-xs text-green-700 font-medium">No active alerts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}