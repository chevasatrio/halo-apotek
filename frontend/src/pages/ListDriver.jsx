import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../Context/AuthContext"; // sesuaikan kalau path beda
import api from "../services/api"; // sesuaikan kalau path beda

/**
 * DriverList (REAL - Laravel)
 *
 * baseURL api.js => http://127.0.0.1:8000/api
 * Jadi endpoint di sini cukup:
 * - GET  /drivers                 (admin/kasir)
 * - GET  /transactions            (admin/kasir)
 * - GET  /driver/jobs             (driver)
 * - POST /transaction/{id}/complete  (driver, upload delivery_proof)
 *
 * Mapping:
 * - Tab Pengantaran = status shipping
 * - Tab History = status completed
 */

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
    case "shipping":
      return (
        <span className={`${base} bg-sky-50 text-sky-700 border-sky-200`}>
          shipping
        </span>
      );
    case "completed":
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}
        >
          completed
        </span>
      );
    case "processing":
      return (
        <span className={`${base} bg-amber-50 text-amber-700 border-amber-200`}>
          processing
        </span>
      );
    case "paid":
      return (
        <span className={`${base} bg-violet-50 text-violet-700 border-violet-200`}>
          paid
        </span>
      );
    case "pending":
      return (
        <span className={`${base} bg-slate-50 text-slate-700 border-slate-200`}>
          pending
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
          {state || "-"}
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
  const safe = Array.isArray(items) ? items : [];
  const text = safe
    .slice(0, 2)
    .map((it) => `${it?.name ?? "-"} x${it?.qty ?? 1}`)
    .join(", ");
  const more = safe.length > 2 ? ` +${safe.length - 2} item` : "";
  return (
    <div className="text-sm text-slate-700">
      <div className="font-medium">{(text || "-") + more}</div>
    </div>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
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

/* Swipe Confirm */
function SwipeConfirm({
  title = "Geser untuk konfirmasi",
  hint = "Geser tombol ke kanan sampai penuh.",
  confirmText = "Konfirmasi",
  onConfirm,
  accent = "emerald",
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
            disabled ? "text-slate-400 border-slate-200" : "text-slate-600 border-slate-200"
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

/* NORMALIZER untuk TransactionResource */
function normalizeTx(raw) {
  // banyak resource laravel membungkus; kita handle beberapa kemungkinan
  const t = raw?.data ? raw.data : raw;

  const id = t?.id;
  const invoice = t?.invoice_code ?? t?.invoice ?? `#${id ?? "-"}`;

  const u = t?.user;
  const buyer = {
    id: u?.id ?? t?.user_id ?? null,
    name: u?.name ?? "-",
  };

  const address = t?.address ?? "-";
  const status = t?.status ?? "-";
  const created_at = t?.created_at ?? null;
  const driver_id = t?.driver_id ?? t?.driver?.id ?? null;

  const details = Array.isArray(t?.details) ? t.details : [];
  const items = details.map((d) => ({
    name: d?.product?.name ?? d?.product_name ?? "-",
    qty: d?.quantity ?? 1,
  }));

  return { id, invoice, buyer, address, items, status, created_at, driver_id, raw: t };
}

export default function DriverList() {
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase().trim();
  const isDriver = role === "driver";
  const myDriverId = user?.id;

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(() =>
    isDriver ? Number(myDriverId) : null
  );

  const [tab, setTab] = useState("pengantaran"); // pengantaran | history
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState("");

  const [txs, setTxs] = useState([]);

  const [modal, setModal] = useState({ open: false, row: null });
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isDriver && myDriverId) setSelectedDriver(Number(myDriverId));
  }, [isDriver, myDriverId]);

  const fetchDrivers = async () => {
    if (isDriver) return;
    setLoadingDrivers(true);
    setError("");
    try {
      // route Anda: GET /api/drivers
      const res = await api.get("/drivers");
      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const mapped = arr
        .map((u) => ({ id: u.id, name: u.name || u.email || `Driver ${u.id}` }))
        .filter((x) => x.id != null);

      setDrivers(mapped);
      if (!selectedDriver && mapped.length > 0) setSelectedDriver(mapped[0].id);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal memuat daftar driver.");
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    setError("");
    try {
      let res;
      if (isDriver) {
        // route Anda: GET /api/driver/jobs => TransactionController@index
        res = await api.get("/driver/jobs");
      } else {
        // route Anda: GET /api/transactions => TransactionController@index
        res = await api.get("/transactions");
      }

      const arr = Array.isArray(res.data) ? res.data : res.data?.data || [];
      const normalized = arr.map(normalizeTx);

      const filtered = isDriver
        ? normalized.filter((t) => Number(t.driver_id) === Number(myDriverId))
        : normalized.filter((t) => Number(t.driver_id) === Number(selectedDriver));

      setTxs(filtered);
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal memuat data pengantaran.");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver]);

  useEffect(() => {
    if (isDriver && !myDriverId) return;
    if (!isDriver && !selectedDriver) return;
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDriver, myDriverId, selectedDriver]);

  const rows = useMemo(() => {
    const list = Array.isArray(txs) ? txs : [];
    if (tab === "pengantaran") return list.filter((t) => t.status === "shipping");
    return list.filter((t) => t.status === "completed");
  }, [txs, tab]);

  const currentDriverName = useMemo(() => {
    if (isDriver) return user?.name || "Driver";
    return (
      drivers.find((d) => Number(d.id) === Number(selectedDriver))?.name || "-"
    );
  }, [isDriver, user, drivers, selectedDriver]);

  const closeModal = () => {
    if (submitting) return;
    setProofFile(null);
    setModal({ open: false, row: null });
  };

  const openDone = (row) => {
    setError("");
    setProofFile(null);
    setModal({ open: true, row });
  };

  const submitDone = async (txId) => {
    if (!proofFile) {
      setError("Bukti antar wajib diupload (delivery_proof).");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("delivery_proof", proofFile);

      // route Anda: POST /api/transaction/{id}/complete
      await api.post(`/transaction/${txId}/complete`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      closeModal();
      await fetchJobs();
      setTab("history");
    } catch (e) {
      setError(e?.response?.data?.message || "Gagal menyelesaikan pengantaran.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Driver</h3>
          <p className="text-sm text-slate-500">
            {isDriver
              ? "Daftar pengantaran milik Anda."
              : "Pantau tugas pengantaran berdasarkan driver yang dipilih."}
          </p>
        </div>

        {!isDriver ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Pilih driver:</span>
            <select
              value={selectedDriver ?? ""}
              onChange={(e) => setSelectedDriver(Number(e.target.value))}
              disabled={loadingDrivers || drivers.length === 0}
              className="px-4 py-2 rounded-xl border bg-white text-sm outline-none focus:ring-2 focus:ring-sky-200"
            >
              {loadingDrivers ? (
                <option value="">Memuat...</option>
              ) : drivers.length === 0 ? (
                <option value="">Driver kosong</option>
              ) : (
                drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))
              )}
            </select>
          </div>
        ) : (
          <div className="text-sm text-slate-500">
            Driver login:{" "}
            <span className="font-medium text-slate-700">
              {currentDriverName}
            </span>
          </div>
        )}
      </div>

      {error ? (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterPill
          active={tab === "pengantaran"}
          onClick={() => setTab("pengantaran")}
        >
          Pengantaran
        </FilterPill>
        <FilterPill active={tab === "history"} onClick={() => setTab("history")}>
          History
        </FilterPill>

        <div className="ml-auto">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm disabled:opacity-60"
            onClick={fetchJobs}
            disabled={loadingJobs || (!isDriver && !selectedDriver)}
          >
            {loadingJobs ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-800">
              {tab === "pengantaran"
                ? "Daftar Pengantaran"
                : "Riwayat Pengantaran"}
            </div>
            <div className="text-sm text-slate-500">
              Driver:{" "}
              <span className="font-medium text-slate-700">
                {currentDriverName}
              </span>
            </div>
          </div>

          <div className="text-xs text-slate-500">
            {loadingJobs ? "sinkronisasi..." : `${rows.length} data`}
          </div>
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
              {loadingJobs ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    Memuat data...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan={8}>
                    {tab === "pengantaran"
                      ? "Belum ada pengantaran."
                      : "Belum ada riwayat pengantaran."}
                  </td>
                </tr>
              ) : (
                rows.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">{idx + 1}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {r.invoice}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {r.buyer.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        User ID: {r.buyer.id ?? "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-[360px] text-slate-700">
                        {r.address}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ItemsPreview items={r.items} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge state={r.status} />
                    </td>
                    <td className="px-4 py-3">{formatDateTime(r.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {tab === "history" ? (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100 transition"
                            onClick={() =>
                              alert(
                                `Detail (UI)\n\nInvoice: ${r.invoice}\nPembeli: ${r.buyer.name}\nAlamat: ${r.address}`
                              )
                            }
                          >
                            Detail
                          </button>
                        ) : isDriver ? (
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                            onClick={() => openDone(r)}
                          >
                            Done
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400">
                            (Driver menyelesaikan)
                          </span>
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

      {/* Modal Done */}
      <Modal open={modal.open} title="Selesaikan Pengantaran" onClose={closeModal}>
        {modal.row ? (
          <div className="space-y-4">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Invoice</div>
              <div className="mt-1 font-semibold text-slate-800">
                {modal.row.invoice}
              </div>

              <div className="mt-3 text-sm text-slate-500">Tujuan</div>
              <div className="mt-1 text-sm text-slate-700">
                {modal.row.address}
              </div>

              <div className="mt-3 text-sm text-slate-500">Item</div>
              <div className="mt-1 text-sm text-slate-700">
                {(modal.row.items || [])
                  .map((it) => `${it.name} x${it.qty}`)
                  .join(", ") || "-"}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Upload bukti antar (delivery_proof)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                className="mt-2 w-full rounded-xl border bg-white text-sm px-3 py-2"
                disabled={submitting}
              />
              <p className="mt-2 text-xs text-slate-500">Max 2MB, image.</p>
            </div>

            <SwipeConfirm
              title="Konfirmasi pesanan sudah diantar"
              hint="Geser tombol ke kanan untuk menyelesaikan pengantaran."
              confirmText={submitting ? "..." : "Done"}
              accent="emerald"
              disabled={submitting || !proofFile}
              onConfirm={() => submitDone(modal.row.id)}
            />

            <div className="flex justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 transition text-sm disabled:opacity-60"
                disabled={submitting}
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
