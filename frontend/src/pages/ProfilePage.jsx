import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Badge({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
      <span className="w-2 h-2 rounded-full bg-emerald-400" />
      {children}
    </span>
  );
}

function FieldLabel({ children }) {
  return <label className="text-xs font-medium text-slate-600">{children}</label>;
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none " +
        "focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition " +
        className
      }
    />
  );
}

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={
        "w-full min-h-[110px] resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none " +
        "focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition " +
        className
      }
    />
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-7 w-44 bg-slate-100 rounded-xl" />
        <div className="h-12 w-full bg-slate-100 rounded-xl" />
        <div className="h-12 w-full bg-slate-100 rounded-xl" />
        <div className="h-28 w-full bg-slate-100 rounded-xl" />
        <div className="h-12 w-40 bg-slate-100 rounded-xl" />
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serverUser, setServerUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const roleLocal = useMemo(
    () => (localStorage.getItem("user_role") || "").toLowerCase(),
    []
  );
  const nameLocal = useMemo(() => localStorage.getItem("user_name") || "User", []);

  const initials = useMemo(() => {
    const s = String(form.name || nameLocal || "U").trim();
    return s ? s[0].toUpperCase() : "U";
  }, [form.name, nameLocal]);

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const normalizePhone = (u) => u?.phone ?? u?.no_hp ?? "";

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get("/user"); // GET /api/user
      const u = res.data;

      setServerUser(u);

      setForm({
        name: u?.name || "",
        email: u?.email || "",
        phone: normalizePhone(u) || "",
        address: u?.address || "",
      });

      // sinkron local storage untuk hero/header
      if (u?.name) localStorage.setItem("user_name", u.name);
      if (u?.role) localStorage.setItem("user_role", String(u.role).toLowerCase());
      localStorage.setItem("user", JSON.stringify(u));
    } catch (e) {
      console.error("Load profile failed:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDirty = useMemo(() => {
    if (!serverUser) return false;
    return (
      String(form.name || "") !== String(serverUser?.name || "") ||
      String(form.phone || "") !== String(normalizePhone(serverUser) || "") ||
      String(form.address || "") !== String(serverUser?.address || "")
    );
  }, [form, serverUser]);

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // PUT /api/user -> update profil sendiri (tanpa role)
      await api.put("/user", {
        name: form.name,
        phone: form.phone,
        address: form.address,
      });

      // reload agar state & localStorage sinkron
      await loadProfile();

      // UX feedback ringan
      // (kalau kamu punya toast, ganti ini)
      alert("Profil berhasil disimpan.");
    } catch (e) {
      console.error("Update profile failed:", e);
      alert("Gagal menyimpan profil. Cek validasi backend / koneksi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Badge>Profil Pembeli</Badge>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">
              Akun & Alamat
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Update data profil dan alamat pengiriman. Role tidak dapat diubah.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/pembeli"
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
            >
              Kembali
            </Link>

            <button
              type="button"
              onClick={loadProfile}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 transition disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <Skeleton />
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {form.name || nameLocal}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(roleLocal || "pembeli").trim()}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Email</span>
                    <span className="text-slate-800 truncate">{form.email || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">No. HP</span>
                    <span className="text-slate-800">{form.phone || "—"}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-sky-50 border border-sky-100">
                  <p className="text-xs font-semibold text-slate-800">Keamanan</p>
                  <p className="mt-1 text-xs text-slate-600">
                    Role akun dikunci. Tidak ada opsi ubah role dari halaman profil.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <form
                onSubmit={onSave}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Detail Profil
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Isi alamat lengkap untuk mempercepat pengiriman.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={!isDirty || saving}
                    className="px-5 py-3 rounded-2xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:bg-slate-300 transition"
                  >
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <FieldLabel>Nama Lengkap</FieldLabel>
                    <Input
                      value={form.name}
                      onChange={set("name")}
                      placeholder="Nama lengkap"
                      autoComplete="name"
                    />
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Role</FieldLabel>
                    <Input value={(roleLocal || "pembeli").trim()} disabled />
                    <p className="text-[11px] text-slate-400">Tidak dapat diubah.</p>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>Email</FieldLabel>
                    <Input value={form.email} disabled />
                    <p className="text-[11px] text-slate-400">
                      Email dikunci dari sisi frontend.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <FieldLabel>No. HP</FieldLabel>
                    <Input
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="08xxxxxxxxxx"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <FieldLabel>Alamat Lengkap</FieldLabel>
                    <Textarea
                      value={form.address}
                      onChange={set("address")}
                      placeholder="Contoh: Jl. Kenanga No. 12, RT 03/RW 02, Kel. ..., Kec. ..., Kota ..., Provinsi ..., Kode Pos ..."
                    />
                    <p className="text-[11px] text-slate-400">
                      Disimpan sebagai alamat default untuk checkout.
                    </p>
                  </div>
                </div>

                <div className="mt-7 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-semibold text-slate-800">
                    Tips Pengisian Alamat
                  </p>
                  <ul className="mt-2 text-xs text-slate-600 list-disc pl-5 space-y-1">
                    <li>Tulis nama jalan, nomor rumah, RT/RW.</li>
                    <li>Tambahkan kelurahan, kecamatan, kota, provinsi.</li>
                    <li>Jika ada patokan, tulis di akhir (opsional).</li>
                  </ul>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
