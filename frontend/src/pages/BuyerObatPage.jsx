import { useState, useMemo } from "react";

const CATEGORIES = [
  "Semua",
  "Demam & Nyeri",
  "Vitamin & Suplemen",
  "Batuk & Flu",
  "Antibiotik*",
];

const PRODUCTS = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    category: "Demam & Nyeri",
    price: 12000,
    rating: 4.8,
    requiresPrescription: false,
  },
  {
    id: 2,
    name: "Ibuprofen 200mg",
    category: "Demam & Nyeri",
    price: 18000,
    rating: 4.5,
    requiresPrescription: false,
  },
  {
    id: 3,
    name: "Vitamin C 1000mg",
    category: "Vitamin & Suplemen",
    price: 28000,
    rating: 4.6,
    requiresPrescription: false,
  },
  {
    id: 4,
    name: "Multivitamin Harian",
    category: "Vitamin & Suplemen",
    price: 35000,
    rating: 4.7,
    requiresPrescription: false,
  },
  {
    id: 5,
    name: "OBH Batuk Sirup",
    category: "Batuk & Flu",
    price: 18000,
    rating: 4.7,
    requiresPrescription: false,
  },
  {
    id: 6,
    name: "Dekongestan Hidung",
    category: "Batuk & Flu",
    price: 22000,
    rating: 4.4,
    requiresPrescription: false,
  },
  {
    id: 7,
    name: "Amoxicillin 500mg",
    category: "Antibiotik*",
    price: 15000,
    rating: 4.5,
    requiresPrescription: true,
  },
  {
    id: 8,
    name: "Ciprofloxacin 500mg",
    category: "Antibiotik*",
    price: 28000,
    rating: 4.3,
    requiresPrescription: true,
  },
];

export default function BuyerObatPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const matchCategory =
        activeCategory === "Semua" || p.category === activeCategory;
      const matchSearch = p.name
        .toLowerCase()
        .includes(search.toLowerCase().trim());
      return matchCategory && matchSearch;
    });
  }, [activeCategory, search]);

  return (
    <div className="landing-wrapper min-h-screen">
      <section className="py-16 bg-gradient-to-br from-sky-50 via-white to-sky-100">
        <div className="max-w-6xl mx-auto px-6">
          {/* header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Katalog Obat Halo-Apotek
              </h1>
              <p className="text-slate-500 mt-2 text-sm md:text-base max-w-xl">
                Jelajahi daftar obat yang lebih lengkap. Gunakan pencarian dan
                filter kategori untuk menemukan obat yang kamu butuhkan.
              </p>
            </div>

            {/* upload resep card (kecil di header) */}
            <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm px-4 py-3 text-xs md:text-sm max-w-xs">
              <p className="font-semibold text-slate-900">
                Obat dengan tanda * butuh resep
              </p>
              <p className="text-slate-500 mt-1">
                Upload resep dokter kamu untuk memesan antibiotik dan obat
                yang membutuhkan pengawasan.
              </p>
              <label className="mt-3 inline-flex items-center justify-center w-full px-3 py-2 rounded-xl bg-sky-600 text-white font-medium cursor-pointer hover:bg-sky-700 transition">
                Upload Resep
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>

          {/* search + kategori */}
          <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              {/* search bar */}
              <div className="flex-1 flex items-center gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="Cari nama obat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* kategori pill */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs md:text-sm border transition ${
                      activeCategory === cat
                        ? "bg-sky-600 text-white border-sky-600"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-sky-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* grid obat */}
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
            {filteredProducts.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full">
                Tidak ada obat yang cocok dengan pencarian/kategori.
              </p>
            )}

            {filteredProducts.map((p) => (
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

                <h2 className="font-semibold text-sm md:text-base text-slate-900">
                  {p.name}
                </h2>

                {p.requiresPrescription && (
                  <p className="text-[11px] text-rose-500 mt-1">
                    *Memerlukan resep & konsultasi apoteker.
                  </p>
                )}

                <p className="text-sky-700 font-bold mt-3 text-sm">
                  Rp {p.price.toLocaleString()}
                </p>

                <button className="mt-4 w-full bg-sky-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-sky-700 transition">
                  Tambah ke Keranjang
                </button>
              </article>
            ))}
          </div>

          <p className="mt-4 text-[11px] text-slate-400">
            *Penggunaan antibiotik dan obat tertentu harus mengikuti anjuran
            dokter dan pengawasan tenaga kesehatan.
          </p>
        </div>
      </section>
    </div>
  );
}
