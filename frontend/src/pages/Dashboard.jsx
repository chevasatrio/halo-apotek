// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import api from "../services/api";

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_products: 0,
        low_stock: 0,
        today_transactions: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Asumsi backend punya endpoint /dashboard
                // Jika belum ada, Anda bisa membuatnya atau fetch manual dari masing-masing endpoint
                const res = await api.get("/dashboard");

                // Sesuaikan dengan format response backend Anda
                // Contoh response: { total_products: 150, low_stock: 5, today_transactions: 10 }
                setStats(res.data);
            } catch (err) {
                console.error("Gagal memuat dashboard stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                <h2 className="text-xl font-semibold">Dashboard</h2>
                <p className="text-slate-300 text-sm mt-1">
                    Selamat datang di sistem Halo Apotek. Ini adalah ringkasan
                    aktivitas dan data penting yang perlu Anda pantau.
                </p>

                {/* GRID SUMMARY */}
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                    {/* CARD 1 */}
                    <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Total Obat</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {loading ? "..." : stats.total_products || 0}
                            </h3>
                        </div>
                        <span className="text-3xl opacity-80">💊</span>
                    </div>

                    {/* CARD 2 */}
                    <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Stok Menipis</p>
                            <h3 className="text-2xl font-bold mt-1">
                                {loading ? "..." : stats.low_stock || 0}
                            </h3>
                        </div>
                        <span className="text-3xl opacity-80">⚠️</span>
                    </div>

                    {/* CARD 3 */}
                    <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">
                                Transaksi Hari Ini
                            </p>
                            <h3 className="text-2xl font-bold mt-1">
                                {loading
                                    ? "..."
                                    : stats.today_transactions || 0}
                            </h3>
                        </div>
                        <span className="text-3xl opacity-80">🧾</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
