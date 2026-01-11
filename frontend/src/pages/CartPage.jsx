import { useEffect, useState } from "react";
import api from "../services/api";

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [selected, setSelected] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await api.get("/cart");
            setCart(res.data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const toggleSelect = (id) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const updateQty = async (id, quantity) => {
        await api.put(`/cart/${id}`, { quantity });
        fetchCart();
    };

    const removeItem = async (id) => {
        await api.delete(`/cart/${id}`);
        fetchCart();
    };

    const total = cart
        .filter((c) => selected.includes(c.id))
        .reduce((s, item) => s + item.product.price * item.quantity, 0);

    const handleCheckout = async () => {
        const res = await api.post("/checkout");
        alert("Checkout berhasil — lanjut upload bukti.");
        console.log(res.data);
    };

    return (
        <div className="min-h-screen bg-sky-50">
            <div className="max-w-6xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold mb-6">Keranjang Belanja</h2>

                {loading ? (
                    <div className="animate-pulse p-6 bg-white rounded-xl shadow">
                        Memuat keranjang...
                    </div>
                ) : cart.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-10 text-center">
                        <p className="text-gray-500 mb-3">
                            Keranjangmu masih kosong
                        </p>
                        <a
                            href="/"
                            className="px-4 py-2 bg-sky-600 text-white rounded-lg"
                        >
                            Belanja Obat
                        </a>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* LEFT: LIST */}
                        <div className="md:col-span-2 space-y-4">
                            {cart.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl p-4 shadow flex gap-4 items-center"
                                >
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-sky-600"
                                        checked={selected.includes(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                    />

                                    <div className="flex-1">
                                        <h4 className="font-semibold">
                                            {item.product.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">
                                            Rp{" "}
                                            {item.product.price.toLocaleString()}
                                        </p>

                                        <div className="flex items-center gap-3 mt-3">
                                            <button
                                                className="px-2 bg-gray-200 rounded"
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.quantity - 1
                                                    )
                                                }
                                                disabled={item.quantity === 1}
                                            >
                                                −
                                            </button>

                                            <span>{item.quantity}</span>

                                            <button
                                                className="px-2 bg-gray-200 rounded"
                                                onClick={() =>
                                                    updateQty(
                                                        item.id,
                                                        item.quantity + 1
                                                    )
                                                }
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        className="text-red-500 text-sm"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        Hapus
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* RIGHT: SUMMARY */}
                        <div className="bg-white rounded-xl shadow p-6 h-fit">
                            <h3 className="font-semibold mb-4">
                                Ringkasan Belanja
                            </h3>

                            <p className="flex justify-between mb-4">
                                <span>Total</span>
                                <b>Rp {total.toLocaleString()}</b>
                            </p>

                            <button
                                disabled={selected.length === 0}
                                onClick={handleCheckout}
                                className="w-full py-3 rounded-xl bg-sky-600 text-white disabled:bg-gray-300"
                            >
                                Checkout Sekarang
                            </button>

                            <p className="text-xs text-gray-500 mt-3">
                                Setelah checkout, lanjut upload bukti
                                pembayaran.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
