function Dashboard() {
  return (
    <div className="card">
      <h2 className="card-title">Dashboard</h2>
      <p className="card-subtitle">
        Selamat datang di sistem Halo Apotek. Ringkasan data akan tampil di
        sini (jumlah obat, stok kritis, transaksi terbaru, dll).
      </p>

      <div className="dashboard-grid">
        <div className="stat-card">
          <span className="stat-label">Total Obat</span>
          <span className="stat-value">–</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Stok Menipis</span>
          <span className="stat-value">–</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transaksi Hari Ini</span>
          <span className="stat-value">–</span>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
