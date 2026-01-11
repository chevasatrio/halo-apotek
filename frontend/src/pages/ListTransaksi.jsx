// src/pages/transaksi/ListTransaksi.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * DUMMY FRONTEND (belum nyambung backend).
 * - Filter pill bunder (seperti filter obat)
 * - Search
 * - Tabel transaksi
 * - Button Detail/Update ke halaman form
 */

const STATUS = [
  { key: "all", label: "Semua" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "processing", label: "Processing" },
  { key: "shipping", label: "Shipping" },
  { key: "done", label: "Done" },
  { key: "cancelled", label: "Cancelled" },
];

const DUMMY_TRANSACTIONS = [
  {
    id: 1,
    invoice_code: "INV-2026-0001",
    buyer: { name: "Budi Pembeli", email: "budi@halo.com" },
    driver: null,
    total_amount: 120000,
    status: "pending",
    created_at: "2026-01-11T09:15:00",
  },
  {
    id: 2,
    invoice_code: "INV-2026-0002",
    buyer: { name: "Siti Pembeli", email: "siti@halo.com" },
    driver: { id: 9, name: "Mas Driver" },
    total_amount: 86000,
    status: "paid",
    created_at: "2026-01-11T10:02:00",
  },
  {
    id: 3,
    invoice_code: "INV-2026-0003",
    buyer: { name: "Rina Pembeli", email: "rina@halo.com" },
    driver: { id: 10, name: "Driver Cepat" },
    total_amount: 215000,
    status: "processing",
    created_at: "2026-01-11T11:40:00",
  },
  {
    id: 4,
    invoice_code: "INV-2026-0004",
    buyer: { name: "Ayu Pembeli", email: "ayu@halo.com" },
    driver: { id: 9, name: "Mas Driver" },
    total_amount: 54000,
    status: "shipping",
    created_at: "2026-01-11T12:10:00",
  },
  {
    id: 5,
    invoice_code: "INV-2026-0005",
    buyer: { name: "Dimas Pembeli", email: "dimas@halo.com" },
    driver: { id: 11, name: "Driver Santai" },
    total_amount: 99000,
    status: "done",
    created_at: "2026-01-10T16:05:00",
  },
  {
    id: 6,
    invoice_code: "INV-2026-0006",
    buyer: { name: "Nia Pembeli", email: "nia@halo.com" },
    driver: null,
    total_amount: 150000,
    status: "cancelled",
    created_at: "2026-01-10T19:25:00",
  },
];

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

function StatusBadge({ status }) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border";
  switch (status) {
    case "pending":
      return (
        <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
          pending
        </span>
      );
    case "paid":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>
          paid
        </span>
      );
    case "processing":
      return (
        <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>
          processing
        </span>
      );
    case "shipping":
      return (
        <span className={`${base} bg-sky-50 text-sky-700 border-sky-200`}>
          shipping
        </span>
      );
    case "done":
      return (
        <span className={`${base} bg-indigo-50 text-indigo-700 border-indigo-200`}>
          done
        </span>
      );
    case "cancelled":
      return (
        <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}>
          cancelled
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
          {status || "-"}
        </span>
      );
  }
}

function FilterPill({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "px-4 py-2 rounded-full text-sm border transition whitespace-nowrap " +
        (active
          ? "bg-sky-600 text-white border-sky-600"
          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50")
      }
    >
      {children}
    </button>
  );
}

export default function ListTransaksi() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const byStatus =
      filter === "all"
        ? DUMMY_TRANSACTIONS
        : DUMMY_TRANSACTIONS.filter((t) => t.status === filter);

    const keyword = q.trim().toLowerCase();
    if (!keyword) return byStatus;

    return byStatus.filter((t) => {
      const inv = String(t.invoice_code || "").toLowerCase();
      const nm = String(t.buyer?.name || "").toLowerCase();
      const em = String(t.buyer?.email || "").toLowerCase();
      return inv.includes(keyword) || nm.includes(keyword) || em.includes(keyword);
    });
  }, [filter, q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Transaksi</h3>
          <p className="text-sm text-slate-500">
            Daftar transaksi masuk dari pembeli.
          </p>
        </div>

        <button
          type="button"
          onClick={() => alert("Dummy: refresh (nanti fetch backend)")}
          className="px-4 py-2 rounded-lg border bg-white text-sm hover:bg-slate-50 transition"
        >
          Refresh
        </button>
      </div>

      {/* Filter pills bunder */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STATUS.map((s) => (
          <FilterPill
            key={s.key}
            active={filter === s.key}
            onClick={() => setFilter(s.key)}
          >
            {s.label}
          </FilterPill>
        ))}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-md">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari invoice / nama / email pembeli…"
              className="w-full px-4 py-2.5 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-sky-200"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="clear"
              >
                ✕
              </button>
            ) : null}
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Total: <span className="font-medium text-slate-700">{filtered.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 w-16">No</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Pembeli</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3 w-44 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    Tidak ada transaksi untuk filter ini.
                  </td>
                </tr>
              ) : (
                filtered.map((t, idx) => (
                  <tr key={t.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {t.invoice_code}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{t.buyer.name}</div>
                      <div className="text-xs text-slate-500">{t.buyer.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      {t.driver?.name ? t.driver.name : "-"}
                    </td>
                    <td className="px-4 py-3">{formatRupiah(t.total_amount)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3">{formatDateTime(t.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/transaksi/${t.id}`)}
                          className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100 transition"
                        >
                          Detail
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/transaksi/${t.id}/edit`)}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
                          title="Update status & assign driver"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
