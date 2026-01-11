import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import Toast from "../components/Toast";

function inferCategory(name = "") {
  const n = name.toLowerCase();

  if (
    n.includes("cillin") ||
    n.includes("mycin") ||
    n.includes("floxacin") ||
    n.includes("cef") ||
    n.includes("amoxic") ||
    n.includes("cipro")
  ) {
    return "Antibiotik*";
  }

  if (
    n.includes("paracetamol") ||
    n.includes("acetamin") ||
    n.includes("ibuprofen") ||
    n.includes("asam mefenamat") ||
    n.includes("mefenamat") ||
    n.includes("naproxen") ||
    n.includes("diclofenac") ||
    n.includes("ketorolac")
  ) {
    return "Demam & Nyeri";
  }

  if (
    n.includes("batuk") ||
    n.includes("flu") ||
    n.includes("pilek") ||
    n.includes("sirup") ||
    n.includes("obh") ||
    n.includes("dekongestan") ||
    n.includes("decongest") ||
    n.includes("dextromethorphan") ||
    n.includes("guaifenesin") ||
    n.includes("chlorpheniramine") ||
    n.includes("ctm")
  ) {
    return "Batuk & Flu";
  }

  if (
    n.includes("vitamin") ||
    n.includes("suplemen") ||
    n.includes("multivit") ||
    n.includes("zinc") ||
    n.includes("omega") ||
    n.includes("imun") ||
    n.includes("vit c") ||
    n.includes("vitamin c")
  ) {
    return "Vitamin & Suplemen";
  }

  return "Lainnya";
}

function inferRequiresPrescription(category) {
  return category === "Antibiotik*";
}

export default function BuyerObatPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [search, setSearch] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // toast state
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  // disable button while adding item
  const [addingId, setAddingId] = useState(null);

  // ====== HYDRATE SEARCH FROM URL (?q=...) ======
  useEffect(() => {
    const q = (searchParams.get("q") || "").trim();
    // hanya set kalau berbeda agar tidak loop
    if (q !== search) setSearch(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ====== KEEP URL IN SYNC WHEN USER TYPES ======
  useEffect(() => {
    const q = search.trim();
    const current = (searchParams.get("q") || "").trim();

    // hanya update kalau berbeda
    if (q === current) return;

    // kalau kosong, hapus param q
    if (!q) {
      const next = new URLSearchParams(searchParams);
      next.delete("q");
      setSearchParams(next, { replace: true });
      return;
    }

    // set param q
    const next = new URLSearchParams(searchParams);
    next.set("q", q);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.get("/products");
        if (!Array.isArray(data)) throw new Error("Format data products tidak valid.");

        const normalized = data.map((p) => {
          const category = inferCategory(p.name);
          return {
            id: p.id,
            name: p.name,
            category,
            price: Number(p.price || 0),
            stock: Number(p.stock || 0),
            image: p.image || null,
            requiresPrescription: inferRequiresPrescription(category),
            rating: 4.6,
          };
        });

        if (mounted) setProducts(normalized);
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Gagal mengambil data obat dari server. Pastikan backend berjalan."
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    const ordered = ["Demam & Nyeri", "Vitamin & Suplemen", "Batuk & Flu", "Antibiotik*", "Lainnya"];
    const existingOrdered = ordered.filter((c) => set.has(c));
    return ["Semua", ...existingOrdered];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchCategory = activeCategory === "Semua" || p.category === activeCategory;
      const matchSearch = p.name.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }, [products, activeCategory, search]);

  const showToast = (type, message) => {
    setToast({ open: true, type, message });
  };

  // ====== ADD TO CART (POST /cart) ======
  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    const role = (localStorage.getItem("user_role") || "").toLowerCase();

    if (!token) {
      showToast("error", "Silakan login dulu untuk menambahkan ke keranjang.");
      return;
    }
    if (role && role !== "pembeli") {
      showToast("error", "Keranjang hanya untuk akun pembeli.");
      return;
    }
    if (product.stock <= 0) return;

    setAddingId(product.id);
    try {
      await api.post("/cart", { product_id: product.id, quantity: 1 });
      showToast("success", `"${product.name}" ditambahkan ke keranjang.`);
    } catch (err) {
      console.error(err);
      showToast("error", err.response?.data?.message || "Gagal menambahkan ke keranjang.");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="landing-wrapper min-h-screen">
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      />

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

            <div className="bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm px-4 py-3 text-xs md:text-sm max-w-xs">
              <p className="font-semibold text-slate-900">Obat dengan tanda * butuh resep</p>
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
              <div className="flex-1 flex items-center gap-2">
                <input
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  placeholder="Cari nama obat..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
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

          {loading && <p className="text-sm text-slate-500 mb-4">Memuat data obat...</p>}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
              {error}
            </div>
          )}

          {/* grid obat */}
          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-6">
            {!loading && filteredProducts.length === 0 && (
              <p className="text-sm text-slate-500 col-span-full">
                Tidak ada obat yang cocok dengan pencarian/kategori.
              </p>
            )}

            {filteredProducts.map((p) => {
              const outOfStock = p.stock <= 0;
              const isAdding = addingId === p.id;

              return (
                <article
                  key={p.id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 p-4 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex px-2 py-1 text-[11px] rounded-full bg-sky-50 text-sky-700">
                      {p.category}
                    </span>
                    <span className="text-[11px] text-amber-500">⭐ {p.rating}</span>
                  </div>

                  <h2 className="font-semibold text-sm md:text-base text-slate-900">
                    {p.name}
                  </h2>

                  <div className="min-h-[32px] mt-1">
                    {p.requiresPrescription ? (
                      <p className="text-[11px] text-rose-500">
                        *Memerlukan resep & konsultasi apoteker.
                      </p>
                    ) : null}
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Stok:{" "}
                    <span
                      className={`font-medium ${outOfStock ? "text-rose-500" : "text-slate-600"}`}
                    >
                      {p.stock}
                    </span>
                  </p>

                  <p className="text-sky-700 font-bold mt-1 text-sm">
                    Rp {p.price.toLocaleString("id-ID")}
                  </p>

                  <div className="mt-auto pt-4">
                    <button
                      className={`w-full py-2 rounded-xl text-sm font-medium transition ${
                        outOfStock || isAdding
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-sky-600 text-white hover:bg-sky-700"
                      }`}
                      disabled={outOfStock || isAdding}
                      onClick={() => addToCart(p)}
                    >
                      {outOfStock
                        ? "Stok Habis"
                        : isAdding
                        ? "Menambahkan..."
                        : "Tambah ke Keranjang"}
                    </button>
                  </div>
                </article>
              );
            })}
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
