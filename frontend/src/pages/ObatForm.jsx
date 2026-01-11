import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function ObatForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama_obat: "",
    stok: "",
    harga: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadDetail, setLoadDetail] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    let value = e.target.value;

    if (["stok", "harga"].includes(e.target.name)) {
      value = value.replace(/\D/g, "");
    }

    setForm((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const fetchDetail = async () => {
    if (!isEdit) return;

    setLoadDetail(true);
    setError("");

    try {
      const res = await api.get(`/products/${id}`);
      const data = res.data.data;

      setForm({
        nama_obat: data.name || "",
        stok: String(data.stock ?? ""),
        harga: String(data.price ?? ""),
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
      const fd = new FormData();
      fd.append("name", form.nama_obat);
      fd.append("price", form.harga);
      fd.append("stock", form.stok);

      if (isEdit) {
        fd.append("_method", "PUT");

        await api.post(`/products/${id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/products", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      navigate("/dashboard/obat");
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
    <div className="bg-white rounded-xl shadow-sm border p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">
          {isEdit ? "Edit Data Obat" : "Tambah Data Obat"}
        </h2>
        <p className="text-sm text-gray-500">
          Isi informasi obat dengan lengkap sesuai stok apotek.
        </p>
      </div>

      {/* LOADING FETCH */}
      {loadDetail && isEdit && (
        <div className="mb-4 flex items-center gap-3 text-sm text-gray-600">
          <div className="h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          Memuat detail obat…
        </div>
      )}

      {/* ERROR FETCH */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded text-sm animate-[shake_0.3s_linear]">
          {error}
        </div>
      )}

      <form
        className="grid md:grid-cols-2 gap-4"
        onSubmit={handleSubmit}
        style={{ opacity: loadDetail ? 0.6 : 1 }}
      >
        <div>
          <label className="block text-sm font-medium mb-1">Nama Obat</label>
          <input
            type="text"
            name="nama_obat"
            value={form.nama_obat}
            onChange={handleChange}
            disabled={loadDetail}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stok</label>
          <input
            type="text"
            name="stok"
            value={form.stok}
            onChange={handleChange}
            disabled={loadDetail}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Harga (Rp)</label>
          <input
            type="text"
            name="harga"
            value={form.harga}
            onChange={handleChange}
            disabled={loadDetail}
            required
            className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div className="col-span-full flex justify-end gap-3 mt-4">
          <button
            type="button"
            onClick={() => navigate("/dashboard/obat")}
            className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50"
          >
            Batal
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm shadow"
            disabled={loading || loadDetail}
          >
            {loading ? "Menyimpan…" : isEdit ? "Simpan Perubahan" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ObatForm;
