import { Outlet, NavLink, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function DashboardLayout() {
  const { token, user, logout, booting } = useAuth();
  const location = useLocation();

  // tunggu booting (fetch /api/user) selesai
  if (booting) return null;

  // kalau belum login, lempar ke login
  if (!token || !user) return <Navigate to="/login" replace />;

  // optional: dashboard hanya untuk admin
  if (user.role !== "admin") return <Navigate to="/unauthorized" replace />;

  const menus = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Data Obat", to: "/dashboard/obat" },
    { label: "Transaksi", to: "/dashboard/transaksi" },
    { label: "Pengguna", to: "/dashboard/pegawai" },
  ];

  const pageTitle =
    menus.find((m) => location.pathname.startsWith(m.to))?.label || "Dashboard";

  const name = user?.name || "User";

  return (
    <div className="min-h-screen bg-slate-100 flex text-slate-700">
      {/* SIDEBAR */}
      <aside className="w-68 bg-white border-r shadow-sm hidden md:flex flex-col">
        {/* BRAND */}
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-semibold text-sky-700">Halo-Apotek</h1>
          <p className="text-xs text-gray-400 mt-1">
            Dashboard — {(user.role || "").toUpperCase()}
          </p>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-3 py-4 space-y-1 text-sm">
          {menus.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-2 rounded-lg transition
                ${
                  isActive
                    ? "bg-sky-100 text-sky-700 font-medium border border-sky-200"
                    : "hover:bg-slate-50 hover:text-sky-700"
                }`
              }
            >
              {m.label}
            </NavLink>
          ))}
        </nav>

        {/* FOOTER / LOGOUT */}
        <div className="px-4 py-4 border-t bg-slate-50">
          <button
            className="w-full px-4 py-2 rounded-lg border text-sm hover:bg-slate-100 transition"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col">
        {/* HEADER */}
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg font-semibold">{pageTitle}</h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Hi, <span className="font-medium">{name}</span>
            </span>

            <img
              src={`https://ui-avatars.com/api/?background=0ea5e9&color=fff&name=${encodeURIComponent(
                name
              )}`}
              className="w-9 h-9 rounded-full border shadow-sm"
              alt="avatar"
            />
          </div>
        </header>

        {/* CONTENT */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
