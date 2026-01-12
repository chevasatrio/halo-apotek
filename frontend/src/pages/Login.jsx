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

    // --- CEK STATUS LOGIN ---
    if (token && user?.role) {
        const role = user.role.toLowerCase();
        if (role === "pembeli") return <Navigate to="/pembeli" replace />;
        if (role === "driver")
            return <Navigate to="/dashboard/driver" replace />;
        return <Navigate to="/dashboard" replace />;
    }

    const handleChange = (e) =>
        setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data } = await api.post("/login", form);

            if (!data?.token || !data?.user) {
                throw new Error("Format respons login tidak sesuai.");
            }

            login({ token: data.token, user: data.user });

            let finalUser = data.user;
            if (!finalUser?.role) {
                const me = await api.get("/user");
                finalUser = me.data;
                login({ token: data.token, user: finalUser });
            }

            const role = (finalUser.role || "").toLowerCase();

            if (role === "pembeli") {
                navigate("/pembeli", { replace: true });
            } else if (role === "driver") {
                navigate("/dashboard/driver", { replace: true });
            } else if (role === "admin" || role === "kasir") {
                navigate("/dashboard", { replace: true });
            } else {
                setError("Role akun tidak dikenali.");
            }
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
        // BACKGROUND: Tema Biru Langit & Biru Laut (Tanpa Hijau)
        <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100">
            {/* ANIMASI BACKGROUND (Blobs Biru) */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
            <div
                className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
                style={{ animationDelay: "2s" }}
            ></div>
            <div
                className="absolute bottom-0 left-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"
                style={{ animationDelay: "4s" }}
            ></div>

            {/* KARTU LOGIN */}
            <div className="relative z-10 max-w-md w-full bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-8">
                {/* LOGO APOTEK (ULAR & GELAS) - VERSI LEBIH JELAS */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-50 text-blue-600 mb-4 shadow-sm p-4 ring-1 ring-blue-100">
                        {/* SVG: Bowl of Hygieia (Simbol Farmasi Standar) */}
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full h-full"
                        >
                            <path
                                d="M16 3H8V5H16V3Z"
                                fill="currentColor"
                                opacity="0.8"
                            />
                            <path
                                d="M17 19C17 20.6569 15.6569 22 14 22H10C8.34315 22 7 20.6569 7 19V17H17V19Z"
                                fill="currentColor"
                            />
                            <path
                                d="M6 7H18V15C18 15.756 17.796 16.463 17.437 17.079C16.892 16.402 16.035 15.932 15.06 15.753C15.42 15.242 15.67 14.652 15.79 14.02C15.95 13.18 15.82 12.33 15.42 11.58C14.73 10.28 13.23 9.68 11.9 10.05C11.69 10.11 11.49 10.19 11.29 10.29C11.16 9.87 10.97 9.47 10.72 9.11C9.88 7.9 8.35 7.42 6.96 7.92C6.35 8.14 6 8.7 6 9.35V7Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12.94 11.33C13.21 11.25 13.48 11.23 13.73 11.28C14.49 11.42 14.93 12.11 14.79 12.87C14.72 13.23 14.52 13.55 14.23 13.79C14.24 13.86 14.25 13.93 14.25 14C14.25 15.24 13.24 16.25 12 16.25C10.76 16.25 9.75 15.24 9.75 14C9.75 13.2 10.17 12.49 10.8 12.1C10.87 12.22 10.95 12.33 11.04 12.44C11.45 12.92 12.03 13.2 12.65 13.23C13.28 13.25 13.88 12.99 14.29 12.53C14.33 12.48 14.37 12.44 14.41 12.39C14.44 12.24 14.44 12.08 14.41 11.92C14.33 11.51 13.93 11.24 13.52 11.32C13.11 11.4 12.84 11.8 12.92 12.21C12.94 12.32 13 12.42 13.08 12.5C12.96 12.58 12.82 12.64 12.67 12.64C12.42 12.63 12.19 12.52 12.02 12.32C11.85 12.12 11.78 11.87 11.81 11.62C11.9 11.13 12.38 10.8 12.87 10.89C12.89 10.9 12.92 10.9 12.94 10.91V11.33Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                        Halo-Apotek
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">
                        Platform Kesehatan & Farmasi Terpercaya
                    </p>
                </div>

                {error && (
                    <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                        <svg
                            className="w-5 h-5 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                            placeholder="nama@email.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-medium text-slate-700">
                                Kata Sandi
                            </label>
                        </div>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                        />
                    </div>

                    <button
                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white font-bold tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] flex justify-center items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    ></circle>
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Memproses...</span>
                            </>
                        ) : (
                            "Masuk Sekarang"
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-500">
                        Belum punya akun?{" "}
                        <a
                            className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors"
                            href="/register"
                        >
                            Daftar Gratis
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
