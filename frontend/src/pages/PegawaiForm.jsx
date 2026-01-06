import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function PegawaiForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    password: "",
    password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadDetail, setLoadDetail] = useState(false);
  const [error, setError] = useState("");

  const roles = ["admin", "kasir", "driver", "pembeli"];

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const fetchDetail = async () => {
    if (!isEdit) return;
    setLoadDetail(true);
    setError("");

    try {
      const res = await api.get(`/users/${id}`);
      const data = res.data.user || res.data;

      setForm((prev) => ({
        ...prev,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "",
        password: "",
        password_confirmation: "",
      }));
    } catch (err) {
      console.error(err);
      setError("Gagal memuat detail pegawai.");
    } finally {
      setLoadDetail(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // payload dasar
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      // kalau diisi password, ikutkan (baik tambah maupun edit)
      if (form.password) {
        payload.password = form.password;
        payload.password_confirmation = form.password_confirmation;
      }

      if (isEdit) {
        await api.put(`/users/${id}`, payload);
      } else {
        await api.post("/users", payload);
      }

      navigate("/pegawai");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Gagal menyimpan data pegawai. Periksa kembali input."
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
            {isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
          </h2>
          <p className="card-subtitle">
            {isEdit
              ? "Perbarui data akun pegawai."
              : "Isi data pegawai baru yang akan mendapatkan akun sistem."}
          </p>
        </div>
      </div>

      {loadDetail && isEdit && <p>Memuat detail pegawai...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      <form className="form-grid" onSubmit={handleSubmit}>
  <div className="form-group">
    <label>Nama Pegawai</label>
    <input
      type="text"
      name="name"
      value={form.name}
      onChange={handleChange}
      placeholder="Contoh: Budi Santoso"
      required
    />
  </div>

  <div className="form-group">
    <label>Email</label>
    <input
      type="email"
      name="email"
      value={form.email}
      onChange={handleChange}
      placeholder="Contoh: budi@halo.com"
      required
    />
  </div>

  <div className="form-group">
    <label>Role Pegawai</label>
    <select
      name="role"
      value={form.role}
      onChange={handleChange}
      required
    >
      <option value="">Pilih role</option>
      {roles.map((r) => (
        <option key={r} value={r}>
          {r.charAt(0).toUpperCase() + r.slice(1)}
        </option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>
      Kata Sandi{" "}
      {!isEdit && <span style={{ fontWeight: 400 }}>(wajib)</span>}
    </label>
    <input
      type="password"
      name="password"
      value={form.password}
      onChange={handleChange}
      placeholder={isEdit ? "Kosongkan jika tidak diganti" : "Minimal 8 karakter"}
      {...(!isEdit ? { required: true } : {})}
    />
  </div>

  <div className="form-group">
    <label>Konfirmasi Kata Sandi</label>
    <input
      type="password"
      name="password_confirmation"
      value={form.password_confirmation}
      onChange={handleChange}
      placeholder="Ulangi kata sandi"
      {...(!isEdit ? { required: true } : {})}
    />
  </div>

  <div className="form-actions">
    <button
      type="button"
      className="btn btn-outline"
      onClick={() => navigate("/pegawai")}
    >
      Batal
    </button>
    <button className="btn btn-primary" disabled={loading}>
      {loading
        ? "Menyimpan..."
        : isEdit
        ? "Simpan Perubahan"
        : "Tambah Pegawai"}
    </button>
  </div>
</form>
    </div>
  );
}

export default PegawaiForm;
