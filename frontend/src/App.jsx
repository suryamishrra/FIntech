import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import ProtectedRoute from "./routes/protectedRoute";
import DashboardLayout from "./layouts/dashboardLayout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";

// Dashboard pages
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Accounts from "./pages/Accounts";
import Cards from "./pages/Cards";
import Budget from "./pages/Budget";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/cards" element={<Cards />} />
              <Route path="/budget" element={<Budget />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}