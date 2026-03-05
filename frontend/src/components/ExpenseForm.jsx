import { useState } from "react";
import { Plus, X, DollarSign, Tag, FileText, Loader2 } from "lucide-react";
import api from "../api/axios";

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

export default function ExpenseForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    title: "",
    amount: "",
    category: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount || !form.category) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.post("/api/expenses", {
        ...form,
        amount: parseFloat(form.amount),
      });
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add expense.");
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
            <Plus size={14} style={{ color: "var(--accent)" }} strokeWidth={2.5} />
          </div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">
            New Expense
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
        {/* Title + Amount row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Title *</label>
            <div className="relative">
              <FileText
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                className="input pl-9"
                placeholder="e.g. Grocery run"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Amount *</label>
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
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <div className="relative">
            <Tag
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10"
              style={{ color: "var(--text-muted)" }}
            />
            <select
              className="input pl-9 cursor-pointer appearance-none"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              required
              style={{ backgroundImage: "none" }}
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option
                  key={c}
                  value={c}
                  style={{ background: "var(--bg-card-alt)" }}
                >
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label">
            Description{" "}
            <span style={{ color: "var(--text-muted)" }}>(optional)</span>
          </label>
          <textarea
            className="input resize-none"
            rows={2}
            placeholder="Add a note…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 h-10 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Plus size={14} strokeWidth={2.5} />
                Add Expense
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