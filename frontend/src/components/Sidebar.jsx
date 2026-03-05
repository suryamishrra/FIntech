import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Receipt, Building2,
  CreditCard, PiggyBank, LogOut,
  ChevronLeft, ChevronRight, Zap,
} from "lucide-react";
import { useAuth } from "../context/authContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/expenses",  icon: Receipt,         label: "Expenses"  },
  { to: "/accounts",  icon: Building2,        label: "Accounts"  },
  { to: "/cards",     icon: CreditCard,       label: "Cards"     },
  { to: "/budget",    icon: PiggyBank,        label: "Budget"    },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="relative flex flex-col shrink-0 h-screen transition-all duration-300 overflow-visible"
      style={{
        width: collapsed ? "72px" : "220px",
        background: "#FFFFFF",
        borderRight: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "2px 0 8px rgba(0,0,0,0.04)",
        zIndex: 40,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5 shrink-0"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
            boxShadow: "0 4px 12px rgba(37,99,235,0.3)",
          }}
        >
          <Zap size={15} color="#ffffff" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <span className="text-sm font-semibold tracking-tight text-gray-900 whitespace-nowrap">
              Finance<span style={{ color: "#2563EB" }}>AI</span>
            </span>
            <p className="text-[10px] tracking-widest uppercase" style={{ color: "#6B7280" }}>
              Dashboard
            </p>
          </div>
        )}
      </div>

      {/* Toggle button — fixed position relative to sidebar edge */}
      <button
        onClick={onToggle}
        className="absolute flex items-center justify-center cursor-pointer transition-all duration-150"
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "#FFFFFF",
          border: "1.5px solid rgba(0,0,0,0.12)",
          color: "#6B7280",
          right: "-11px",
          top: "62px",
          zIndex: 50,
          boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#2563EB";
          e.currentTarget.style.color = "#2563EB";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(0,0,0,0.12)";
          e.currentTarget.style.color = "#6B7280";
        }}
      >
        {collapsed
          ? <ChevronRight size={11} />
          : <ChevronLeft size={11} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto overflow-x-hidden">
        {!collapsed && (
          <p className="section-title px-2 mb-3">Navigation</p>
        )}
        <ul className="flex flex-col gap-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                title={collapsed ? label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm transition-all duration-150 relative ${
                    isActive ? "" : "hover:bg-gray-50"
                  }`
                }
                style={({ isActive }) =>
                  isActive
                    ? {
                        background: "rgba(37,99,235,0.08)",
                        color: "#2563EB",
                        fontWeight: 600,
                      }
                    : { color: "#374151" }
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: "#2563EB" }}
                      />
                    )}
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className="shrink-0"
                    />
                    {!collapsed && (
                      <span className="whitespace-nowrap">{label}</span>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User + Logout */}
      <div
        className="px-2 py-3 shrink-0"
        style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
      >
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 text-white"
              style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)" }}
            >
              {(user.name || user.email || "U")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-gray-800 truncate">
                {user.name || "User"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "#6B7280" }}>
                {user.email}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-2.5 py-2.5 rounded-lg text-sm transition-all duration-150 cursor-pointer bg-transparent"
          style={{ color: "#6B7280" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#EF4444";
            e.currentTarget.style.background = "rgba(239,68,68,0.06)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6B7280";
            e.currentTarget.style.background = "transparent";
          }}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut size={16} strokeWidth={1.8} className="shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}