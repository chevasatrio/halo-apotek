// src/components/ProtectedRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ role, roles }) {
  const { token, user, booting } = useAuth();
  const location = useLocation();

  if (booting) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="text-sm text-slate-500">Memuat...</div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  const userRole = String(user?.role || "").toLowerCase().trim();

  // MULTI ROLE (BARU)
  if (Array.isArray(roles) && roles.length > 0) {
    if (!roles.includes(userRole)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // SINGLE ROLE (LAMA, TETAP AMAN)
  if (role && userRole !== String(role).toLowerCase()) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
