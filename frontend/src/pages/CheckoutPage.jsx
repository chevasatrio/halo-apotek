import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function formatRupiah(n) {
  const num = Number(n || 0);
  return "Rp " + num.toLocaleString("id-ID");
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

function normalizeCart(raw) {
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.items)
    ? raw.items
    : [];
  return items;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedIds = useMemo(() => {
    const ids = location.state?.selected_ids || [];
    return Array.isArray(ids) ? ids.map((x) => Number(x)) : [];
  }, [location.state]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState("");
  const [note, setNote] = useState(""); // UI only (tidak dikirim ke DB)

  const { itemCount, subtotal } = useMemo(() => {
    const count = cartItems.reduce((acc, it) => acc + Number(it.quantity || 0), 0);
    const sum = cartItems.reduce((acc, it) => {
      const price = Number(it?.product?.price || 0);
      const qty = Number(it?.quantity || 0);
      return acc + price * qty;
    }, 0);
    return { itemCount: count, subtotal: sum };
  }, [cartItems]);

  useEffect(() => {
    const boot = async () => {
      setError("");
      setLoading(true);

      try {
        // 1) ambil profil user untuk address
        const meRes = await api.get("/user");
        const me = meRes?.data || {};
        setAddress(String(me?.address || "").trim());

        // 2) ambil cart
        const cartRes = await api.get("/cart");
        const all = normalizeCart(cartRes.data);

        // filter berdasarkan selectedIds dari CartPage
        const filtered =
          selectedIds.length > 0
            ? all.filter((x) => selectedIds.includes(Number(x.id)))
            : [];

        setCartItems(filtered);
      } catch (e) {
        console.error(e);
        setError("Gagal memuat data checkout. Silakan coba ulang.");
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, [selectedIds]);

  const handleCheckout = async () => {
    setError("");

    if (!cartItems.length) {
      setError("Tidak ada item yang dipilih untuk checkout.");
      return;
    }

    const addr = String(address || "").trim();
    if (!addr) {
      setError("Alamat pengiriman wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      // Backend kamu checkout memakai CheckoutRequest — biasanya butuh address.
      // selected_ids tetap dikirim (aman), walaupun backend saat ini mungkin abaikan.
      const res = await api.post("/checkout", {
        address: addr,
        selected_ids: selectedIds,
      });

      // Normalisasi response { message, data: TransactionResource }
      const tx = res?.data?.data || res?.data;

      // Simpan agar PaymentPage tetap ada datanya walau refresh
      sessionStorage.setItem("last_transaction", JSON.stringify(tx));

      navigate("/pembeli/payment", { state: { transaction: tx } });
    } catch (e) {
      console.error(e);

      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 422
          ? "Checkout gagal: alamat belum sesuai validasi server."
          : "Checkout gagal. Silakan coba ulang.");

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Checkout
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Konfirmasi alamat dan item pesanan sebelum membuat transaksi.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/pembeli/cart"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            {/* Address */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Alamat Pengiriman
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Alamat diambil dari profil kamu. Kamu boleh edit di sini untuk checkout
                  ini.
                </p>
              </div>

              <div className="px-5 py-5">
                <label className="block text-sm font-semibold text-slate-700">
                  Alamat
                </label>
                <textarea
                  rows={4}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap..."
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </div>

            {/* Items + Note */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Item Pesanan
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Item diambil dari keranjang sesuai pilihan kamu.
                </p>
              </div>

              <div className="px-5 py-4">
                {/* Catatan (UI only) */}
                <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-slate-800">Catatan</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Catatan ini hanya untuk tampilan dan tidak disimpan ke database.
                  </p>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                    placeholder="Contoh: hubungi sebelum sampai"
                  />
                </div>

                {loading ? (
                  <div className="animate-pulse rounded-xl bg-slate-100 p-4 text-sm text-slate-600">
                    Memuat item checkout...
                  </div>
                ) : cartItems.length ? (
                  <ul className="divide-y divide-slate-100">
                    {cartItems.map((it) => {
                      const name = it?.product?.name || "Produk";
                      const price = Number(it?.product?.price || 0);
                      const qty = Number(it?.quantity || 0);
                      const lineTotal = price * qty;

                      return (
                        <li key={it.id} className="py-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-5 w-5"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                >
                                  <path d="M10.5 6.5l7 7a4 4 0 01-5.657 5.657l-7-7A4 4 0 0110.5 6.5z" />
                                  <path d="M14 8l2 2" />
                                </svg>
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {name}
                                </p>
                                <p className="mt-1 text-sm text-slate-600">
                                  {formatRupiah(price)}{" "}
                                  <span className="text-slate-400">×</span>{" "}
                                  {qty}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-sm font-semibold text-slate-900">
                                {formatRupiah(lineTotal)}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">Subtotal</p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-800">
                      Tidak ada item yang dipilih
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Kembali ke keranjang dan pilih item yang ingin di-checkout.
                    </p>
                    <Link
                      to="/pembeli/cart"
                      className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                    >
                      Kembali ke Keranjang
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              {/* Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Ringkasan
                  </h2>
                </div>

                <div className="px-5 py-5">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Item</span>
                      <span className="font-semibold text-slate-900">
                        {itemCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-semibold text-slate-900">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Ongkir</span>
                      <span className="font-semibold text-slate-900">
                        {formatRupiah(0)}
                      </span>
                    </div>

                    <div className="my-4 h-px bg-slate-100" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-900">
                        Total
                      </span>
                      <span className="text-lg font-semibold tracking-tight text-slate-900">
                        {formatRupiah(subtotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={submitting || loading || !cartItems.length}
                    className={cn(
                      "mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition",
                      submitting || loading || !cartItems.length
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    {submitting ? "Membuat Pesanan..." : "Checkout Sekarang"}
                  </button>

                  <p className="mt-3 text-xs leading-relaxed text-slate-500">
                    Setelah pesanan dibuat, kamu akan diarahkan ke halaman pembayaran.
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-sm">
                <p className="text-sm font-semibold text-white">Catatan Sistem</p>
                <p className="mt-2 text-sm text-slate-200">
                  Checkout akan melakukan validasi stok di server. Jika stok tidak cukup,
                  transaksi akan ditolak.
                </p>
              </div>
            </div>
          </div>
        </div>{/* end grid */}
      </div>
    </div>
  );
}
