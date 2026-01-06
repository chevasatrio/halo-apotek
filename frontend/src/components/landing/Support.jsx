const FAQ = [
  {
    q: "Bagaimana cara memesan obat?",
    a: "Cari obat di katalog, tambahkan ke keranjang, lalu ikuti proses checkout hingga pembayaran selesai.",
  },
  {
    q: "Apakah obat yang dijual asli?",
    a: "Semua produk berasal dari distributor resmi dan diawasi oleh apoteker berlisensi.",
  },
  {
    q: "Bisakah konsultasi dulu sebelum membeli?",
    a: "Bisa, kamu dapat memulai konsultasi singkat dengan apoteker sebelum memutuskan memesan obat.",
  },
];

export default function Support() {
  return (
    <section className="py-16 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Butuh Bantuan?
          </h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Tim support dan apoteker Halo-Apotek siap membantu jika kamu
            mengalami kendala saat memesan atau butuh penjelasan obat.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* FAQ */}
          <div>
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="mb-4 pb-4 border-b border-slate-100 last:border-b-0 last:pb-0"
              >
                <h4 className="font-semibold text-slate-900 text-sm md:text-base">
                  {item.q}
                </h4>
                <p className="text-slate-500 text-xs md:text-sm mt-1">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* Contact card */}
          <div className="bg-gradient-to-br from-sky-600 to-emerald-500 text-white rounded-3xl p-6 shadow-lg flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Hubungi Support Halo-Apotek
              </h3>
              <p className="text-sky-100 text-sm mt-2">
                Ada masalah dengan pesanan, resep, atau pembayaran? Tim kami
                siap membantu kamu.
              </p>
            </div>

            <div className="mt-4 space-y-2">
              <button className="w-full bg-white text-sky-700 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 transition">
                Chat via WhatsApp
              </button>
              <button className="w-full bg-transparent border border-white/70 py-2 rounded-xl text-sm font-medium hover:bg-white/10 transition">
                Kirim Email ke Support
              </button>
            </div>

            <p className="text-[11px] text-sky-100 mt-3">
              Waktu layanan: 08.00–21.00 WIB, setiap hari.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
