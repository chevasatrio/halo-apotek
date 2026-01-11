import { useEffect } from "react";

export default function Toast({ open, message, type = "success", onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 2400);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  const styles =
    type === "error"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-sky-200 bg-white/80 text-slate-700";

  const dot = type === "error" ? "bg-rose-500" : "bg-emerald-500";

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <div
        className={`backdrop-blur rounded-2xl border shadow-lg px-4 py-3 flex items-start gap-3 animate-[toastIn_.25s_ease-out] ${styles}`}
      >
        <span className={`mt-1 w-2 h-2 rounded-full ${dot}`} />
        <div className="text-sm">
          <p className="font-semibold">
            {type === "error" ? "Gagal" : "Berhasil"}
          </p>
          <p className="text-xs text-slate-500">{message}</p>
        </div>

        <button
          className="ml-2 text-slate-400 hover:text-slate-600 text-sm"
          onClick={onClose}
          aria-label="Close toast"
        >
          ✕
        </button>
      </div>

      <style>{`
        @keyframes toastIn {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
