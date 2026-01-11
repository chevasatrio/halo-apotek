// src/pages/transaksi/TransaksiForm.jsx
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

/**
 * DUMMY FRONTEND (belum nyambung backend).
 * - Menampilkan header transaksi + tabel transaction_details dummy
 * - Form update status & assign driver (manual)
 * - Tombol simpan hanya simulate (alert)
 */

const STATUS_OPTIONS = [
  "pending",
  "paid",
  "processing",
  "shipping",
  "done",
  "cancelled",
];

const DUMMY_DRIVERS = [
  { id: 3, name: "Mas Driver", email: "driver@halo.com" },
  { id: 4, name: "Driver Cepat", email: "cepat@halo.com" },
  { id: 5, name: "Driver Santai", email: "santai@halo.com" },
];

const DUMMY_TRANSACTIONS_MAP = {
  1: {
    id: 1,
    invoice_code: "INV-2026-0001",
    buyer: { name: "Budi Pembeli", email: "budi@halo.com" },
    driver_id: null,
    total_amount: 120000,
    status: "pending",
    payment_proof: null,
    delivery_proof: null,
    created_at: "2026-01-11T09:15:00",
    details: [
      { id: 11, product_name: "Paracetamol 500mg", quantity: 2, price: 12000 },
      { id: 12, product_name: "Vitamin C", quantity: 1, price: 96000 },
    ],
  },
  2: {
    id: 2,
    invoice_code: "INV-2026-0002",
    buyer: { name: "Siti Pembeli", email: "siti@halo.com" },
    driver_id: 3,
    total_amount: 86000,
    status: "paid",
    payment_proof: "payment.jpg",
    delivery_proof: null,
    created_at: "2026-01-11T10:02:00",
    details: [
      { id: 21, product_name: "Amoxicillin 500mg", quantity: 1, price: 45000 },
      { id: 22, product_name: "Obat Demam Anak", quantity: 2, price: 20500 },
    ],
  },
  3: {
    id: 3,
    invoice_code: "INV-2026-0003",
    buyer: { name: "Rina Pembeli", email: "rina@halo.com" },
    driver_id: 4,
    total_amount: 215000,
    status: "processing",
    payment_proof: "payment.jpg",
    delivery_proof: null,
    created_at: "2026-01-11T11:40:00",
    details: [
      { id: 31, product_name: "Antibiotik A", quantity: 1, price: 125000 },
      { id: 32, product_name: "Antiparasit", quantity: 1, price: 90000 },
    ],
  },
};

function formatRupiah(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDateTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function StatusPill({ value }) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">
      {value}
    </span>
  );
}

export default function TransaksiForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const trx = useMemo(() => DUMMY_TRANSACTIONS_MAP[id], [id]);

  const [status, setStatus] = useState(trx?.status || "pending");
  const [driverId, setDriverId] = useState(trx?.driver_id ? String(trx.driver_id) : "");

  const assignedDriver = useMemo(() => {
    if (!driverId) return null;
    return DUMMY_DRIVERS.find((d) => String(d.id) === String(driverId)) || null;
  }, [driverId]);

  const detailsSubtotal = useMemo(() => {
    if (!trx?.details?.length) return 0;
    return trx.details.reduce(
      (acc, it) => acc + Number(it.price || 0) * Number(it.quantity || 0),
      0
    );
  }, [trx]);

  if (!trx) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm p-6">
        <div className="text-slate-700 font-semibold">Transaksi tidak ditemukan</div>
        <p className="text-sm text-slate-500 mt-1">
          Ini dummy. Pastikan ID ada di dummy map.
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/transaksi")}
          className="mt-4 px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
        >
          Kembali
        </button>
      </div>
    );
  }

  const onSave = (e) => {
    e.preventDefault();
    alert(
      `Dummy Save\n\nInvoice: ${trx.invoice_code}\nStatus: ${status}\nDriver: ${
        assignedDriver ? assignedDriver.name : "(none)"
      }\n\n(Nanti diganti PATCH ke backend)`
    );
    navigate("/dashboard/transaksi");
  };

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            Transaksi {trx.invoice_code}
          </h3>
          <p className="text-sm text-slate-500">
            Detail transaksi + update status & assign driver (dummy).
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
        >
          Kembali
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <div className="text-xs text-slate-500">Invoice</div>
          <div className="mt-1 text-base font-semibold text-slate-800">
            {trx.invoice_code}
          </div>
          <div className="mt-3 text-xs text-slate-500">Tanggal</div>
          <div className="mt-1 text-sm text-slate-700">{formatDateTime(trx.created_at)}</div>
          <div className="mt-3 text-xs text-slate-500">Status saat ini</div>
          <div className="mt-1">
            <StatusPill value={trx.status} />
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <div className="text-xs text-slate-500">Pembeli</div>
          <div className="mt-1 text-sm font-medium text-slate-800">{trx.buyer.name}</div>
          <div className="mt-1 text-xs text-slate-500">{trx.buyer.email}</div>

          <div className="mt-4 text-xs text-slate-500">Total</div>
          <div className="mt-1 text-base font-semibold text-slate-800">
            {formatRupiah(trx.total_amount)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Subtotal item (dummy): {formatRupiah(detailsSubtotal)}
          </div>
        </div>

        <div className="bg-white border rounded-2xl shadow-sm p-5">
          <div className="text-xs text-slate-500">Bukti</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3 bg-slate-50">
              <div className="text-xs text-slate-500">Pembayaran</div>
              <div className="mt-1 text-sm text-slate-700">
                {trx.payment_proof ? "Ada" : "Belum ada"}
              </div>
            </div>
            <div className="rounded-xl border p-3 bg-slate-50">
              <div className="text-xs text-slate-500">Pengantaran</div>
              <div className="mt-1 text-sm text-slate-700">
                {trx.delivery_proof ? "Ada" : "Belum ada"}
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-500">Driver saat ini</div>
          <div className="mt-1 text-sm text-slate-700">
            {trx.driver_id
              ? DUMMY_DRIVERS.find((d) => d.id === trx.driver_id)?.name || `Driver #${trx.driver_id}`
              : "-"}
          </div>
        </div>
      </div>

      {/* Details table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b">
          <h4 className="font-semibold text-slate-800">Detail Item</h4>
          <p className="text-sm text-slate-500">
            Ini dummy dari tabel <span className="font-medium">transaction_details</span>.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 w-16">No</th>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3 w-28">Qty</th>
                <th className="px-4 py-3 w-40">Harga</th>
                <th className="px-4 py-3 w-40">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {trx.details.map((it, idx) => {
                const qty = Number(it.quantity || 0);
                const price = Number(it.price || 0);
                return (
                  <tr key={it.id} className="border-b last:border-b-0">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{it.product_name}</div>
                      <div className="text-xs text-slate-500">ID detail: {it.id}</div>
                    </td>
                    <td className="px-4 py-3">{qty}</td>
                    <td className="px-4 py-3">{formatRupiah(price)}</td>
                    <td className="px-4 py-3">{formatRupiah(price * qty)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update form */}
      <form onSubmit={onSave} className="bg-white border rounded-2xl shadow-sm p-5">
        <h4 className="font-semibold text-slate-800">Update Transaksi</h4>
        <p className="text-sm text-slate-500 mt-1">
          Kasir/Admin dapat mengubah status dan memilih driver secara manual.
        </p>

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-sky-200"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              Saran alur: pending → paid → processing → shipping → done
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Assign Driver</label>
            <select
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              className="mt-2 w-full px-4 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-sky-200"
            >
              <option value="">— Belum ditentukan —</option>
              {DUMMY_DRIVERS.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name} ({d.email})
                </option>
              ))}
            </select>

            <div className="mt-2 text-xs text-slate-500">
              Preview:{" "}
              <span className="font-medium text-slate-700">
                {assignedDriver ? assignedDriver.name : "Belum ada driver"}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/dashboard/transaksi")}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition text-sm"
          >
            Simpan Perubahan (Dummy)
          </button>
        </div>
      </form>
    </div>
  );
}
