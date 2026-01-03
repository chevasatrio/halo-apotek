import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-dot" />
        <span>Halo Apotek</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " sidebar-link-active" : "")
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/obat"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " sidebar-link-active" : "")
          }
        >
          Data Obat
        </NavLink>

        {/* kalau nanti ada menu lain, tambah di sini */}
      </nav>
    </aside>
  );
}

export default Sidebar;
