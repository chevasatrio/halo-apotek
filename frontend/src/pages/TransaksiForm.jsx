// src/pages/TransaksiForm.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

// ... (Helper functions formatRupiah, formatDateTime, dll tetap sama) ...
const STATUS_OPTIONS = ["pending", "paid", "processing", "shipping", "completed", "cancelled"];

function formatRupiah(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
}

function formatDateTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? String(ts) : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

const getImageUrl = (path) => path ? `http://127.0.0.1:8000/storage/${path}` : null;

function StatusPill({ value }) {
  const displayVal = value === 'completed' ? 'done' : value;
  let color = "bg-slate-50 text-slate-700";
  if (value === 'paid') color = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (value === 'shipping') color = "bg-blue-50 text-blue-700 border-blue-200";
  if (value === 'completed') color = "bg-indigo-50 text-indigo-700 border-indigo-200";
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${color}`}>{displayVal}</span>;
}

export default function TransaksiForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trx, setTrx] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [status, setStatus] = useState("pending");
  const [driverId, setDriverId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resDriver = await api.get('/drivers');
        setDrivers(Array.isArray(resDriver.data) ? resDriver.data : (resDriver.data.data || []));

        const resTrx = await api.get(`/transactions/${id}`);
        const found = resTrx.data.data;

        if (found) {
          found.buyer = found.user || { name: 'Guest', email: '-' };
          
          if (found.details) {
             found.details = found.details.map(d => {
               // LOGIKA PERBAIKAN HARGA:
               // 1. Ambil harga snapshot transaksi (d.price)
               // 2. Jika 0/null, cari di d.product.price
               let finalPrice = Number(d.price);
               
               if (finalPrice === 0 && d.product) {
                   finalPrice = Number(d.product.price);
               }

               return {
                 ...d,
                 // Pastikan nama produk muncul
                 product_name: d.product?.name || d.product_name || 'Produk dihapus',
                 // Simpan harga hasil kalkulasi agar tabel tinggal render
                 calculated_price: finalPrice
               };
             });
          }

          setTrx(found);
          setStatus(found.status === 'completed' ? 'done' : found.status);
          setDriverId(found.driver_id ? String(found.driver_id) : "");
        } else {
          navigate("/dashboard/transaksi", { replace: true });
        }
      } catch (err) {
        console.error("Gagal ambil data", err);
        navigate("/dashboard/transaksi", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    if(id) fetchData();
  }, [id, navigate]);

  const assignedDriver = useMemo(() => {
    if (!driverId) return null;
    return drivers.find((d) => String(d.id) === String(driverId)) || null;
  }, [driverId, drivers]);

  const onSave = async (e) => {
    e.preventDefault();
    if(!trx) return;
    try {
      const apiStatus = status === 'done' ? 'completed' : status;
      await api.put(`/transactions/${id}`, { status: apiStatus, driver_id: driverId || null });
      alert("Berhasil disimpan!");
      navigate("/dashboard/transaksi");
    } catch (err) {
      alert("Gagal update.");
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-500">Memuat...</div>;
  if (!trx) return null;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
            <h3 className="text-lg font-semibold text-slate-800">Transaksi {trx.invoice_code}</h3>
            <p className="text-sm text-slate-500">Detail & Update Status</p>
        </div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded-lg bg-white hover:bg-slate-50 text-sm">Kembali</button>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border p-5 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-500">Invoice</div>
            <div className="font-bold text-slate-800 text-lg mt-1">{trx.invoice_code}</div>
            <div className="text-xs text-slate-500 mt-2">Tanggal</div>
            <div className="text-sm">{formatDateTime(trx.created_at)}</div>
            <div className="mt-2"><StatusPill value={trx.status} /></div>
        </div>
        <div className="bg-white border p-5 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-500">Pembeli</div>
            <div className="font-medium text-slate-800">{trx.buyer.name}</div>
            <div className="text-xs text-slate-500">{trx.buyer.email}</div>
            <div className="text-xs text-slate-400 mt-1 italic">{trx.address}</div>
            <div className="text-xs text-slate-500 mt-4">Total Akhir</div>
            <div className="font-bold text-slate-800 text-lg">{formatRupiah(trx.total_amount)}</div>
        </div>
        <div className="bg-white border p-5 rounded-2xl shadow-sm">
            <div className="text-xs text-slate-500 mb-2">Driver</div>
            <div className="text-sm font-medium">{trx.driver ? trx.driver.name : "-"}</div>
            <div className="text-xs text-slate-500 mt-4 mb-2">Bukti</div>
            <div className="flex gap-2">
                <div className="border p-2 rounded text-center w-full">
                    <span className="block text-[10px] text-slate-400">Bayar</span>
                    {trx.payment_proof ? <a href={getImageUrl(trx.payment_proof)} target="_blank" className="text-xs text-blue-600 underline">Lihat</a> : "-"}
                </div>
                <div className="border p-2 rounded text-center w-full">
                    <span className="block text-[10px] text-slate-400">Terima</span>
                    {trx.delivery_proof ? <a href={getImageUrl(trx.delivery_proof)} target="_blank" className="text-xs text-blue-600 underline">Lihat</a> : "-"}
                </div>
            </div>
        </div>
      </div>

      {/* TABEL ITEM (Dengan Harga Calculated) */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b font-semibold text-slate-800">Detail Item</div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b text-slate-600">
                    <tr>
                        <th className="px-4 py-3 w-10">No</th>
                        <th className="px-4 py-3">Produk</th>
                        <th className="px-4 py-3 w-24">Qty</th>
                        <th className="px-4 py-3 w-32">Harga</th>
                        <th className="px-4 py-3 w-32">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {trx.details && trx.details.map((it, idx) => (
                        <tr key={idx} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="px-4 py-3">{idx + 1}</td>
                            <td className="px-4 py-3 font-medium">{it.product_name}</td>
                            <td className="px-4 py-3">{it.quantity}</td>
                            {/* Tampilkan Harga yang sudah dihitung di useEffect */}
                            <td className="px-4 py-3 text-slate-700">{formatRupiah(it.calculated_price)}</td>
                            {/* Hitung Subtotal Realtime */}
                            <td className="px-4 py-3 font-medium text-slate-800">
                                {formatRupiah(it.calculated_price * it.quantity)}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold text-slate-800">
                    <tr>
                        <td colSpan={4} className="px-4 py-3 text-right">Total Akhir:</td>
                        <td className="px-4 py-3 text-sky-700">{formatRupiah(trx.total_amount)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
      </div>

      {/* FORM UPDATE */}
      <form onSubmit={onSave} className="bg-white border rounded-2xl shadow-sm p-5">
        <h4 className="font-semibold mb-4">Update Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
                <label className="text-sm font-medium">Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2">
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
            </div>
            <div>
                <label className="text-sm font-medium">Driver</label>
                <select value={driverId} onChange={e => setDriverId(e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2">
                    <option value="">- Pilih -</option>
                    {drivers.map(d => <option key={d.id} value={String(d.id)}>{d.name}</option>)}
                </select>
            </div>
        </div>
        <div className="flex justify-end gap-2">
            <button type="button" onClick={() => navigate("/dashboard/transaksi")} className="px-4 py-2 border rounded-lg hover:bg-slate-50">Batal</button>
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">Simpan</button>
        </div>
      </form>
    </div>
  );
}