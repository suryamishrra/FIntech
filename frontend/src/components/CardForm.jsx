import { useState } from "react";
import { Plus, X, CreditCard, DollarSign, Building2, Loader2, Hash } from "lucide-react";
import api from "../api/axios";

const CARD_TYPES = ["Visa", "Mastercard", "Amex", "Discover", "Other"];

const BANKS = [
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "Capital One",
  "Amex",
  "Discover",
  "US Bank",
  "Other",
];

export default function CardForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    cardType: "",
    bankName: "",
    limit: "",
    outstanding: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const utilization =
    form.limit && form.outstanding
      ? Math.min(
          ((parseFloat(form.outstanding) / parseFloat(form.limit)) * 100).toFixed(1),
          100
        )
      : null;

  const utilizationColor =
    utilization === null
      ? "var(--text-muted)"
      : utilization > 70
      ? "#ef4444"
      : utilization > 40
      ? "#f59e0b"
      : "#10b981";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.cardType || !form.limit) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isNaN(Number(form.limit)) || Number(form.limit) <= 0) {
      setError("Please enter a valid credit limit.");
      return;
    }
    if (form.outstanding && isNaN(Number(form.outstanding))) {
      setError("Please enter a valid outstanding amount.");
      return;
    }
    if (
      form.outstanding &&
      Number(form.outstanding) > Number(form.limit)
    ) {
      setError("Outstanding balance cannot exceed credit limit.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/cards", {
        ...form,
        limit: parseFloat(form.limit),
        outstanding: parseFloat(form.outstanding || 0),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid rgba(139,92,246,0.2)",
        boxShadow: "0 0 32px rgba(139,92,246,0.06)",
        animation: "slideUp 0.25s ease forwards",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(139,92,246,0.1)",
              border: "1px solid rgba(139,92,246,0.2)",
            }}
          >
            <Plus size={14} style={{ color: "#8b5cf6" }} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            New Credit Card
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

      {/* Error */}
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
        {/* Card Name + Bank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Card Name *</label>
            <div className="relative">
              <CreditCard
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                className="input pl-9"
                placeholder="e.g. Travel Rewards"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Bank / Issuer</label>
            <div className="relative">
              <Building2
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <select
                className="input pl-9 cursor-pointer appearance-none"
                value={form.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                style={{ backgroundImage: "none" }}
              >
                <option value="">Select issuer</option>
                {BANKS.map((b) => (
                  <option
                    key={b}
                    value={b}
                    style={{ background: "var(--bg-card-alt)" }}
                  >
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Card Type */}
        <div>
          <label className="label">Card Network *</label>
          <div className="grid grid-cols-5 gap-2">
            {CARD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => set("cardType", type)}
                className="py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer"
                style={
                  form.cardType === type
                    ? {
                        background: "rgba(139,92,246,0.15)",
                        border: "1px solid rgba(139,92,246,0.4)",
                        color: "#8b5cf6",
                      }
                    : {
                        background: "var(--bg-card-alt)",
                        border: "1px solid var(--border)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Limit + Outstanding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Credit Limit *</label>
            <div className="relative">
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
                value={form.limit}
                onChange={(e) => set("limit", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">
              Outstanding{" "}
              <span style={{ color: "var(--text-muted)" }}>(optional)</span>
            </label>
            <div className="relative">
              <Hash
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="number"
                className="input pl-9 font-mono"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={form.outstanding}
                onChange={(e) => set("outstanding", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Live utilization preview */}
        {utilization !== null && (
          <div
            className="rounded-lg px-4 py-3"
            style={{
              background: "var(--bg-card-alt)",
              border: "1px solid var(--border)",
              animation: "fadeIn 0.2s ease forwards",
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">
                Credit Utilization Preview
              </span>
              <span
                className="text-xs font-mono font-semibold"
                style={{ color: utilizationColor }}
              >
                {utilization}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${utilization}%`,
                  background: utilizationColor,
                  boxShadow: `0 0 8px ${utilizationColor}60`,
                }}
              />
            </div>
            <p
              className="text-[10px] mt-1.5"
              style={{ color: "var(--text-muted)" }}
            >
              {utilization > 70
                ? "⚠️ High utilization — may impact credit score"
                : utilization > 40
                ? "Moderate — aim to keep below 30%"
                : "✓ Healthy utilization range"}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 h-10 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
              boxShadow: loading ? "none" : "0 0 16px rgba(139,92,246,0.25)",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} />
                Add Card
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