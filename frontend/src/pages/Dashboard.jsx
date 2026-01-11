export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-xl font-semibold">Dashboard</h2>
        <p className="text-slate-300 text-sm mt-1">
          Selamat datang di sistem Halo Apotek. Ini adalah ringkasan aktivitas
          dan data penting yang perlu Anda pantau.
        </p>

        {/* GRID SUMMARY */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          {/* CARD 1 */}
          <div className="bg-gradient-to-br from-sky-600 via-sky-700 to-sky-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Obat</p>
              <h3 className="text-2xl font-bold mt-1">128</h3>
            </div>
            <span className="text-3xl opacity-80">💊</span>
          </div>

          {/* CARD 2 */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Stok Menipis</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
            </div>
            <span className="text-3xl opacity-80">⚠️</span>
          </div>

          {/* CARD 3 */}
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800 p-4 rounded-xl shadow-lg flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Transaksi Hari Ini</p>
              <h3 className="text-2xl font-bold mt-1">34</h3>
            </div>
            <span className="text-3xl opacity-80">🧾</span>
          </div>
        </div>
      </div>
    </div>
  );
}
