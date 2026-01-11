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
            const data = res.data.data;

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
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const payload = {
                name: form.name,
                email: form.email,
                role: form.role,
            };

            if (form.password) {
                payload.password = form.password;
                payload.password_confirmation = form.password_confirmation;
            }

            if (isEdit) {
                await api.put(`/users/${id}`, payload);
            } else {
                await api.post("/users", payload);
            }

            navigate("/dashboard/pegawai");
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
        <div className="bg-white rounded-xl shadow-sm border p-6">
            {/* HEADER */}
            <div className="mb-5">
                <h2 className="text-lg font-semibold">
                    {isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
                </h2>
                <p className="text-sm text-gray-500">
                    {isEdit
                        ? "Perbarui data akun pegawai."
                        : "Isi data pegawai baru yang akan mendapatkan akun sistem."}
                </p>
            </div>

            {/* LOADING FETCH */}
            {loadDetail && isEdit && (
                <div className="mb-4 flex items-center gap-3 text-sm text-gray-600">
                    <div className="h-4 w-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                    Memuat detail pegawai...
                </div>
            )}

            {/* ERROR FETCH */}
            {error && (
                <div className="mb-4 p-3 rounded border border-red-300 bg-red-100 text-red-700 text-sm animate-[shake_0.3s_linear]">
                    {error}
                </div>
            )}

            {/* FORM (disabled sementara saat loading detail) */}
            <form
                className="grid md:grid-cols-2 gap-4"
                onSubmit={handleSubmit}
                style={{ opacity: loadDetail ? 0.6 : 1 }}
            >
                {/* NAME */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Nama Pegawai
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        disabled={loadDetail}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                        placeholder="Contoh: Budi Santoso"
                        required
                    />
                </div>

                {/* EMAIL */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={loadDetail}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                        placeholder="Contoh: budi@halo.com"
                        required
                    />
                </div>

                {/* ROLE */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Role Pegawai
                    </label>
                    <select
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        disabled={loadDetail}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
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

                {/* PASSWORD */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Kata Sandi{" "}
                        {!isEdit && (
                            <span className="font-normal text-gray-500">
                                (wajib)
                            </span>
                        )}
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        disabled={loadDetail}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                        placeholder={
                            isEdit
                                ? "Kosongkan jika tidak diganti"
                                : "Minimal 8 karakter"
                        }
                        {...(!isEdit ? { required: true } : {})}
                    />
                </div>

                {/* PASSWORD CONFIRM */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Konfirmasi Kata Sandi
                    </label>
                    <input
                        type="password"
                        name="password_confirmation"
                        value={form.password_confirmation}
                        onChange={handleChange}
                        disabled={loadDetail}
                        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
                        placeholder="Ulangi kata sandi"
                        {...(!isEdit ? { required: true } : {})}
                    />
                </div>

                {/* BUTTONS */}
                <div className="col-span-full flex justify-end gap-3 mt-4">
                    <button
                        type="button"
                        className="px-4 py-2 rounded-lg border text-sm hover:bg-slate-50"
                        onClick={() => navigate("/dashboard/pegawai")}
                    >
                        Batal
                    </button>

                    <button
                        className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm shadow"
                        disabled={loading || loadDetail}
                    >
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
