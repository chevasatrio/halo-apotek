const TEAM = [
  {
    name: "Apt. Sinta Dewi, S.Farm",
    role: "Apoteker Penanggung Jawab",
    exp: "5+ tahun pengalaman praktik di apotek & klinik",
    focus: "Konsultasi obat kronis & komorbid",
    img: "https://cdn-icons-png.flaticon.com/512/706/706830.png",
  },
  {
    name: "Apt. Raka Pradana, S.Farm",
    role: "Apoteker Konsultan",
    exp: "Spesialis edukasi obat harian & vitamin",
    focus: "Manajemen obat harian & suplemen",
    img: "https://cdn-icons-png.flaticon.com/512/706/706816.png",
  },
];

export default function MeetPharmacist() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* heading */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Meet Our Apoteker
          </h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Konsultasi di Halo-Apotek dijalankan oleh apoteker berlisensi yang
            siap membantu menjawab pertanyaan seputar obat dan penggunaannya.
          </p>
        </div>

        {/* cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {TEAM.map((p, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-sky-50 to-emerald-50 border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow">
                  <img
                    src={p.img}
                    alt={p.name}
                    className="w-12 h-12 object-contain"
                  />
                </div>

                <div>
                  <h3 className="font-semibold text-slate-900 text-base">
                    {p.name}
                  </h3>
                  <p className="text-sky-700 text-xs font-medium mt-1">
                    {p.role}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">{p.exp}</p>
                </div>
              </div>

              <p className="text-slate-500 text-xs mt-4">
                Fokus: <span className="font-medium">{p.focus}</span>
              </p>

              <button className="mt-5 w-full bg-emerald-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition">
                Konsultasi dengan {p.name.split(" ")[1]}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
