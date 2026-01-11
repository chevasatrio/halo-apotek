import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

export default function ProtectedRoute({ role }) {
    const { token, user, booting } = useAuth();
    const location = useLocation();

    // jangan return null, bikin “kedip”/blank. kasih placeholder ringan.
    if (booting) {
        return (
            <div className="min-h-screen bg-sky-50 flex items-center justify-center">
                <div className="text-sm text-slate-500">Memuat...</div>
            </div>
        );
    }

    // belum login
    if (!token) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    // token ada tapi user belum ada (harusnya jarang)
    if (!user) {
        return (
            <Navigate to="/login" replace state={{ from: location.pathname }} />
        );
    }

    // role guard
    if (
        role &&
        String(user.role).toLowerCase() !== String(role).toLowerCase()
    ) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <Outlet />;
}
