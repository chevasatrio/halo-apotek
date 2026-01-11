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
            setError("Gagal memuat daftar pengguna.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus akun ini?")) return;

        try {
            await api.delete(`/users/${id}`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
        } catch (err) {
            console.error(err);
            alert("Gagal menghapus akun.");
        }
    };

    // pisahkan data
    const pegawai = users.filter(
        (u) => u.role === "admin" || u.role === "kasir" || u.role === "driver"
    );
    const pembeli = users.filter((u) => u.role === "pembeli");

    // komponen kecil indikator loading
    const LoadingIndicator = () => (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span className="inline-flex h-2 w-2 rounded-full bg-sky-500 animate-ping" />
            <span>Sedang memuat data pengguna...</span>
        </div>
    );

    return (
        <div className="space-y-8">
            {/* ERROR GLOBAL */}
            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {/* ================== TABEL PEGAWAI ================== */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Akun Pegawai
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Admin, kasir, dan driver yang mengelola operasional.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/dashboard/pegawai/tambah")}
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm shadow"
                    >
                        + Tambah Pengguna
                    </button>
                </div>

                {loading ? (
                    <LoadingIndicator />
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-left text-sm">
                                <th className="p-3 border w-14">No</th>
                                <th className="p-3 border">Nama</th>
                                <th className="p-3 border">Email</th>
                                <th className="p-3 border">Role</th>
                                <th className="p-3 border w-40 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pegawai.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center text-sm p-4 text-gray-500"
                                    >
                                        Tidak ada data pegawai.
                                    </td>
                                </tr>
                            )}

                            {pegawai.map((u, index) => (
                                <tr
                                    key={u.id}
                                    className="hover:bg-slate-50 text-sm"
                                >
                                    <td className="p-3 border">{index + 1}</td>
                                    <td className="p-3 border">{u.name}</td>
                                    <td className="p-3 border">{u.email}</td>
                                    <td className="p-3 border">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-medium
                        ${
                            u.role === "admin"
                                ? "bg-red-100 text-red-700"
                                : u.role === "kasir"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                        }`}
                                        >
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="p-3 border text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/pegawai/${u.id}/edit`
                                                    )
                                                }
                                                className="px-3 py-1 rounded-lg border text-xs hover:bg-slate-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(u.id)
                                                }
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
                )}
            </div>

            {/* ================== TABEL PEMBELI ================== */}
            <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Akun Pembeli
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Pelanggan yang menggunakan aplikasi Halo-Apotek.
                        </p>
                    </div>
                    {/* kalau nanti mau tambah pembeli manual, bisa tambahkan tombol di sini */}
                </div>

                {loading ? (
                    <LoadingIndicator />
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-left text-sm">
                                <th className="p-3 border w-14">No</th>
                                <th className="p-3 border">Nama</th>
                                <th className="p-3 border">Email</th>
                                <th className="p-3 border w-40 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pembeli.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center text-sm p-4 text-gray-500"
                                    >
                                        Tidak ada data pembeli.
                                    </td>
                                </tr>
                            )}

                            {pembeli.map((u, index) => (
                                <tr
                                    key={u.id}
                                    className="hover:bg-slate-50 text-sm"
                                >
                                    <td className="p-3 border">{index + 1}</td>
                                    <td className="p-3 border">{u.name}</td>
                                    <td className="p-3 border">{u.email}</td>
                                    <td className="p-3 border text-center">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/dashboard/pegawai/${u.id}/edit`
                                                    )
                                                }
                                                className="px-3 py-1 rounded-lg border text-xs hover:bg-slate-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(u.id)
                                                }
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
                )}
            </div>
        </div>
    );
}

export default ListPegawai;
