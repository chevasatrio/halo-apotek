// src/pages/DeliveryPage.jsx (DUMMY UI ONLY - NO API)
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

function StatusPill({ children, tone = "dark" }) {
  const cls =
    tone === "dark"
      ? "bg-slate-900 text-white"
      : "bg-slate-100 text-slate-700";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {children}
    </span>
  );
}

function StepCircle({ state, number }) {
  // state: done | current | todo
  const base =
    "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300";
  const cls =
    state === "done"
      ? "bg-slate-900 border-slate-900 text-white"
      : state === "current"
      ? "bg-white border-slate-900 text-slate-900 shadow-sm"
      : "bg-white border-slate-200 text-slate-400";

  return (
    <div className={`${base} ${cls}`}>
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
        <span>{number}</span>
      )}
    </div>
  );
}

function HorizontalStatus({ activeStep, steps }) {
  const pct = useMemo(() => {
    if (steps.length <= 1) return 0;
    return Math.round((activeStep / (steps.length - 1)) * 100);
  }, [activeStep, steps.length]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Status Pesanan</h2>
            <p className="mt-1 text-sm text-slate-600">
              (Dummy) Progress menyamping untuk halaman pengiriman.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-slate-500">Progress</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{pct}%</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-5">
        {/* bar */}
        <div className="relative">
          <div className="h-2 w-full rounded-full bg-slate-200" />
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-slate-900 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* steps */}
        <div className="mt-5 grid grid-cols-5 gap-3">
          {steps.map((s, idx) => {
            const state = idx < activeStep ? "done" : idx === activeStep ? "current" : "todo";
            return (
              <div key={s.key} className="flex flex-col items-center text-center">
                <StepCircle state={state} number={idx + 1} />
                <p
                  className={`mt-2 text-xs font-semibold ${
                    idx === activeStep ? "text-slate-900" : "text-slate-600"
                  }`}
                >
                  {s.label}
                </p>
                <p className="mt-1 text-[11px] leading-snug text-slate-500">{s.key}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function DeliveryPage() {
  // dummy flow: shipping -> completed
  const steps = [
    { key: "pending", label: "Checkout" },
    { key: "paid", label: "Pembayaran" },
    { key: "processing", label: "Verifikasi" },
    { key: "shipping", label: "Pengiriman" },
    { key: "completed", label: "Selesai" },
  ];

  // Set initial = shipping (index 3)
  const [activeStep, setActiveStep] = useState(3);
  const [completing, setCompleting] = useState(false);

  // dummy delivery data
  const etaText = "Hari ini, 18:30–20:00";
  const courierName = "Driver (Dummy)";
  const trackingCode = "HLAP-TRK-92841";

  // proof image dummy (placeholder)
  const [hasProof, setHasProof] = useState(false);
  const isCompleted = activeStep >= 4;

  async function markArrived() {
    setCompleting(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      setHasProof(true);
      setActiveStep(4); // completed
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Pengiriman</h1>
              <p className="mt-1 text-sm text-slate-600">
                Pantau estimasi, status pengantaran, dan bukti sampai.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to="/pembeli/payment"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Kembali
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Horizontal status */}
        <HorizontalStatus activeStep={activeStep} steps={steps} />

        <div className="grid gap-6 lg:grid-cols-12">
          {/* LEFT: Shipping content */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tracking / ETA */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Estimasi & Tracking</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      (Dummy) Animasi halus untuk menunjukkan “sedang berjalan”.
                    </p>
                  </div>

                  <StatusPill tone={isCompleted ? "light" : "dark"}>
                    {isCompleted ? "completed" : "shipping"}
                  </StatusPill>
                </div>
              </div>

              <div className="px-5 py-6">
                <div className="grid gap-5 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">ESTIMASI TIBA</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{etaText}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Perkiraan dapat berubah sesuai kondisi jalan.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold text-slate-500">DRIVER</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{courierName}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      Kontak driver akan muncul saat API aktif.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold text-slate-500">KODE TRACKING</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{trackingCode}</p>
                    <p className="mt-2 text-xs text-slate-500">Gunakan untuk referensi internal.</p>
                  </div>
                </div>

                {/* Subtle animation: moving progress strip */}
                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Perjalanan</p>
                      <p className="mt-1 text-sm text-slate-600">
                        {isCompleted
                          ? "Pesanan telah sampai. Silakan lihat bukti foto."
                          : "Driver sedang menuju alamat tujuan."}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {isCompleted ? "Arrived" : "On the way"}
                    </span>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full bg-slate-900 transition-all duration-700 ${
                        isCompleted ? "w-full" : "w-3/5"
                      }`}
                    />
                    {!isCompleted ? (
                      <div className="relative -mt-2 h-2 w-full overflow-hidden rounded-full">
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.65),transparent)] animate-[shimmer_1.4s_linear_infinite]" />
                      </div>
                    ) : null}
                  </div>

                  <style>{`
                    @keyframes shimmer {
                      0% { transform: translateX(-60%); }
                      100% { transform: translateX(120%); }
                    }
                  `}</style>
                </div>

                {/* Action */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-600">
                    Jika pesanan sudah diterima, tandai sebagai <span className="font-semibold">Selesai</span>.
                  </p>
                  <button
                    onClick={markArrived}
                    disabled={isCompleted || completing}
                    className={`rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition
                      ${
                        isCompleted || completing
                          ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                  >
                    {completing ? "Menyelesaikan..." : isCompleted ? "Sudah Selesai" : "Tandai Sudah Sampai"}
                  </button>
                </div>
              </div>
            </div>

            {/* Proof image */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">Bukti Sampai (Foto)</h2>
                <p className="mt-1 text-sm text-slate-600">
                  (Dummy) Foto ini nanti berasal dari driver (delivery_proof).
                </p>
              </div>

              <div className="px-5 py-6">
                {hasProof ? (
                  <div className="grid gap-5 md:grid-cols-2 items-start">
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                      {/* placeholder photo */}
                      <div className="h-full w-full bg-[linear-gradient(135deg,rgba(15,23,42,0.10),rgba(15,23,42,0.03))] flex items-center justify-center">
                        <div className="text-center px-6">
                          <p className="text-sm font-semibold text-slate-900">Foto Bukti (Dummy)</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Nanti tampilkan image asli dari server.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                      <p className="text-sm font-semibold text-slate-900">Detail Bukti</p>
                      <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                          <span>Status</span>
                          <StatusPill>completed</StatusPill>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Waktu</span>
                          <span className="font-semibold text-slate-900">
                            {new Date().toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tracking</span>
                          <span className="font-semibold text-slate-900">{trackingCode}</span>
                        </div>
                      </div>

                      <p className="mt-4 text-xs leading-relaxed text-slate-500">
                        Jika ada kendala, nanti kita bisa tambahkan fitur komplain / bantuan.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-sm font-semibold text-slate-900">Belum ada bukti foto</p>
                    <p className="mt-1 text-sm text-slate-600">
                      Bukti akan muncul setelah driver menyelesaikan pengiriman.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: Summary / help */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-5 py-4">
                  <h2 className="text-base font-semibold text-slate-900">Ringkasan</h2>
                </div>
                <div className="px-5 py-5 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status</span>
                    <span className="font-semibold text-slate-900">{steps[activeStep]?.key}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Estimasi</span>
                    <span className="font-semibold text-slate-900">{etaText}</span>
                  </div>
                  <div className="my-2 h-px bg-slate-100" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">Catatan</span>
                    <span className="text-xs font-semibold text-slate-500">Dummy</span>
                  </div>
                  <p className="text-sm text-slate-600">
                    Setelah status <span className="font-semibold">completed</span>, halaman ini menampilkan bukti foto
                    pengantaran.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-900 p-5 shadow-sm">
                <p className="text-sm font-semibold text-white">Info</p>
                <p className="mt-2 text-sm text-slate-200">
                  Versi dummy ini mensimulasikan perubahan status shipping → completed. Nanti status mengikuti backend.
                </p>
              </div>

              {/* Optional quick actions */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="px-5 py-5">
                  <p className="text-sm font-semibold text-slate-900">Aksi</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setActiveStep(3)}
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Set Shipping
                    </button>
                    <button
                      onClick={() => {
                        setHasProof(true);
                        setActiveStep(4);
                      }}
                      className="flex-1 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Set Completed
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    (Dummy control) Untuk preview tampilan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
