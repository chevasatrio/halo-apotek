import { NavLink } from "react-router-dom";

function Sidebar() {
  const linkClass = ({ isActive }) =>
    "sidebar-link" + (isActive ? " sidebar-link-active" : "");

  return (
    <aside className="sidebar">
      {/* LOGO */}
      <div className="sidebar-logo">
        <span className="logo-dot" />
        <span>Halo Apotek</span>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>
          Dashboard
        </NavLink>

        <NavLink to="/dashboard/obat" className={linkClass}>
          Data Obat
        </NavLink>

        <NavLink to="/dashboard/transaksi" className={linkClass}>
          Transaksi
        </NavLink>

        <NavLink to="/dashboard/driver" className={linkClass}>
          Driver
        </NavLink>

        <NavLink to="/dashboard/pegawai" className={linkClass}>
          Data Pegawai
        </NavLink>

        {/* nanti kalau ada:
            - Laporan
            - Setting
            - dsb
            tinggal tambah di sini
        */}
      </nav>
    </aside>
  );
}

export default Sidebar;
