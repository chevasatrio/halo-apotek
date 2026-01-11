const SERVICES = [
  {
    icon: "🧾",
    title: "Tebus Resep Dokter",
    desc: "Upload resep, apoteker akan memverifikasi dan menyiapkan obat sesuai anjuran dokter.",
  },
  {
    icon: "🚴‍♂️",
    title: "Pengantaran Cepat",
    desc: "Kurir terlatih mengantar obat langsung ke alamatmu dengan aman dan rapi.",
  },
  {
    icon: "💊",
    title: "Obat Bebas & Vitamin",
    desc: "Lengkapi kebutuhan obat bebas, suplemen, dan vitamin harian dalam satu tempat.",
  },
  {
    icon: "⏰",
    title: "Pengingat Minum Obat",
    desc: "Bantu kamu minum obat tepat waktu melalui pengingat terjadwal.",
  },
];

export default function Services() {
  return (
    <section className="py-16 bg-blue-50/70 border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Explore Our Services
          </h2>
          <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
            Tidak hanya menjual obat, Halo-Apotek hadir sebagai partner
            kesehatan harianmu dengan layanan yang saling terintegrasi.
          </p>
        </div>

        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-5 text-center flex flex-col items-center"
            >
              <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl mb-3">
                {s.icon}
              </div>
              <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                {s.title}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-2">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
