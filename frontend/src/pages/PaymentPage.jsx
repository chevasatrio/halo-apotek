// src/pages/PaymentPage.jsx (DUMMY UI ONLY - NO API)
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function formatRupiah(n) {
  const num = Number(n || 0);
  return "Rp " + num.toLocaleString("id-ID");
}

function StepDot({ state }) {
  const base =
    "relative flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300";
  const styles =
    state === "done"
      ? "bg-slate-900 border-slate-900 text-white"
      : state === "current"
      ? "bg-white border-slate-900 text-slate-900 shadow-sm"
      : "bg-white border-slate-200 text-slate-400";

  return (
    <div className={`${base} ${styles}`}>
      {state === "done" ? (
        <svg
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : (
        <span className="text-xs font-semibold">•</span>
      )}

      {state === "current" ? (
        <span className="absolute -inset-1 rounded-full border border-slate-300 animate-pulse" />
      ) : null}
    </div>
  );
}

export default function PaymentPage() {
  // dummy total (nanti dari transaction.total_amount)
  const total = 27000;

  // status step: 0=pending, 1=paid, ...
  const steps = [
    { key: "pending", label: "Checkout", helper: "Transaksi dibuat (pending)" },
    { key: "paid", label: "Pembayaran", helper: "Menunggu verifikasi pembayaran (paid)" },
    { key: "processing", label: "Verifikasi", helper: "Admin verifikasi (processing)" },
    { key: "shipping", label: "Pengiriman", helper: "Driver mengantar (shipping)" },
    { key: "completed", label: "Selesai", helper: "Pesanan selesai (completed)" },
  ];

  // Default: baru checkout -> pending
  const [activeStep, setActiveStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [paidAt, setPaidAt] = useState(null);

  const currentStatus = useMemo(() => steps[activeStep]?.key || "pending", [activeStep]);

  async function handleAlreadyPaid() {
    setVerifying(true);
    try {
      // dummy simulate verification click
      await new Promise((r) => setTimeout(r, 700));
      setActiveStep(1); // paid
      setPaidAt(new Date());
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Pembayaran
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Scan QRIS untuk membayar, lalu klik tombol verifikasi.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/pembeli/checkout"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: QRIS + actions */}
          <div className="lg:col-span-8 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">QRIS</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Scan QR di bawah ini menggunakan aplikasi e-wallet / m-banking.
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    Status: {currentStatus}
                  </span>
                </div>
              </div>

              <div className="px-5 py-6">
                {/* QR placeholder (rapi, tidak memalukan) */}
                <div className="grid gap-6 md:grid-cols-2 items-start">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="aspect-square w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="h-full w-full rounded-xl bg-[linear-gradient(90deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.08)_25%,transparent_25%,transparent_50%,rgba(15,23,42,0.08)_50%,rgba(15,23,42,0.08)_75%,transparent_75%,transparent_100%)] bg-[length:24px_24px] flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-800">QRIS (Dummy)</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Nanti diganti gambar QR asli dari backend/static.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <p className="text-xs font-semibold text-slate-500">TOTAL TAGIHAN</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {formatRupiah(total)}
                      </p>
                      {paidAt ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Terakhir klik “sudah bayar” pada:{" "}
                          <span className="font-semibold">
                            {paidAt.toLocaleString("id-ID")}
                          </span>
                        </p>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500">
                          Setelah membayar, klik tombol verifikasi di samping.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5">
                    <p className="text-sm font-semibold text-slate-900">Instruksi</p>
                    <ol className="mt-3 space-y-2 text-sm text-slate-600">
                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>Scan QRIS dan lakukan pembayaran sesuai total tagihan.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>
                          Setelah sukses, klik <span className="font-semibold">Saya Sudah Bayar</span>.
                        </span>
                      </li>
                      <li className="flex gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-400" />
                        <span>
                          Status akan berubah menjadi <span className="font-semibold">paid</span> (dummy).
                        </span>
                      </li>
                    </ol>

                    <button
                      onClick={handleAlreadyPaid}
                      disabled={verifying || activeStep >= 1}
                      className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition
                        ${
                          verifying || activeStep >= 1
                            ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                            : "bg-slate-900 text-white hover:bg-slate-800"
                        }`}
                    >
                      {verifying
                        ? "Memverifikasi..."
                        : activeStep >= 1
                        ? "Sudah Dibayar"
                        : "Saya Sudah Bayar / Lakukan Verifikasi"}
                    </button>

                    <p className="mt-3 text-xs leading-relaxed text-slate-500">
                      (Dummy) Nanti tombol ini akan memanggil endpoint upload/konfirmasi pembayaran.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional info card */}
            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-sm">
              <p className="text-sm font-semibold text-white">Catatan</p>
              <p className="mt-2 text-sm text-slate-200">
                Jika pembayaran sudah dilakukan tetapi status belum berubah, pastikan nominal sesuai dan coba ulang
                verifikasi.
              </p>
            </div>
          </div>

          {/* RIGHT: Alur Status (interactive) */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-slate-900">Alur Status</h2>
                    <span className="text-xs font-semibold text-slate-500">
                      Step {activeStep + 1}/{steps.length}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Progres akan berhenti di <span className="font-semibold">paid</span> setelah verifikasi.
                  </p>
                </div>

                <div className="px-5 py-5">
                  <ol className="relative">
                    <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-200" />
                    <div className="space-y-4">
                      {steps.map((s, idx) => {
                        const state =
                          idx < activeStep ? "done" : idx === activeStep ? "current" : "todo";

                        return (
                          <li key={s.key} className="relative flex items-start gap-4">
                            <div className="relative z-10">
                              <StepDot state={state} />
                            </div>

                            <div
                              className={`flex-1 rounded-xl border px-4 py-3 transition-all duration-300
                                ${
                                  idx === activeStep
                                    ? "border-slate-300 bg-slate-50 shadow-sm"
                                    : "border-slate-200 bg-white"
                                }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {idx + 1}. {s.label}
                                  </p>
                                  <p className="mt-1 text-sm text-slate-600">{s.helper}</p>
                                </div>

                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold
                                    ${
                                      idx === activeStep
                                        ? "bg-slate-900 text-white"
                                        : idx < activeStep
                                        ? "bg-slate-100 text-slate-700"
                                        : "bg-slate-50 text-slate-500"
                                    }`}
                                >
                                  {s.key}
                                </span>
                              </div>

                              {idx === activeStep ? (
                                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                                  <div className="h-full w-full origin-left animate-[progress_900ms_ease-out] bg-slate-900" />
                                </div>
                              ) : null}
                            </div>
                          </li>
                        );
                      })}
                    </div>
                  </ol>

                  <style>{`
                    @keyframes progress {
                      0% { transform: scaleX(0); }
                      100% { transform: scaleX(1); }
                    }
                  `}</style>
                </div>
              </div>

              {/* Tip */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-slate-900">Tips</p>
                  <p className="mt-2 text-sm text-slate-600">
                    Untuk tahap dummy ini, klik “Saya Sudah Bayar” akan mengunci status ke <span className="font-semibold">paid</span>.
                    Setelah itu nanti proses berlanjut oleh admin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>{/* end grid */}
      </div>
    </div>
  );
}
