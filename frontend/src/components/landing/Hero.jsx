import { useState } from "react";

function IconCart() {
  return (
    <svg
      className="w-4 h-4 text-slate-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.5 14h12L22 6H6" />
    </svg>
  );
}

function IconChat() {
  return (
    <svg
      className="w-4 h-4 text-slate-700"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a7.5 7.5 0 0 1-10.9 6.7L5 19l.8-4A7.5 7.5 0 1 1 21 11.5z" />
      <path d="M8 11h5" />
      <path d="M8 8h8" />
    </svg>
  );
}

export default function Hero() {
  const [search, setSearch] = useState("");

  // dummy sementara
  const cartCount = 2;
  const unreadChat = 1;
  const userName = "Naufal";

  return (
    <section className="relative overflow-hidden">
      {/* background gradient ala Medilo */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-100" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* ===== TOP BAR (FULL WIDTH) ===== */}
        <div className="flex items-center justify-between mb-8">
          {/* badge kiri */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Apotek Online & Delivery Cepat
          </div>

          {/* ikon kanan + avatar */}
          <div className="flex items-center gap-2">
            {/* CART */}
            <button className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-sky-50 transition">
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* CHAT */}
            <button className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-sky-50 transition">
              <IconChat />
              {unreadChat > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center px-1">
                  {unreadChat}
                </span>
              )}
            </button>

            {/* AVATAR + NAMA */}
            <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-slate-200 rounded-full px-3 py-1 shadow-sm">
              <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-[11px] font-semibold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-slate-700">
                Halo,&nbsp;
                <span className="font-semibold">{userName}</span>
              </span>
            </div>
          </div>
        </div>

        {/* ===== HERO CONTENT: GRID 2 KOLOM ===== */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* LEFT TEXT */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
              Halo-Apotek — Obat Resmi, Aman, & Sampai ke Rumah
            </h1>

            <p className="mt-4 text-slate-600 text-sm md:text-base">
              Pesan obat tanpa antre, konsultasi dengan apoteker, dan lacak
              pesanan kamu secara real-time langsung dari satu aplikasi.
            </p>

            {/* search bar */}
            <div className="mt-6 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm flex items-center p-2">
              <input
                className="flex-1 px-3 py-2 outline-none text-sm md:text-base bg-transparent"
                placeholder="Cari obat atau vitamin..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition">
                Cari
              </button>
            </div>

            {/* CTA */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-5 py-3 rounded-xl bg-sky-600 text-white text-sm md:text-base font-semibold hover:bg-sky-700 transition">
                Pesan Sekarang
              </button>
              <button className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-sm md:text-base hover:bg-slate-50 transition">
                Konsultasi Apoteker
              </button>
            </div>

            {/* mini trust row */}
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>✓ Obat resmi & bersertifikat</span>
              <span>✓ Pengiriman 1–3 jam area tertentu</span>
            </div>
          </div>

          {/* RIGHT CARD */}
          <div className="flex justify-center md:justify-end">
            <div className="relative">
              <div className="w-72 md:w-80 h-52 md:h-64 rounded-3xl bg-white shadow-xl border border-slate-100 p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-500">Pesanan Aktif</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">
                    Paket obat sedang diantar
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div>
                    <p className="text-[11px]">Estimasi tiba</p>
                    <p className="font-semibold text-slate-800">30–45 menit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px]">Kurir</p>
                    <p className="font-semibold text-slate-800">
                      Rendi • HLO-092
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl shadow-md border border-slate-100 px-4 py-2 text-xs">
                ⭐ 4.8 / 5 dari 2.300+ pesanan
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
