import { useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useAuth } from "../context/authContext";

const PAGE_TITLES = {
  "/dashboard": { title: "Dashboard",    sub: "Your financial overview" },
  "/expenses":  { title: "Expenses",     sub: "Track your spending"     },
  "/accounts":  { title: "Accounts",     sub: "Manage bank accounts"    },
  "/cards":     { title: "Credit Cards", sub: "Manage your cards"       },
  "/budget":    { title: "Budget",       sub: "Monitor your budgets"    },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const page = PAGE_TITLES[pathname] || { title: "FinanceAI", sub: "" };

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric",
  });

  return (
    <header
      className="flex items-center justify-between px-6 lg:px-8 shrink-0"
      style={{
        height: "64px",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        background: "#FFFFFF",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      {/* Left */}
      <div>
        <h1 className="text-base font-semibold text-gray-900 leading-tight">
          {page.title}
        </h1>
        <p className="text-xs" style={{ color: "#6B7280" }}>{page.sub}</p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Date */}
        <span
          className="hidden sm:flex items-center px-3 py-1.5 rounded-lg text-xs font-mono"
          style={{
            background: "#F3F4F6",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "#6B7280",
          }}
        >
          {dateStr}
        </span>

        {/* Bell */}
        <button
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer"
          style={{
            background: "#F9FAFB",
            border: "1px solid rgba(0,0,0,0.08)",
            color: "#6B7280",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(37,99,235,0.3)";
            e.currentTarget.style.color = "#2563EB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
            e.currentTarget.style.color = "#6B7280";
          }}
        >
          <Bell size={15} />
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{
              background: "#2563EB",
              boxShadow: "0 0 4px rgba(37,99,235,0.6)",
            }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-semibold text-white cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
            boxShadow: "0 2px 8px rgba(37,99,235,0.25)",
          }}
        >
          {(user?.name || user?.email || "U")[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
}