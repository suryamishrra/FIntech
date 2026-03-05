import { useState } from "react";
import { Plus, X, Building2, DollarSign, CreditCard, Loader2 } from "lucide-react";
import api from "../api/axios";

const ACCOUNT_TYPES = [
  "Checking",
  "Savings",
  "Investment",
  "Emergency Fund",
  "Fixed Deposit",
  "Other",
];

const BANKS = [
  "Chase",
  "Bank of America",
  "Wells Fargo",
  "Citibank",
  "US Bank",
  "Capital One",
  "TD Bank",
  "PNC Bank",
  "Other",
];

export default function AccountForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    balance: "",
    bankName: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.balance) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isNaN(Number(form.balance)) || Number(form.balance) < 0) {
      setError("Please enter a valid balance.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/accounts", {
        ...form,
        balance: parseFloat(form.balance),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add account.");
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
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
            }}
          >
            <Plus size={14} style={{ color: "#10b981" }} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            New Bank Account
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
        {/* Account Name + Bank */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Account Name *</label>
            <div className="relative">
              <Building2
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                className="input pl-9"
                placeholder="e.g. Main Checking"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Bank Name</label>
            <div className="relative">
              <CreditCard
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
                <option value="">Select bank</option>
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

        {/* Account Type + Balance */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Account Type *</label>
            <select
              className="input cursor-pointer appearance-none"
              value={form.type}
              onChange={(e) => set("type", e.target.value)}
              required
              style={{ backgroundImage: "none" }}
            >
              <option value="" disabled>
                Select type
              </option>
              {ACCOUNT_TYPES.map((t) => (
                <option
                  key={t}
                  value={t}
                  style={{ background: "var(--bg-card-alt)" }}
                >
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Current Balance *</label>
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
                min="0"
                step="0.01"
                value={form.balance}
                onChange={(e) => set("balance", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 h-10 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              boxShadow: loading ? "none" : "0 0 16px rgba(16,185,129,0.25)",
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
                Add Account
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