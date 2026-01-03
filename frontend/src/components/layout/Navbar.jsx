import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("user_name") || "User";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_name");
    navigate("/login");
  };

  return (
    <header className="navbar">
      <h1 className="navbar-title">Halo Apotek</h1>
      <div className="navbar-right">
        <span className="navbar-user">👤 {userName}</span>
        <button className="btn btn-outline" onClick={handleLogout}>
          Keluar
        </button>
      </div>
    </header>
  );
}

export default Navbar;
