import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell-main">
        <Navbar />
        <main className="app-shell-content">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
