import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

function IconCart() {
    return (
        <svg
            className="w-4 h-4 text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.5 14h12L22 6H6" />
        </svg>
    );
}

function IconChat() {
    return (
        <svg
            className="w-4 h-4 text-slate-700"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 11.5a7.5 7.5 0 0 1-10.9 6.7L5 19l.8-4A7.5 7.5 0 1 1 21 11.5z" />
            <path d="M8 11h5" />
            <path d="M8 8h8" />
        </svg>
    );
}

export default function Hero() {
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [cartCount, setCartCount] = useState(0);

    const unreadChat = 1;
    const userName = localStorage.getItem("user_name") || "User";
    const role = (localStorage.getItem("user_role") || "").toLowerCase();
    const token = localStorage.getItem("token");

    // ===== HERO TITLE TYPING =====
    const fullText = "Obat Resmi, Aman, & Sampai ke Rumah";
    const [typed, setTyped] = useState("");

    useEffect(() => {
        let i = 0;
        const typing = setInterval(() => {
            setTyped(fullText.slice(0, i++));
            if (i > fullText.length) clearInterval(typing);
        }, 40);
        return () => clearInterval(typing);
    }, []);

    // ===== SEARCH SUGGESTION TYPING =====
    const suggestions = [
        "Paracetamol",
        "Vitamin C",
        "Obat maag",
        "Sirup batuk anak",
    ];
    const [placeholder, setPlaceholder] = useState("");
    const [index, setIndex] = useState(0);
    const [char, setChar] = useState(0);

    useEffect(() => {
        const typing = setInterval(() => {
            setPlaceholder(suggestions[index].slice(0, char + 1));
            setChar((c) => c + 1);
        }, 60);

        if (char === suggestions[index].length) {
            clearInterval(typing);
            setTimeout(() => {
                setChar(0);
                setIndex((i) => (i + 1) % suggestions.length);
                setPlaceholder("");
            }, 1200);
        }

        return () => clearInterval(typing);
    }, [char, index]);

    // ===== LOAD CART COUNT =====
    useEffect(() => {
        const loadCart = async () => {
            if (!token || role !== "pembeli") {
                setCartCount(0);
                return;
            }

            try {
                const res = await api.get("/cart");
                const items = Array.isArray(res.data) ? res.data : [];
                setCartCount(items.length);
            } catch {
                setCartCount(0);
            }
        };

        loadCart();
    }, [token, role]);

    // ===== NAV: GO TO OBAT PAGE WITH QUERY =====
    const goToObat = (useKeyword = true) => {
        const q = (search || "").trim();

        // kirim lewat state biar tidak hilang walau URL dibersihkan
        navigate("/pembeli/obat", {
            state: { q: useKeyword ? q : "" },
        });
    };

    const onSearchSubmit = (e) => {
        e.preventDefault();
        goToObat(true);
    };

    return (
        <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-sky-100" />

            <div className="relative max-w-6xl mx-auto px-6 py-16">
                {/* ===== TOP BAR ===== */}
                <div className="flex items-center justify-between mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Apotek Online & Delivery Cepat
                    </div>

                    <div className="flex items-center gap-2">
                        {/* CART */}
                        <Link
                            to="/cart"
                            className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-sky-50 transition"
                            aria-label="Cart"
                        >
                            <IconCart />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center px-1">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button className="relative w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-sky-50 transition">
                            <IconChat />
                            {unreadChat > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-emerald-500 text-white text-[10px] flex items-center justify-center px-1">
                                    {unreadChat}
                                </span>
                            )}
                        </button>

                        <div className="hidden sm:flex items-center gap-2 bg-white/80 border border-slate-200 rounded-full px-3 py-1 shadow-sm">
                            <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-[11px] font-semibold">
                                {userName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-xs text-slate-700">
                                Halo,&nbsp;
                                <span className="font-semibold">
                                    {userName}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* ===== GRID CONTENT ===== */}
                <div className="grid md:grid-cols-2 gap-10 items-center">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
                            Halo-Apotek —{" "}
                            <span className="border-r-2 border-sky-500 pr-1">
                                {typed}
                            </span>
                        </h1>

                        <p className="mt-4 text-slate-700 text-sm md:text-base font-medium relative inline-block animate-[highlight_4s_ease-in-out_infinite]">
                            Pesan obat tanpa antre,{" "}
                            <span className="font-semibold text-sky-700">
                                konsultasi dengan apoteker
                            </span>
                            , dan lacak pesanan kamu secara real-time langsung
                            dari satu aplikasi.
                        </p>

                        {/* SEARCH BAR */}
                        <form
                            onSubmit={onSearchSubmit}
                            className="mt-6 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl shadow-sm flex items-center p-2"
                        >
                            <input
                                className="flex-1 px-3 py-2 outline-none text-sm md:text-base bg-transparent"
                                placeholder={`Cari ${placeholder}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 transition"
                            >
                                Cari
                            </button>
                        </form>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => goToObat(true)}
                                className="px-5 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-700 transition"
                            >
                                Pesan Sekarang
                            </button>
                            <button
                                type="button"
                                className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                            >
                                Konsultasi Apoteker
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-500">
                            <span>✓ Obat resmi & bersertifikat</span>
                            <span>✓ Pengiriman 1–3 jam area tertentu</span>
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <div className="flex justify-center md:justify-end">
                        <div className="relative">
                            <div className="w-72 md:w-80 h-52 md:h-64 rounded-3xl bg-white shadow-xl border border-slate-100 p-4 flex flex-col justify-between animate-[float_4s_ease-in-out_infinite] relative overflow-hidden">
                                <div>
                                    <p className="text-xs text-slate-500">
                                        Pesanan Aktif
                                    </p>
                                    <p className="text-lg font-semibold text-slate-900 mt-1 animate-pulse">
                                        Paket obat sedang diantar
                                    </p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <div>
                                        <p className="text-[11px]">
                                            Estimasi tiba
                                        </p>
                                        <p className="font-semibold text-slate-800">
                                            30–45 menit
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px]">Kurir</p>
                                        <p className="font-semibold text-slate-800">
                                            Rendi • HLO-092
                                        </p>
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100">
                                    <div className="h-full bg-sky-500 animate-[progress_4s_linear_infinite]" />
                                </div>
                            </div>

                            <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl shadow-md border border-slate-100 px-4 py-2 text-xs">
                                ⭐ 4.8 / 5 dari 2.300+ pesanan
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes highlight {
          0%,100% { background-color: transparent; }
          40% { background-color: rgba(186, 230, 253, 0.35); }
          60% { background-color: rgba(186, 230, 253, 0.35); }
        }
      `}</style>
        </section>
    );
}
