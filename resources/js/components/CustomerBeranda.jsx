import React from 'react';


const products = [
    {
        id: 1,
        name: 'Paracetamol 500mg',
        category: 'Analgesik',
        price: 'Rp12.000',
        stock: 'Stok 50 strip',
        badge: 'Best Seller',
        image: 'https://images.unsplash.com/photo-1582719478248-54e9f2b3e89b?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 2,
        name: 'Amoxicillin 500mg',
        category: 'Antibiotik',
        price: 'Rp35.000',
        stock: 'Stok 30 strip',
        badge: 'Butuh Resep',
        image: 'https://images.unsplash.com/photo-1584367369853-8e0910ae37e9?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 3,
        name: 'Cetirizine 10mg',
        category: 'Antihistamin',
        price: 'Rp18.000',
        stock: 'Stok 80 strip',
        badge: 'Promo',
        image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e1e0?auto=format&fit=crop&w=600&q=80',
    },
    {
        id: 4,
        name: 'Vitamin C 500mg',
        category: 'Vitamin',
        price: 'Rp22.000',
        stock: 'Stok 90 tablet',
        badge: 'Imun Booster',
        image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80',
    },
];

const Icon = ({ name, className }) => {
    switch (name) {
        case 'cart':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5h2l1.5 12h11L19 9H7" />
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="17" cy="19" r="1" />
                </svg>
            );
        case 'upload':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 16V4m0 0-4 4m4-4 4 4M6 20h12" />
                </svg>
            );
        case 'track':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 12h4l2 4 2-8 2 4h4" />
                    <circle cx="12" cy="12" r="9" />
                </svg>
            );
        case 'search':
            return (
                <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m16 16 3 3" />
                </svg>
            );
        default:
            return null;
    }
};

const ActionCard = ({ title, desc, icon, accent }) => (
    <div className={`flex items-center gap-4 rounded-2xl px-4 py-4 ring-1 transition hover:-translate-y-1 hover:shadow-md ${accent}`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/90 shadow-inner">
            <Icon name={icon} className="h-6 w-6" />
        </div>
        <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-gray-600">{desc}</p>
        </div>
    </div>
);

const ProductCard = ({ p }) => (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900">
        <div className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm dark:bg-gray-800/80 dark:text-blue-200">
            {p.badge}
        </div>
        <div className="h-40 w-full overflow-hidden bg-gray-50 dark:bg-gray-800/50">
            <img
                src={p.image}
                alt={p.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
            />
        </div>
        <div className="p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700 dark:bg-blue-900/40 dark:text-blue-100">
                    {p.category}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100">
                    {p.stock}
                </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{p.name}</h3>
            <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{p.price}</p>
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                    Tambah ke Keranjang
                </button>
            </div>
        </div>
    </div>
);

const CustomerBeranda = () => {
    return (
        <div className="space-y-8 text-gray-900 dark:text-gray-100">
            <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 px-6 py-8 shadow-2xl sm:px-10">
                <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-blue-50 ring-1 ring-white/20">
                            <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                            Layanan apotek online
                        </div>
                        <h1 className="text-3xl font-bold text-white sm:text-4xl">Belanja Obat, Upload Resep, Lacak Pesanan</h1>
                        <p className="max-w-2xl text-blue-50">
                            Semua kebutuhan kesehatan dalam satu dashboard. Konsultasi apoteker, pengiriman cepat, dan pelacakan real-time.
                        </p>
                        <div className="flex flex-wrap gap-3 text-xs font-semibold text-white">
                            <span className="rounded-full bg-white/15 px-3 py-1">Gratis ongkir tertentu</span>
                            <span className="rounded-full bg-white/15 px-3 py-1">Resep diverifikasi apoteker</span>
                            <span className="rounded-full bg-white/15 px-3 py-1">Pengiriman 2 jam</span>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow hover:-translate-y-0.5 hover:shadow-md">
                                Mulai Belanja
                            </button>
                            <button className="rounded-xl border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
                                Upload Resep
                            </button>
                        </div>
                        <div className="flex gap-4 text-white/90 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                                Gudang 24/7
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                                Konsultasi apoteker
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-3xl" />
                        <div className="absolute -right-8 -bottom-10 h-28 w-28 rounded-full bg-sky-300/30 blur-2xl" />
                        <div className="relative rounded-3xl bg-white/10 p-6 backdrop-blur-lg shadow-2xl ring-1 ring-white/20">
                            <div className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 text-gray-800 shadow">
                                <Icon name="search" className="h-5 w-5 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Cari obat, kategori, atau keluhan..."
                                    className="w-full border-none bg-transparent text-sm focus:outline-none"
                                />
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-semibold text-white">
                                <span className="rounded-xl bg-white/15 px-3 py-2 text-center">Demam</span>
                                <span className="rounded-xl bg-white/15 px-3 py-2 text-center">Batuk & Flu</span>
                                <span className="rounded-xl bg-white/15 px-3 py-2 text-center">Vitamin</span>
                            </div>
                            <div className="mt-5 grid gap-3 rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/15">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">Status Pesanan Aktif</p>
                                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">3 pesanan</span>
                                </div>
                                <div className="flex items-center justify-between text-sm text-white/80">
                                    <span>Estimasi kurir</span>
                                    <span>± 45 menit</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                                    <div className="h-full w-2/3 rounded-full bg-emerald-300"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3" id="aksi">
                <ActionCard title="Keranjang" desc="Lihat item yang dipilih" icon="cart" accent="bg-blue-50 text-blue-700 ring-blue-200" />
                <ActionCard title="Upload Resep" desc="Unggah foto resep dokter" icon="upload" accent="bg-emerald-50 text-emerald-700 ring-emerald-200" />
                <ActionCard title="Lacak Pesanan" desc="Pantau status kiriman" icon="track" accent="bg-amber-50 text-amber-700 ring-amber-200" />
            </section>

            <section className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-gray-500">Produk Pilihan</p>
                            <h2 className="text-xl font-bold">Obat yang sering dibeli</h2>
                        </div>
                        <a href="#" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                            Lihat semua
                        </a>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {products.map((p) => (
                            <ProductCard key={p.id} p={p} />
                        ))}
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900" id="lacak-pesanan">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Status Pesanan</p>
                        <h3 className="mt-1 text-lg font-bold">Pantau pesanan Anda</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Update langsung dari gudang & kurir.</p>
                        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold bg-blue-100 text-blue-800">
                                <p className="text-xs uppercase tracking-wide text-gray-600">Pesanan Aktif</p>
                                <p className="text-2xl font-bold">3</p>
                            </div>
                            <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold bg-amber-100 text-amber-800">
                                <p className="text-xs uppercase tracking-wide text-gray-600">Sedang Dikirim</p>
                                <p className="text-2xl font-bold">2</p>
                            </div>
                            <div className="rounded-xl px-4 py-3 text-center text-sm font-semibold bg-emerald-100 text-emerald-800">
                                <p className="text-xs uppercase tracking-wide text-gray-600">Selesai Bulan Ini</p>
                                <p className="text-2xl font-bold">12</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-sm transition hover:border-blue-300 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500" id="upload-resep">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <Icon name="upload" className="h-6 w-6" />
                        </div>
                        <div className="mt-3">
                            <p className="text-base font-semibold text-gray-900 dark:text-white">Upload Resep Dokter</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Unggah foto resep untuk diverifikasi apoteker. JPG, PNG, PDF (maks 5MB).
                            </p>
                        </div>
                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                            <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
                                Pilih Berkas
                            </button>
                            <button className="rounded-lg border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-700/40 dark:text-blue-200 dark:hover:bg-blue-900/30">
                                Foto Kamera
                            </button>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Respon apoteker ±10 menit.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CustomerBeranda;

