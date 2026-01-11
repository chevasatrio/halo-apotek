// src/pages/TransaksiForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

const STATUS_OPTIONS = [
    "pending",
    "paid",
    "processing",
    "shipping",
    "completed",
    "cancelled",
];

// Helper Format Rupiah
function formatRupiah(n) {
    const num = Number(n || 0);
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(num);
}

// Helper Format Tanggal
function formatDateTime(ts) {
    if (!ts) return "-";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return String(ts);
    return new Intl.DateTimeFormat("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(d);
}

// Helper Gambar Backend
const getImageUrl = (path) => {
    if (!path) return null;
    return `http://127.0.0.1:8000/storage/${path}`;
};

function StatusPill({ value }) {
    // Mapping 'completed' backend ke 'done' jika perlu
    const displayVal = value === "completed" ? "done" : value;

    let colorClass = "bg-slate-50 text-slate-700 border-slate-200";
    if (value === "paid")
        colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (value === "shipping")
        colorClass = "bg-blue-50 text-blue-700 border-blue-200";
    if (value === "completed" || value === "done")
        colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200";

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
        >
            {displayVal}
        </span>
    );
}

export default function TransaksiForm() {
    const { id } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [trx, setTrx] = useState(null);
    const [drivers, setDrivers] = useState([]);

    const [status, setStatus] = useState("pending");
    const [driverId, setDriverId] = useState("");

    const [loading, setLoading] = useState(true);

    // --- 1. FETCH DATA (Drivers & Transaksi) ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // A. Ambil Drivers
                const resDriver = await api.get("/drivers");
                // Handle format array atau {data: [...]}
                const driversList = Array.isArray(resDriver.data)
                    ? resDriver.data
                    : resDriver.data.data || [];
                setDrivers(driversList);

                // B. Ambil Transaksi Spesifik
                // Pastikan endpoint backend show($id) sudah dibuat sesuai Langkah 2A
                const resTrx = await api.get(`/transactions/${id}`);
                const found = resTrx.data.data; // Laravel Resource membungkus dengan 'data'

                if (found) {
                    // --- LOGGING DEBUG: Cek di Console Browser (F12) ---
                    console.log("Data Transaksi Lengkap:", found);
                    console.log("User/Pembeli:", found.user);
                    console.log("Tanggal:", found.created_at);
                    // ---------------------------------------------------

                    // 1. Perbaikan Nama Pembeli (Fallback ke 'user' jika 'buyer' kosong)
                    found.buyer = found.user ||
                        found.buyer || { name: "Guest (No Data)", email: "-" };

                    // 2. Perbaikan Tanggal (Pastikan tidak null)
                    if (!found.created_at)
                        console.warn(
                            "Tanggal created_at masih kosong dari backend!"
                        );

                    // 3. Perbaikan Detail Item
                    if (found.details) {
                        found.details = found.details.map((d) => ({
                            ...d,
                            // Cek 'product' atau 'product_name' tergantung resource
                            product_name:
                                d.product?.name ||
                                d.product_name ||
                                "Produk dihapus",
                        }));
                    }

                    setTrx(found);
                    setStatus(
                        found.status === "completed" ? "done" : found.status
                    );
                    setDriverId(found.driver_id ? String(found.driver_id) : "");
                }
            } catch (err) {
                console.error("Gagal ambil data:", err);
                // Jika 404, kembali ke list
                if (err.response && err.response.status === 404) {
                    navigate("/dashboard/transaksi");
                }
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id, navigate]);

    // Preview Driver yang dipilih
    const assignedDriver = useMemo(() => {
        if (!driverId) return null;
        return drivers.find((d) => String(d.id) === String(driverId)) || null;
    }, [driverId, drivers]);

    // Hitung Subtotal
    const detailsSubtotal = useMemo(() => {
        if (!trx?.details?.length) return 0;
        return trx.details.reduce(
            (acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 0),
            0
        );
    }, [trx]);
    // --- 2. LOGIKA SIMPAN (REVISI FINAL) ---
    const onSave = async (e) => {
        e.preventDefault();
        if (!trx) return;

        try {
            // Mapping Status 'done' -> 'completed' (backend)
            const targetStatus = status === "done" ? "completed" : status;
            const currentStatus = trx.status;

            // Skenario 1: Verifikasi Pembayaran (Paid -> Processing)
            if (targetStatus === "processing" && currentStatus === "paid") {
                await api.post(`/transaction/${id}/verify`);
                alert("Pembayaran diverifikasi (System Flow)");
            }
            // Skenario 2: Assign Driver (Processing -> Shipping)
            else if (
                targetStatus === "shipping" &&
                currentStatus === "processing"
            ) {
                if (!driverId) return alert("Pilih driver dulu!");
                await api.post(`/transaction/${id}/assign`, {
                    driver_id: driverId,
                });
                alert("Driver ditugaskan (System Flow)");
            }
            // Skenario 3: Selesai Langsung/Ambil Sendiri (Shipping -> Completed)
            // Note: Endpoint complete-direct biasanya untuk 'Ambil di tempat' tanpa driver
            else if (
                targetStatus === "completed" &&
                currentStatus === "shipping" &&
                !trx.driver_id
            ) {
                await api.post(`/transaction/${id}/complete-direct`);
                alert("Transaksi selesai (Ambil Sendiri)");
            }

            // --- SKENARIO 4: UPDATE MANUAL / PAKSA (FALLBACK) ---
            // Jika tidak masuk skenario di atas (misal: koreksi status, ganti driver, cancel)
            // Kita pakai endpoint PUT umum yang baru dibuat.
            else {
                await api.put(`/transactions/${id}`, {
                    status: targetStatus,
                    driver_id: driverId || null, // Kirim null jika kosong
                });
                alert("Data berhasil diperbarui secara manual.");
            }

            // Kembali ke dashboard
            navigate("/dashboard/transaksi");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Gagal menyimpan perubahan.");
        }
    };
    // --- RENDER ---

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="text-slate-500 animate-pulse">
                    Memuat data transaksi...
                </div>
            </div>
        );
    }

    // Jika redirect belum jalan tapi data null (safety)
    if (!trx) return null;

    return (
        <div className="space-y-4">
            {/* Top bar */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                        Transaksi {trx.invoice_code}
                    </h3>
                    <p className="text-sm text-slate-500">
                        Detail transaksi + update status & assign driver.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
                >
                    Kembali
                </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white border rounded-2xl shadow-sm p-5">
                    <div className="text-xs text-slate-500">Invoice</div>
                    <div className="mt-1 text-base font-semibold text-slate-800">
                        {trx.invoice_code}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">Tanggal</div>
                    <div className="mt-1 text-sm text-slate-700">
                        {formatDateTime(trx.created_at)}
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                        Status saat ini
                    </div>
                    <div className="mt-1">
                        <StatusPill value={trx.status} />
                    </div>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-5">
                    <div className="text-xs text-slate-500">Pembeli</div>
                    <div className="mt-1 text-sm font-medium text-slate-800">
                        {trx.buyer?.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        {trx.buyer?.email}
                    </div>
                    <div className="mt-1 text-xs text-slate-400 italic">
                        {trx.address || "Alamat tidak tersedia"}
                    </div>

                    <div className="mt-4 text-xs text-slate-500">Total</div>
                    <div className="mt-1 text-base font-semibold text-slate-800">
                        {formatRupiah(trx.total_amount)}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                        Subtotal item: {formatRupiah(detailsSubtotal)}
                    </div>
                </div>

                <div className="bg-white border rounded-2xl shadow-sm p-5">
                    <div className="text-xs text-slate-500">Bukti</div>
                    <div className="mt-2 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border p-3 bg-slate-50 flex flex-col items-center">
                            <div className="text-xs text-slate-500 mb-1">
                                Pembayaran
                            </div>
                            {trx.payment_proof ? (
                                <a
                                    href={getImageUrl(trx.payment_proof)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-sky-600 underline"
                                >
                                    Lihat Foto
                                </a>
                            ) : (
                                <span className="text-xs text-slate-400">
                                    Belum ada
                                </span>
                            )}
                        </div>
                        <div className="rounded-xl border p-3 bg-slate-50 flex flex-col items-center">
                            <div className="text-xs text-slate-500 mb-1">
                                Pengantaran
                            </div>
                            {trx.delivery_proof ? (
                                <a
                                    href={getImageUrl(trx.delivery_proof)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-sky-600 underline"
                                >
                                    Lihat Foto
                                </a>
                            ) : (
                                <span className="text-xs text-slate-400">
                                    Belum ada
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 text-xs text-slate-500">
                        Driver saat ini
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                        {trx.driver ? trx.driver.name : "- Belum ada driver -"}
                    </div>
                </div>
            </div>

            {/* Details table */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b">
                    <h4 className="font-semibold text-slate-800">
                        Detail Item
                    </h4>
                    <p className="text-sm text-slate-500">
                        Daftar item yang dibeli dalam transaksi ini.
                    </p>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-[800px] w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr className="text-left text-slate-600">
                                <th className="px-4 py-3 w-16">No</th>
                                <th className="px-4 py-3">Produk</th>
                                <th className="px-4 py-3 w-28">Qty</th>
                                <th className="px-4 py-3 w-40">Harga</th>
                                <th className="px-4 py-3 w-40">Subtotal</th>
                            </tr>
                        </thead>

                        <tbody>
                            {trx.details &&
                                trx.details.map((it, idx) => {
                                    const qty = Number(it.quantity || 0);
                                    const price = Number(it.price || 0);
                                    return (
                                        <tr
                                            key={it.id || idx}
                                            className="border-b last:border-b-0"
                                        >
                                            <td className="px-4 py-3">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-800">
                                                    {it.product_name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    ID Produk: {it.product_id}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">{qty}</td>
                                            <td className="px-4 py-3">
                                                {formatRupiah(price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                {formatRupiah(price * qty)}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update form */}
            <form
                onSubmit={onSave}
                className="bg-white border rounded-2xl shadow-sm p-5"
            >
                <h4 className="font-semibold text-slate-800">
                    Update Transaksi
                </h4>
                <p className="text-sm text-slate-500 mt-1">
                    Kasir/Admin dapat mengubah status dan memilih driver secara
                    manual.
                </p>

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Status
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="mt-2 w-full px-4 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-sky-200"
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs text-slate-500">
                            Saran alur: pending → paid → processing → shipping →
                            completed
                        </p>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-slate-700">
                            Assign Driver
                        </label>
                        <select
                            value={driverId}
                            onChange={(e) => setDriverId(e.target.value)}
                            className="mt-2 w-full px-4 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-sky-200"
                        >
                            <option value="">— Belum ditentukan —</option>
                            {drivers.map((d) => (
                                <option key={d.id} value={String(d.id)}>
                                    {d.name} ({d.email})
                                </option>
                            ))}
                        </select>

                        <div className="mt-2 text-xs text-slate-500">
                            Preview:{" "}
                            <span className="font-medium text-slate-700">
                                {assignedDriver
                                    ? assignedDriver.name
                                    : "Belum ada driver"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => navigate("/dashboard/transaksi")}
                        className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition text-sm"
                    >
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
}
