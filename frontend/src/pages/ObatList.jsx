import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ObatList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/products");
      const data = res.data;
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data produk.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await api.delete(`/products/${id}`);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus produk.");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Data Obat / Produk</h2>
          <p className="text-gray-500 text-sm">
            Daftar produk obat yang tersedia di Halo Apotek.
          </p>
        </div>

        <button
          onClick={() => navigate("/dashboard/obat/tambah")}
          className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm shadow"
        >
          + Tambah Obat
        </button>
      </div>

      {/* LOADING STATE (spinner) */}
      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <div className="h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          Memuat data produk…
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm animate-[shake_0.3s_linear]">
          {error}
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto mt-5">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-left text-sm">
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Nama</th>
              <th className="p-3 border">Harga</th>
              <th className="p-3 border">Stok</th>
              <th className="p-3 border w-40 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {/* SKELETON ROWS */}
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="p-3 border">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td className="p-3 border">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td className="p-3 border">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td className="p-3 border">
                    <div className="h-4 bg-slate-200 rounded animate-pulse" />
                  </td>
                  <td className="p-3 border">
                    <div className="h-6 bg-slate-200 rounded animate-pulse" />
                  </td>
                </tr>
              ))}

            {/* EMPTY STATE */}
            {!loading && items.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500 text-sm">
                  Belum ada data produk.
                </td>
              </tr>
            )}

            {/* REAL DATA */}
            {!loading &&
              items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 text-sm">
                  <td className="p-3 border">{item.id}</td>
                  <td className="p-3 border">{item.name}</td>
                  <td className="p-3 border">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(item.price)}
                  </td>
                  <td className="p-3 border">{item.stock}</td>

                  <td className="p-3 border text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() =>
                          navigate(`/dashboard/obat/${item.id}/edit`)
                        }
                        className="px-3 py-1 rounded-lg border text-xs hover:bg-slate-100"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700"
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
    </div>
  );
}

export default ObatList;
