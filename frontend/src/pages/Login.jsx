import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // HARUS sama seperti Postman
      const { data } = await api.post("/login", {
        email: form.email,
        password: form.password,
      });

      // expected: { message, token, user: { name, role, ... } }
      if (!data.token || !data.user) {
        throw new Error("Format respons login tidak sesuai.");
      }

      // Batasi dulu hanya ADMIN yang boleh masuk
      if (data.user.role !== "admin") {
        setError("Hanya pengguna dengan role ADMIN yang dapat masuk.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user_name", data.user.name);
      localStorage.setItem("user_role", data.user.role);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);

      if (err.response) {
        // error dari backend (401, 422, dll)
        setError(
          err.response.data?.message ||
            "Login gagal, periksa email dan password."
        );
      } else {
        // error jaringan / CORS
        setError("Tidak dapat terhubung ke server. Cek API & CORS.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Masuk sebagai Admin</h2>
        <p className="auth-subtitle">
          Gunakan akun admin untuk mengelola sistem Halo Apotek.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="admin@halo.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Kata Sandi</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="password"
              required
            />
          </div>

          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="auth-footer">
          Akun default admin (untuk testing):<br />
          <b>admin@halo.com / password</b>
        </p>
      </div>
    </div>
  );
}

export default Login;
