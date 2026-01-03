import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ObatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    kode_obat: "",
    nama_obat: "",
    kategori: "",
    stok: "",
    harga: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadDetail, setLoadDetail] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    let value = e.target.value;
    if (["stok", "harga"].includes(e.target.name)) {
      value = value.replace(/\D/g, ""); // hanya angka
    }
    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const fetchDetail = async () => {
    if (!isEdit) return;
    setLoadDetail(true);
    try {
      const res = await api.get(`/obat/${id}`);
      const data = res.data.data || res.data;

      setForm({
        kode_obat: data.kode_obat || data.kode || "",
        nama_obat: data.nama_obat || data.nama || "",
        kategori: data.kategori || "",
        stok: String(data.stok ?? ""),
        harga: String(data.harga ?? ""),
      });
    } catch (err) {
      console.error(err);
      setError("Gagal memuat detail obat.");
    } finally {
      setLoadDetail(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        kode_obat: form.kode_obat,
        nama_obat: form.nama_obat,
        kategori: form.kategori,
        stok: Number(form.stok),
        harga: Number(form.harga),
      };

      if (isEdit) {
        await api.put(`/obat/${id}`, payload);
      } else {
        await api.post("/obat", payload);
      }

      navigate("/obat");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan data obat. Periksa kembali input."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            {isEdit ? "Edit Data Obat" : "Tambah Data Obat"}
          </h2>
          <p className="card-subtitle">
            Isi informasi obat dengan lengkap sesuai stok apotek.
          </p>
        </div>
      </div>

      {loadDetail && isEdit && <p>Memuat detail obat...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Kode Obat</label>
          <input
            type="text"
            name="kode_obat"
            value={form.kode_obat}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Nama Obat</label>
          <input
            type="text"
            name="nama_obat"
            value={form.nama_obat}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Kategori</label>
          <input
            type="text"
            name="kategori"
            value={form.kategori}
            onChange={handleChange}
            placeholder="Contoh: Tablet, Sirup, Salep"
          />
        </div>

        <div className="form-group">
          <label>Stok</label>
          <input
            type="text"
            name="stok"
            value={form.stok}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Harga (Rp)</label>
          <input
            type="text"
            name="harga"
            value={form.harga}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate("/obat")}
          >
            Batal
          </button>
          <button className="btn btn-primary" disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ObatForm;
