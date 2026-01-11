import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await api.post("/register", form);
            navigate("/login");
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                    "Pendaftaran gagal. Cek data kembali."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border p-8">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold text-slate-800">
                        Buat Akun Halo-Apotek
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Akses semua fitur dengan satu akun.
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Nama Lengkap
                        </label>
                        <input
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-300 outline-none"
                            placeholder="Nama pengguna"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-300 outline-none"
                            placeholder="nama@email.com"
                            required
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
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-300 outline-none"
                            placeholder="Minimal 8 karakter"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-600">
                            Konfirmasi Kata Sandi
                        </label>
                        <input
                            type="password"
                            name="password_confirmation"
                            value={form.password_confirmation}
                            onChange={handleChange}
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-300 outline-none"
                            required
                        />
                    </div>

                    <button
                        className="w-full py-2 rounded-lg bg-sky-600 text-white font-medium hover:bg-sky-700 transition shadow"
                        disabled={loading}
                    >
                        {loading ? "Mendaftar..." : "Daftar"}
                    </button>
                </form>

                <p className="mt-5 text-sm text-gray-500 text-center">
                    Sudah punya akun?{" "}
                    <Link to="/login" className="text-sky-600 font-medium">
                        Masuk
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
