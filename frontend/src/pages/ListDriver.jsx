// src/pages/driver/DriverList.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * DRIVER LIST (DUMMY - tanpa backend)
 * - Tab filter pill: Pengantaran | History
 * - Admin control: pilih driver untuk melihat tugas masing-masing
 * - Tabel: No, Invoice, Nama Pembeli, Alamat, Obat, Status, Waktu, Aksi
 * - Modal Start + modal Done dengan Swipe/Drag confirm (bukan range slider)
 *
 * NOTE:
 * - Nanti ketika role driver beneran, selector driver bisa dihapus dan otomatis pakai user login.
 * - Alamat nanti dari API detail user. Sekarang dummy.
 */

const DRIVERS = [
  { id: 3, name: "Mas Driver" },
  { id: 4, name: "Driver Cepat" },
  { id: 5, name: "Driver Santai" },
];

const DUMMY_DELIVERIES = [
  {
    id: 101,
    invoice: "INV-2026-0101",
    buyer: { id: 21, name: "Budi Pembeli" },
    address:
      "Jl. Sawo No. 12, Banyumanik, Semarang (Patokan: dekat minimarket)",
    items: [
      { name: "Paracetamol 500mg", qty: 2 },
      { name: "Vitamin C", qty: 1 },
    ],
    driver_id: 3,
    delivery_state: "assigned", // assigned | on_the_way | done
    created_at: "2026-01-11T12:10:00",
  },
  {
    id: 102,
    invoice: "INV-2026-0102",
    buyer: { id: 22, name: "Siti Pembeli" },
    address: "Jl. Melati Raya No. 7, Tembalang, Semarang",
    items: [{ name: "Amoxicillin 500mg", qty: 1 }],
    driver_id: 3,
    delivery_state: "on_the_way",
    created_at: "2026-01-11T12:35:00",
  },
  {
    id: 103,
    invoice: "INV-2026-0103",
    buyer: { id: 23, name: "Rina Pembeli" },
    address: "Perum Griya Asri Blok C2, Pedurungan, Semarang",
    items: [
      { name: "Antiparasit", qty: 1 },
      { name: "Vitamin Kucing", qty: 2 },
      { name: "Salep Luka", qty: 1 },
    ],
    driver_id: 4,
    delivery_state: "done",
    created_at: "2026-01-10T16:05:00",
  },
  {
    id: 104,
    invoice: "INV-2026-0104",
    buyer: { id: 24, name: "Ayu Pembeli" },
    address: "Jl. Nangka No. 88, Ngaliyan, Semarang",
    items: [{ name: "Obat Demam", qty: 2 }],
    driver_id: 5,
    delivery_state: "done",
    created_at: "2026-01-10T18:12:00",
  },
];

/* -------------------- Utils -------------------- */
function formatDateTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return String(ts);
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

function StatusBadge({ state }) {
  const base =
    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border";
  switch (state) {
    case "assigned":
      return (
        <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
          siap antar
        </span>
      );
    case "on_the_way":
      return (
        <span className={`${base} bg-sky-50 text-sky-700 border-sky-200`}>
          sedang mengantar
        </span>
      );
    case "done":
      return (
        <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}>
          selesai
        </span>
      );
    default:
      return (
        <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
          -
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

function ItemsPreview({ items }) {
  const text = items
    .slice(0, 2)
    .map((it) => `${it.name} x${it.qty}`)
    .join(", ");
  const more = items.length > 2 ? ` +${items.length - 2} item` : "";
  return (
    <div className="text-sm text-slate-700">
      <div className="font-medium">{text + more}</div>
    </div>
  );
}

/* -------------------- Modal -------------------- */
function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border overflow-hidden">
          <div className="px-5 py-4 border-b">
            <div className="text-base font-semibold text-slate-800">{title}</div>
          </div>
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Swipe Confirm (Drag) -------------------- */
function SwipeConfirm({
  title = "Geser untuk konfirmasi",
  hint = "Geser tombol ke kanan sampai penuh.",
  confirmText = "Konfirmasi",
  onConfirm,
  accent = "sky", // "sky" | "emerald"
  disabled = false,
}) {
  const trackRef = useRef(null);
  const knobRef = useRef(null);

  const [dragging, setDragging] = useState(false);
  const [x, setX] = useState(0);
  const [confirmed, setConfirmed] = useState(false);

  const styles = useMemo(() => {
    const isGreen = accent === "emerald";
    return {
      wrap: isGreen ? "border-emerald-200 bg-emerald-50" : "border-sky-200 bg-sky-50",
      text: isGreen ? "text-emerald-700" : "text-sky-700",
      knob: isGreen ? "bg-emerald-600" : "bg-sky-600",
      knobHover: isGreen ? "hover:bg-emerald-700" : "hover:bg-sky-700",
      fill: isGreen ? "bg-emerald-200/70" : "bg-sky-200/70",
      ring: isGreen ? "ring-emerald-200" : "ring-sky-200",
      done: isGreen ? "bg-emerald-600" : "bg-sky-600",
    };
  }, [accent]);

  const getMaxX = () => {
    const track = trackRef.current;
    const knob = knobRef.current;
    if (!track || !knob) return 0;
    return Math.max(0, track.clientWidth - knob.clientWidth);
  };

  const setFromClientX = (clientX) => {
    const track = trackRef.current;
    const knob = knobRef.current;
    if (!track || !knob) return;

    const rect = track.getBoundingClientRect();
    const knobW = knob.clientWidth;
    const maxX = getMaxX();

    let next = clientX - rect.left - knobW / 2;
    next = Math.max(0, Math.min(maxX, next));

    setX(next);

    if (next >= maxX * 0.95 && !confirmed) {
      setConfirmed(true);
      setDragging(false);
      setX(maxX);
      setTimeout(() => onConfirm?.(), 150);
    }
  };

  const onPointerDown = (e) => {
    if (disabled || confirmed) return;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setFromClientX(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!dragging || disabled || confirmed) return;
    setFromClientX(e.clientX);
  };

  const onPointerUp = () => {
    if (disabled || confirmed) return;
    setDragging(false);

    const maxX = getMaxX();
    if (x < maxX * 0.95) setX(0);
  };

  useEffect(() => {
    const onResize = () => {
      const maxX = getMaxX();
      setX((prev) => Math.min(prev, maxX));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const maxX = getMaxX();
  const progress = maxX === 0 ? 0 : Math.round((x / maxX) * 100);

  return (
    <div className={`rounded-2xl border ${styles.wrap} p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">{title}</div>
          <div className={`text-xs mt-1 ${styles.text}`}>{hint}</div>
        </div>

        <div
          className={`text-xs px-2 py-1 rounded-full border bg-white ${
            disabled
              ? "text-slate-400 border-slate-200"
              : "text-slate-600 border-slate-200"
          }`}
        >
          {confirmed ? "OK" : `${progress}%`}
        </div>
      </div>

      <div
        ref={trackRef}
        className={`mt-4 relative h-12 rounded-full border bg-white overflow-hidden ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <div
          className={`absolute inset-y-0 left-0 ${styles.fill}`}
          style={{ width: `calc(${progress}% + 24px)` }}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-sm font-medium text-slate-500">
            {confirmed ? "Berhasil" : "Geser untuk konfirmasi"}
          </div>
        </div>

        <button
          ref={knobRef}
          type="button"
          disabled={disabled || confirmed}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={[
            "absolute top-1 left-1 h-10 w-28 rounded-full text-white text-sm font-semibold",
            "shadow-sm active:scale-[0.99] transition",
            dragging ? "cursor-grabbing" : "cursor-grab",
            confirmed ? styles.done : `${styles.knob} ${styles.knobHover}`,
            "focus:outline-none focus:ring-4",
            styles.ring,
          ].join(" ")}
          style={{
            transform: `translateX(${x}px)`,
            transition: dragging ? "none" : "transform 220ms ease",
          }}
        >
          {confirmed ? "OK" : confirmText}
        </button>
      </div>

      <div className="mt-3 text-xs text-slate-600">
        {confirmed ? "Konfirmasi berhasil." : "Tarik tombol ke kanan sampai penuh."}
      </div>
    </div>
  );
}

/* -------------------- Page -------------------- */
export default function DriverList() {
  const [selectedDriver, setSelectedDriver] = useState(DRIVERS[0].id);
  const [tab, setTab] = useState("pengantaran"); // pengantaran | history

  const [modal, setModal] = useState({
    open: false,
    type: null, // start | done
    row: null,
  });

  const [data, setData] = useState(DUMMY_DELIVERIES);

  const rows = useMemo(() => {
    const mine = data.filter((d) => d.driver_id === selectedDriver);
    return tab === "pengantaran"
      ? mine.filter((d) => d.delivery_state !== "done")
      : mine.filter((d) => d.delivery_state === "done");
  }, [data, selectedDriver, tab]);

  const closeModal = () => setModal({ open: false, type: null, row: null });

  const openStart = (row) => setModal({ open: true, type: "start", row });
  const openDone = (row) => setModal({ open: true, type: "done", row });

  const applyStart = (id) => {
    setData((prev) =>
      prev.map((x) => (x.id === id ? { ...x, delivery_state: "on_the_way" } : x))
    );
    closeModal();
  };

  const applyDone = (id) => {
    setData((prev) =>
      prev.map((x) => (x.id === id ? { ...x, delivery_state: "done" } : x))
    );
    closeModal();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Driver</h3>
          <p className="text-sm text-slate-500">
            Pantau tugas pengantaran berdasarkan driver yang di-assign oleh kasir/admin.
          </p>
        </div>

        {/* Admin control: pilih driver */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Pilih driver:</span>
          <select
            value={selectedDriver}
            onChange={(e) => setSelectedDriver(Number(e.target.value))}
            className="px-4 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-sky-200"
          >
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs / Filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterPill active={tab === "pengantaran"} onClick={() => setTab("pengantaran")}>
          Pengantaran
        </FilterPill>
        <FilterPill active={tab === "history"} onClick={() => setTab("history")}>
          History
        </FilterPill>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-800">
              {tab === "pengantaran" ? "Daftar Pengantaran" : "Riwayat Pengantaran"}
            </div>
            <div className="text-sm text-slate-500">
              Driver:{" "}
              <span className="font-medium text-slate-700">
                {DRIVERS.find((d) => d.id === selectedDriver)?.name}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
            onClick={() => alert("Dummy refresh (nanti fetch backend)")}
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1150px] w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr className="text-left text-slate-600">
                <th className="px-4 py-3 w-16">No</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Nama Pembeli</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Obat</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3 w-40 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    {tab === "pengantaran"
                      ? "Belum ada pengantaran untuk driver ini."
                      : "Belum ada riwayat pengantaran."}
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr key={r.id} className="border-b last:border-b-0 hover:bg-slate-50">
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.invoice}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{r.buyer.name}</div>
                      <div className="text-xs text-slate-500">User ID: {r.buyer.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[360px] text-slate-700">{r.address}</div>
                    </td>
                    <td className="px-4 py-3">
                      <ItemsPreview items={r.items} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge state={r.delivery_state} />
                    </td>
                    <td className="px-4 py-3">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        {tab === "history" ? (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100 transition"
                            onClick={() =>
                              alert(
                                `Detail (dummy)\n\nInvoice: ${r.invoice}\nPembeli: ${r.buyer.name}\nAlamat: ${r.address}`
                              )
                            }
                          >
                            Detail
                          </button>
                        ) : r.delivery_state === "assigned" ? (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition"
                            onClick={() => openStart(r)}
                          >
                            Start
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            onClick={() => openDone(r)}
                          >
                            Done
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal START */}
      <Modal
        open={modal.open && modal.type === "start"}
        title="Mulai Pengantaran"
        onClose={closeModal}
      >
        {modal.row ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Invoice</div>
              <div className="mt-1 font-semibold text-slate-800">{modal.row.invoice}</div>

              <div className="mt-3 text-sm text-slate-500">Tujuan</div>
              <div className="mt-1 text-sm text-slate-700">{modal.row.address}</div>

              <div className="mt-3 text-sm text-slate-500">Item</div>
              <div className="mt-1 text-sm text-slate-700">
                {modal.row.items.map((it) => `${it.name} x${it.qty}`).join(", ")}
              </div>
            </div>

            <div className="text-sm text-slate-700">
              Apakah Anda siap memulai pengantaran untuk pesanan ini?
            </div>

            <SwipeConfirm
              title="Konfirmasi mulai mengantar"
              hint="Geser tombol ke kanan untuk memulai pengantaran."
              confirmText="Mulai"
              accent="sky"
              onConfirm={() => applyStart(modal.row.id)}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Modal DONE */}
      <Modal
        open={modal.open && modal.type === "done"}
        title="Selesaikan Pengantaran"
        onClose={closeModal}
      >
        {modal.row ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Invoice</div>
              <div className="mt-1 font-semibold text-slate-800">{modal.row.invoice}</div>

              <div className="mt-3 text-sm text-slate-500">Tujuan</div>
              <div className="mt-1 text-sm text-slate-700">{modal.row.address}</div>
            </div>

            <div className="text-sm text-slate-700">
              Pastikan pesanan sudah diterima pembeli. Jika sudah yakin, selesaikan pengantaran.
            </div>

            <SwipeConfirm
              title="Konfirmasi pesanan sudah diantar"
              hint="Geser tombol ke kanan untuk menyelesaikan pengantaran."
              confirmText="Done"
              accent="emerald"
              onConfirm={() => applyDone(modal.row.id)}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm"
              >
                Batal
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
