import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../Context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login, token, user } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===============================
  // GUARD: kalau sudah login, redirect sesuai role
  // ===============================
  if (token && user?.role) {
    const role = String(user.role).toLowerCase().trim();

    if (role === "pembeli") return <Navigate to="/pembeli" replace />;
    if (role === "driver") return <Navigate to="/dashboard/driver" replace />;
    if (role === "kasir") return <Navigate to="/dashboard/transaksi" replace />;
    if (role === "admin") return <Navigate to="/dashboard" replace />;

    return <Navigate to="/unauthorized" replace />;
  }

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1️⃣ Login
      const { data } = await api.post("/login", form);

      if (!data?.token || !data?.user) {
        throw new Error("Format respons login tidak valid.");
      }

      // 2️⃣ Simpan token + user awal
      login({ token: data.token, user: data.user });

      // 3️⃣ Pastikan role ada (fallback ke /user jika perlu)
      let finalUser = data.user;
      if (!finalUser?.role) {
        const me = await api.get("/user");
        finalUser = me.data;
        login({ token: data.token, user: finalUser });
      }

      // 4️⃣ Redirect sesuai role (FINAL)
      const role = String(finalUser?.role || "").toLowerCase().trim();

      if (role === "pembeli") navigate("/pembeli", { replace: true });
      else if (role === "driver") navigate("/dashboard/driver", { replace: true });
      else if (role === "kasir") navigate("/dashboard/transaksi", { replace: true });
      else if (role === "admin") navigate("/dashboard", { replace: true });
      else navigate("/unauthorized", { replace: true });

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Login gagal. Periksa email dan kata sandi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-800">
            Masuk ke Halo-Apotek
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Akses akun Anda untuk memesan obat atau mengelola sistem.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-sky-300 outline-none"
              placeholder="nama@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">
              Kata Sandi
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-sky-300 outline-none"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            className="w-full py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition shadow disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <p className="mt-5 text-xs text-gray-500 text-center">
          Belum punya akun?{" "}
          <a
            className="text-sky-700 font-medium hover:underline"
            href="/register"
          >
            Daftar
          </a>
        </p>

        <p className="mt-2 text-xs text-gray-500 text-center">
          Dengan masuk, Anda menyetujui kebijakan layanan Halo-Apotek.
        </p>
      </div>
    </div>
  );
}

export default Login;
