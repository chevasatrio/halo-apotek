import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ListPegawai() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data ?? [];
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar pegawai.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus pegawai ini?")) return;

    try {
      await api.delete(`/users/${id}`);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus pegawai.");
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Daftar Pegawai</h2>
          <p className="card-subtitle">
            Kelola akun pengguna (admin, kasir, driver, dan pembeli).
          </p>
        </div>

        {/* tombol tambah di pojok kanan, sama seperti Tambah Obat */}
        <button
          className="btn btn-primary"
          onClick={() => navigate("/pegawai/tambah")}
        >
          + Tambah Pegawai
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {loading && <p>Memuat data...</p>}

      {!loading && (
        <div className="table-wrapper" style={{ marginTop: 16 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th style={{ width: "160px" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    Belum ada data pegawai.
                  </td>
                </tr>
              )}

              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="btn btn-sm btn-outline"
                        onClick={() => navigate(`/pegawai/${u.id}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(u.id)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListPegawai;
