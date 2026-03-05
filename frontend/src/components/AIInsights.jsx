import { useState } from "react";
import {
  Sparkles, Lightbulb, ArrowRight, Zap,
  TrendingUp, AlertCircle, CheckCircle2, RefreshCw, ChevronDown, ChevronUp,
} from "lucide-react";
import api from "../api/axios";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Section({ icon: Icon, label, color, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{ background: "var(--bg-card-alt)", border: "1px solid var(--border)" }}
    >
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center justify-between w-full px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            <Icon size={12} style={{ color }} strokeWidth={2.2} />
          </div>
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)" }}
          >
            {label}
          </span>
        </div>
        {open
          ? <ChevronUp size={13} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={13} style={{ color: "var(--text-muted)" }} />}
      </button>
      {open && (
        <div
          className="px-4 pb-4"
          style={{ animation: "slideUp 0.2s ease forwards" }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function StepItem({ index, text, color }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
      >
        {index}
      </span>
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {text}
      </p>
    </div>
  );
}

function WinItem({ text }) {
  return (
    <div className="flex items-start gap-2.5">
      <CheckCircle2
        size={14}
        className="shrink-0 mt-0.5"
        style={{ color: "#10b981" }}
      />
      <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {text}
      </p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function AISkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {/* Header shimmer */}
      <div className="flex items-center gap-3 mb-1">
        <div className="shimmer w-8 h-8 rounded-xl" />
        <div className="flex flex-col gap-1.5">
          <div className="shimmer h-3 w-32 rounded-full" />
          <div className="shimmer h-2.5 w-20 rounded-full" />
        </div>
      </div>
      {[80, 60, 90, 70].map((w, i) => (
        <div key={i} className={`shimmer h-3 rounded-full`} style={{ width: `${w}%` }} />
      ))}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shimmer h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Idle / Prompt State ───────────────────────────────────────────────────────

function IdleState({ onAnalyze }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-4">
      {/* Animated orb */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, rgba(34,211,238,0.15), rgba(6,182,212,0.08))",
            border: "1px solid rgba(34,211,238,0.2)",
            boxShadow: "0 0 32px rgba(34,211,238,0.12)",
          }}
        >
          <Sparkles size={24} style={{ color: "#22d3ee" }} strokeWidth={1.5} />
        </div>
        {/* Ping ring */}
        <div
          className="absolute inset-0 rounded-2xl animate-ping"
          style={{
            background: "transparent",
            border: "1px solid rgba(34,211,238,0.2)",
            animationDuration: "2s",
          }}
        />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">
          AI Financial Analysis
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
          Get personalized insights, risk analysis, and actionable advice powered by Gemini AI.
        </p>
      </div>

      <button
        onClick={onAnalyze}
        className="btn-primary px-5 py-2.5"
        style={{ boxShadow: "0 0 20px rgba(34,211,238,0.2)" }}
      >
        <Sparkles size={14} />
        Analyze my finances
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

// ── Error State ───────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-8 gap-3 rounded-xl"
      style={{
        background: "rgba(239,68,68,0.04)",
        border: "1px solid rgba(239,68,68,0.12)",
      }}
    >
      <AlertCircle size={22} style={{ color: "#ef4444" }} strokeWidth={1.5} />
      <div className="text-center">
        <p className="text-sm font-medium" style={{ color: "#f87171" }}>Analysis failed</p>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">{message}</p>
      </div>
      <button onClick={onRetry} className="btn-secondary flex items-center gap-2 text-sm">
        <RefreshCw size={13} />
        Try again
      </button>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AIInsights({ summary }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [insights, setInsights] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    setState("loading");
    setError("");
    try {
      const { data } = await api.post("/api/ai/analyze", { summary });
      setInsights(data);
      setState("done");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to reach the AI service. Please try again."
      );
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setInsights(null);
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
      }}
    >
      {/* ── Panel Header ── */}
      <div
        className="flex items-center justify-between mb-5"
        style={{ borderBottom: "1px solid var(--border)", paddingBottom: "14px" }}
      >
        <div className="flex items-center gap-3">
          {/* Glowing icon */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              boxShadow: "0 0 16px rgba(34,211,238,0.3)",
            }}
          >
            <Sparkles size={14} className="text-navy-950" strokeWidth={2.2} />
          </div>
          <div>
            <p className="text-sm font-semibold text-[var(--text-primary)]">
              AI Insights
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Powered by Gemini AI
            </p>
          </div>
        </div>

        {/* Right side badges */}
        <div className="flex items-center gap-2">
          {state === "done" && (
            <>
              <span
                className="badge text-[10px]"
                style={{
                  background: "rgba(16,185,129,0.08)",
                  color: "#10b981",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Analysis complete
              </span>
              <button
                onClick={reset}
                className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1.5"
                title="Re-run analysis"
              >
                <RefreshCw size={11} />
                Refresh
              </button>
            </>
          )}
          {state === "loading" && (
            <span
              className="badge text-[10px]"
              style={{
                background: "rgba(34,211,238,0.08)",
                color: "var(--accent)",
                border: "1px solid rgba(34,211,238,0.2)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Analyzing…
            </span>
          )}
        </div>
      </div>

      {/* ── Content States ── */}
      {state === "idle" && <IdleState onAnalyze={analyze} />}
      {state === "loading" && <AISkeleton />}
      {state === "error" && <ErrorState message={error} onRetry={analyze} />}

      {state === "done" && insights && (
        <div className="flex flex-col gap-3" style={{ animation: "slideUp 0.35s ease forwards" }}>

          {/* Summary */}
          <Section icon={Sparkles} label="Summary" color="#22d3ee" defaultOpen={true}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {insights.summary}
            </p>
          </Section>

          {/* What This Means */}
          <Section icon={Lightbulb} label="What This Means" color="#f59e0b" defaultOpen={true}>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {insights.whatThisMeans}
            </p>
          </Section>

          {/* Action Steps */}
          <Section icon={TrendingUp} label="Action Steps" color="#8b5cf6" defaultOpen={true}>
            <div className="flex flex-col gap-3">
              {(Array.isArray(insights.actionSteps)
                ? insights.actionSteps
                : [insights.actionSteps]
              ).map((step, i) => (
                <StepItem key={i} index={i + 1} text={step} color="#8b5cf6" />
              ))}
            </div>
          </Section>

          {/* Quick Wins */}
          <Section icon={Zap} label="Quick Wins" color="#10b981" defaultOpen={true}>
            <div className="flex flex-col gap-2.5">
              {(Array.isArray(insights.quickWins)
                ? insights.quickWins
                : [insights.quickWins]
              ).map((win, i) => (
                <WinItem key={i} text={win} />
              ))}
            </div>
          </Section>

          {/* Footer timestamp */}
          <p className="text-[10px] text-[var(--text-muted)] text-right mt-1 font-mono">
            Generated {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      )}
    </div>
  );
}