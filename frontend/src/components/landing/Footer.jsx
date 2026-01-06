import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h3 className="text-xl font-bold">Halo-Apotek</h3>
          <p className="text-sm text-slate-400 mt-2">
            Layanan apotek online & delivery yang membantu kamu mendapatkan
            obat dengan aman, cepat, dan nyaman dari rumah.
          </p>
        </div>

        {/* Info kecil + login note */}
        <div>
          <h4 className="font-semibold text-sm mb-2">
            Info Pengguna
          </h4>
          <p className="text-sm text-slate-400">
            Untuk memesan obat, menyimpan keranjang, dan melacak status
            pengiriman, kamu perlu masuk ke akun Halo-Apotek.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
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
          </div>
        </div>

        {/* Small links */}
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
