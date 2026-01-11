const PRODUCTS = [
    {
        id: 1,
        name: "Paracetamol 500mg",
        category: "Demam & Nyeri",
        price: 12000,
        rating: 4.8,
        img: "https://cdn-icons-png.flaticon.com/512/2965/2965567.png",
    },
    {
        id: 2,
        name: "Vitamin C 1000mg",
        category: "Vitamin & Suplemen",
        price: 28000,
        rating: 4.6,
        img: "https://cdn-icons-png.flaticon.com/512/1533/1533913.png",
    },
    {
        id: 3,
        name: "OBH Batuk Sirup",
        category: "Batuk & Flu",
        price: 18000,
        rating: 4.7,
        img: "https://cdn-icons-png.flaticon.com/512/4320/4320337.png",
    },
    {
        id: 4,
        name: "Amoxicillin 500mg",
        category: "Antibiotik*",
        price: 15000,
        rating: 4.5,
        img: "https://cdn-icons-png.flaticon.com/512/2965/2965573.png",
    },
];

export default function FeaturedProducts() {
    return (
        <section className="py-16 bg-gradient-to-b from-white to-sky-50/60 border-t border-slate-100">
            <div className="max-w-6xl mx-auto px-6">
                {/* heading */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                            Katalog Obat Pilihan
                        </h2>
                        <p className="text-slate-500 mt-2 text-sm md:text-base max-w-xl">
                            Contoh produk yang tersedia di Halo-Apotek. Nanti
                            akan terhubung langsung ke data obat di sistem kamu.
                        </p>
                    </div>
                    <button className="text-sm font-medium text-sky-700 hover:text-sky-800">
                        Lihat semua obat →
                    </button>
                </div>

                {/* grid produk */}
                <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
                    {PRODUCTS.map((p) => (
                        <article
                            key={p.id}
                            className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="inline-flex px-2 py-1 text-[11px] rounded-full bg-sky-50 text-sky-700">
                                    {p.category}
                                </span>
                                <span className="text-[11px] text-amber-500">
                                    ⭐ {p.rating}
                                </span>
                            </div>

                            <div className="flex justify-center mb-3">
                                <img
                                    src={p.img}
                                    alt={p.name}
                                    className="w-16 h-16 object-contain"
                                />
                            </div>

                            <h3 className="font-semibold text-sm md:text-base text-slate-900 text-center">
                                {p.name}
                            </h3>

                            <p className="text-sky-700 font-bold text-center mt-2 text-sm">
                                Rp {p.price.toLocaleString()}
                            </p>

                            <button className="mt-4 w-full bg-sky-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-sky-700 transition">
                                Tambah ke Keranjang
                            </button>
                        </article>
                    ))}
                </div>

                <p className="mt-4 text-[11px] text-slate-400">
                    *Penggunaan antibiotik memerlukan resep & pengawasan tenaga
                    kesehatan.
                </p>
            </div>
        </section>
    );
}
