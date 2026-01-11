import { NavLink } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext"; // sesuaikan path bila perlu

const MENU_BY_ROLE = {
  admin: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Data Obat", to: "/dashboard/obat" },
    { label: "Transaksi", to: "/dashboard/transaksi" },
    { label: "Driver", to: "/dashboard/driver" },
    { label: "Data Pegawai", to: "/dashboard/pegawai" },
  ],
  kasir: [{ label: "Transaksi", to: "/dashboard/transaksi" }],
  driver: [{ label: "Driver", to: "/dashboard/driver" }],
};

function Sidebar() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase().trim();
  const menus = MENU_BY_ROLE[role] || [];

  const linkClass = ({ isActive }) =>
    "sidebar-link" + (isActive ? " sidebar-link-active" : "");

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot" />
        <span>Halo Apotek</span>
      </div>

      <nav className="sidebar-nav">
        {menus.map((m) => (
          <NavLink key={m.to} to={m.to} className={linkClass} end={m.to === "/dashboard"}>
            {m.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
