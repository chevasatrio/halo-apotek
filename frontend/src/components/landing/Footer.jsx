import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";

export default function Footer() {
  const navigate = useNavigate();
  const { token, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <footer className="bg-slate-900 text-slate-200 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-3 gap-8">
        {/* BRAND CARD */}
        <div className="relative">
          <div
            className="
            bg-gradient-to-br from-sky-500 to-blue-600
            text-white rounded-3xl shadow-2xl
            p-7 md:-mt-16
          "
          >
            {/* ICON */}
            <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M12 2v20m0-10c-4.5 0-4.5-6 0-6s4.5-6 0-6m0 12c4.5 0 4.5 6 0 6s-4.5 6 0 6" />
              </svg>
            </div>

            <h3 className="text-2xl font-bold mt-4">Halo-Apotek</h3>

            <p className="text-sm text-blue-100 mt-3 leading-relaxed">
              Layanan apotek online & delivery yang membantu kamu mendapatkan
              obat dengan aman, cepat, dan nyaman dari rumah.
            </p>

            {/* OPEN 24 */}
            <div className="mt-5 flex items-start gap-2 text-sm">
              <span className="text-white text-lg">⏰</span>
              <p>
                <span className="font-semibold">Open 24 Jam</span>
                <br />
                Setiap hari tanpa libur.
              </p>
            </div>
          </div>
        </div>

        {/* INFO PENGGUNA */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Info Pengguna</h4>
          <p className="text-sm text-slate-400">
            Untuk memesan obat, menyimpan keranjang, dan melacak status
            pengiriman, kamu perlu masuk ke akun Halo-Apotek.
          </p>

          <div className="mt-4 flex gap-3">
            {!token ? (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl border border-slate-500 text-sm hover:bg-slate-800"
                >
                  Daftar Akun
                </Link>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* LINKS */}
        <div className="text-sm">
          <h4 className="font-semibold mb-2">Lainnya</h4>
          <p className="text-slate-400">
            Kebijakan Privasi • Syarat & Ketentuan • Bantuan Pelanggan
          </p>

          <p className="text-slate-500 mt-4">
            © {new Date().getFullYear()} Halo-Apotek. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
