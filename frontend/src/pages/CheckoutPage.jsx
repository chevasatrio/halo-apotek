// src/pages/CheckoutPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api"; // sesuaikan bila path berbeda

function formatRupiah(n) {
    const num = Number(n || 0);
    return "Rp " + num.toLocaleString("id-ID");
}

function StatusPill({ children }) {
    return (
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
            {children}
        </span>
    );
}

function SkeletonLine({ className = "" }) {
    return (
        <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
    );
}

export default function CheckoutPage() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [cartItems, setCartItems] = useState([]);
    const [address, setAddress] = useState(
        "Alamat dummy sementara (belum ambil dari users.address)."
    );
    const [note, setNote] = useState(""); // opsional, FE only
    const [error, setError] = useState("");

    // Fetch Cart
    useEffect(() => {
        let mounted = true;

        async function fetchCart() {
            setLoading(true);
            setError("");

            try {
                // Endpoint sesuai route kamu: GET /cart
                const res = await api.get("/cart");

                // myCart biasanya return { data: [...] }
                const items = res?.data?.data ?? [];
                if (mounted) setCartItems(Array.isArray(items) ? items : []);
            } catch (e) {
                if (mounted) {
                    setError(
                        e?.response?.data?.message || "Gagal memuat keranjang."
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        }

        fetchCart();
        return () => {
            mounted = false;
        };
    }, []);

    const { itemCount, subtotal } = useMemo(() => {
        const count = cartItems.reduce(
            (acc, it) => acc + Number(it.quantity || 0),
            0
        );
        const sum = cartItems.reduce((acc, it) => {
            const price = Number(it?.product?.price || 0);
            const qty = Number(it?.quantity || 0);
            return acc + price * qty;
        }, 0);
        return { itemCount: count, subtotal: sum };
    }, [cartItems]);

    async function handleCheckout() {
        setSubmitting(true);
        setError("");

        try {
            if (!cartItems.length) {
                setError("Keranjang belanja kosong.");
                return;
            }

            // Endpoint sesuai route kamu: POST /checkout
            const payload = {
                address: address?.trim() || "Alamat tidak diisi",
            };

            const res = await api.post("/checkout", payload);

            // Controller return: { message, data: TransactionResource }
            const trx = res?.data?.data;
            const trxId = trx?.id;

            // Setelah checkout, cart dihapus server-side -> jangan balik ke cart
            if (trxId) {
                navigate(`/buyer/orders/${trxId}/payment`, { replace: true });
            } else {
                navigate(`/buyer/orders`, { replace: true });
            }
        } catch (e) {
            setError(
                e?.response?.data?.message ||
                    e?.response?.data?.error ||
                    "Checkout gagal."
            );
        } finally {
            setSubmitting(false);
        }
    }

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
                                Konfirmasi alamat dan item pesanan sebelum
                                membuat transaksi.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/buyer/cart"
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
                                    Sementara isi dummy dulu. Nanti kita
                                    sambungkan ke{" "}
                                    <span className="font-semibold">
                                        users.address
                                    </span>
                                    .
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

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Catatan
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Field ini belum dipakai backend.
                                            Aman sebagai placeholder UI.
                                        </p>
                                        <input
                                            value={note}
                                            onChange={(e) =>
                                                setNote(e.target.value)
                                            }
                                            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-200"
                                            placeholder="Contoh: hubungi sebelum sampai"
                                        />
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Status Awal
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Setelah checkout, transaksi dibuat
                                            dengan status:{" "}
                                            <StatusPill>pending</StatusPill>
                                        </p>
                                        <p className="mt-2 text-sm text-slate-600">
                                            Lanjutkan upload bukti bayar agar
                                            status menjadi{" "}
                                            <StatusPill>paid</StatusPill>.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 px-5 py-4">
                                <h2 className="text-base font-semibold text-slate-900">
                                    Item Pesanan
                                </h2>
                                <p className="mt-1 text-sm text-slate-600">
                                    Ringkasan item diambil dari keranjang
                                    (server-side).
                                </p>
                            </div>

                            <div className="px-5 py-4">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="flex items-center gap-4"
                                            >
                                                <SkeletonLine className="h-10 w-10" />
                                                <div className="flex-1 space-y-2">
                                                    <SkeletonLine className="h-4 w-2/3" />
                                                    <SkeletonLine className="h-4 w-1/3" />
                                                </div>
                                                <SkeletonLine className="h-6 w-24" />
                                            </div>
                                        ))}
                                    </div>
                                ) : cartItems.length ? (
                                    <ul className="divide-y divide-slate-100">
                                        {cartItems.map((it) => {
                                            const name =
                                                it?.product?.name || "Produk";
                                            const price = Number(
                                                it?.product?.price || 0
                                            );
                                            const qty = Number(
                                                it?.quantity || 0
                                            );
                                            const lineTotal = price * qty;

                                            return (
                                                <li
                                                    key={it.id}
                                                    className="py-4"
                                                >
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
                                                                    {formatRupiah(
                                                                        price
                                                                    )}{" "}
                                                                    <span className="text-slate-400">
                                                                        ×
                                                                    </span>{" "}
                                                                    {qty}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-slate-900">
                                                                {formatRupiah(
                                                                    lineTotal
                                                                )}
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                Subtotal
                                                            </p>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                                        <p className="text-sm font-semibold text-slate-800">
                                            Keranjang kosong
                                        </p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Tambahkan produk dulu, lalu
                                            checkout.
                                        </p>
                                        <Link
                                            to="/buyer/obat"
                                            className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
                                        >
                                            Lihat Produk
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
                                            <span className="text-slate-600">
                                                Item
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {itemCount}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">
                                                Subtotal
                                            </span>
                                            <span className="font-semibold text-slate-900">
                                                {formatRupiah(subtotal)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">
                                                Ongkir
                                            </span>
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
                                        disabled={
                                            loading ||
                                            submitting ||
                                            !cartItems.length
                                        }
                                        className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition
                      ${
                          loading || submitting || !cartItems.length
                              ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                              : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                                    >
                                        {submitting
                                            ? "Membuat Pesanan..."
                                            : "Checkout Sekarang"}
                                    </button>

                                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                                        Sistem akan membuat invoice dan
                                        mengosongkan keranjang. Setelah itu,
                                        upload bukti pembayaran.
                                    </p>
                                </div>
                            </div>

                            {/* Flow card */}
                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="px-5 py-5">
                                    <p className="text-sm font-semibold text-slate-900">
                                        Alur Status
                                    </p>
                                    <ol className="mt-3 space-y-2 text-sm text-slate-600">
                                        <li className="flex items-center justify-between">
                                            <span>Checkout</span>
                                            <StatusPill>pending</StatusPill>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>Upload bukti bayar</span>
                                            <StatusPill>paid</StatusPill>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>Verifikasi</span>
                                            <StatusPill>processing</StatusPill>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>Pengiriman</span>
                                            <StatusPill>shipping</StatusPill>
                                        </li>
                                        <li className="flex items-center justify-between">
                                            <span>Selesai</span>
                                            <StatusPill>completed</StatusPill>
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            {/* Help */}
                            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-sm">
                                <p className="text-sm font-semibold text-white">
                                    Tips
                                </p>
                                <p className="mt-2 text-sm text-slate-200">
                                    Jika stok tidak cukup, backend akan menolak
                                    checkout dan menampilkan error.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
