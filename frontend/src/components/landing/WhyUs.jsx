const FEATURES = [
    {
        icon: "🚚",
        title: "Pengantaran Cepat",
        desc: "Pesanan diantar langsung ke rumah dengan tracking real-time.",
    },
    {
        icon: "💊",
        title: "Obat Resmi & Aman",
        desc: "Produk bersertifikat & dikelola oleh apoteker berpengalaman.",
    },
    {
        icon: "💬",
        title: "Konsultasi Apoteker",
        desc: "Tanya dosis, interaksi obat, dan penggunaan dengan aman.",
    },
    {
        icon: "🕒",
        title: "Layanan Fleksibel",
        desc: "Pesan kapan saja tanpa harus antre di apotek.",
    },
];

export default function WhyUs() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-6xl mx-auto px-6">
                {/* title */}
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                        Kenapa Memilih Halo-Apotek?
                    </h2>
                    <p className="text-slate-500 mt-3 max-w-2xl mx-auto text-sm md:text-base">
                        Dibangun untuk memudahkan kamu mengakses obat,
                        konsultasi, dan layanan kesehatan tanpa ribet.
                    </p>
                </div>

                {/* cards */}
                <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
                    {FEATURES.map((f, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-5 flex flex-col items-center text-center"
                        >
                            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl mb-3">
                                {f.icon}
                            </div>
                            <h3 className="font-semibold text-slate-900 text-sm md:text-base">
                                {f.title}
                            </h3>
                            <p className="text-slate-500 text-xs md:text-sm mt-2">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
