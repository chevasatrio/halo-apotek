import React from 'react';

const cartItems = [
    { id: 1, name: 'Paracetamol 500mg', note: 'Untuk demam', qty: 2, price: 12000, total: 24000, img: 'https://images.unsplash.com/photo-1582719478248-54e9f2b3e89b?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Cetirizine 10mg', note: 'Alergi ringan', qty: 1, price: 18000, total: 18000, img: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e1e0?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Vitamin C 500mg', note: 'Stamina', qty: 1, price: 22000, total: 22000, img: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=400&q=80' },
];

const paymentMethods = [
    { id: 'ewallet', name: 'E-Wallet', desc: 'OVO / GoPay / Dana', selected: true },
    { id: 'transfer', name: 'Transfer Bank', desc: 'BCA / BRI / Mandiri' },
    { id: 'cod', name: 'COD', desc: 'Bayar di tempat (opsional)' },
];

const formatRupiah = (n) => `Rp${n.toLocaleString('id-ID')}`;

const Pill = ({ children, color = 'bg-blue-50 text-blue-700' }) => (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{children}</span>
);

const KeranjangPage = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    const shipping = 10000;
    const grand = subtotal + shipping;

    return (
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            {/* Hero */}
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 px-6 py-7 shadow-xl sm:px-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-white">
                    <div>
                        <p className="text-sm text-blue-100">Langkah 2 dari 3 • Periksa keranjang</p>
                        <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
                        <p className="text-sm text-blue-50">Pastikan item, alamat, dan pembayaran sudah sesuai.</p>
                        <div className="mt-3 flex gap-2 text-xs font-semibold">
                            <Pill color="bg-white/15 text-white ring-1 ring-white/30">Gudang siap kirim</Pill>
                            <Pill color="bg-white/15 text-white ring-1 ring-white/30">Estimasi 45 menit</Pill>
                        </div>
                    </div>
                    <a href="/berandakami" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow hover:-translate-y-0.5 hover:shadow-md">
                        ← Kembali belanja
                    </a>
                </div>
                <div className="mt-5 grid gap-2 text-sm text-white/90 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Pesanan diverifikasi apoteker
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Pengiriman cepat & lacak real-time
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-300" />
                        Pembayaran aman
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Item di Keranjang</h2>
                            <span className="text-sm text-gray-500">{cartItems.length} produk</span>
                        </div>
                        <div className="mt-4 space-y-4">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 rounded-xl border border-gray-100 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800"
                                >
                                    <div className="h-20 w-20 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
                                        <img src={item.img} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(item.total)}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">Catatan: {item.note}</p>
                                        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                            <Pill>Qty: {item.qty}</Pill>
                                            <span className="text-gray-500">{formatRupiah(item.price)} / item</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Alamat Pengiriman</h2>
                            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">Ubah</button>
                        </div>
                        <div className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold">Budi Santoso</p>
                            <p>Jl. Merpati No. 12, Jakarta Selatan</p>
                            <p>Patokan: dekat Apotek Sehat</p>
                            <p className="text-gray-500">Telp: 0812-xxxx-xxxx</p>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <Pill>Jadwal: Hari ini, 14.00 - 16.00</Pill>
                            <Pill color="bg-emerald-50 text-emerald-700">Prioritas: Normal</Pill>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
                        <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
                        <div className="mt-3 space-y-3">
                            {paymentMethods.map((m) => (
                                <label
                                    key={m.id}
                                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-3 text-sm shadow-sm transition hover:border-blue-300 ${
                                        m.selected ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200 dark:border-gray-800'
                                    }`}
                                >
                                    <div>
                                        <p className="font-semibold">{m.name}</p>
                                        <p className="text-xs text-gray-500">{m.desc}</p>
                                    </div>
                                    <div className={`h-4 w-4 rounded-full ${m.selected ? 'bg-blue-500' : 'border border-gray-300'}`} />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800 space-y-3">
                        <h2 className="text-lg font-semibold">Ringkasan Pembayaran</h2>
                        <div className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 ring-1 ring-blue-100 dark:bg-blue-900/30 dark:text-blue-100">
                            Dapatkan gratis ongkir untuk pesanan &gt; Rp50.000
                        </div>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatRupiah(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Ongkir</span>
                                <span className="font-semibold">{formatRupiah(shipping)}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600">
                                <span>Voucher (otomatis)</span>
                                <span>-</span>
                            </div>
                            <div className="border-t border-gray-200 pt-3 dark:border-gray-800 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatRupiah(grand)}</span>
                            </div>
                        </div>
                        <button className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                            Bayar & Proses Pesanan
                        </button>
                        <p className="text-xs text-gray-500">Pembayaran aman & diverifikasi apoteker.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeranjangPage;

