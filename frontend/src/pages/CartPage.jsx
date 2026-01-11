import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = useMemo(() => localStorage.getItem("token"), []);
  const role = useMemo(
    () => (localStorage.getItem("user_role") || "").toLowerCase(),
    []
  );

  const normalizeCart = (raw) => {
    const items = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.items)
      ? raw.items
      : [];
    return items;
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get("/cart");
      const items = normalizeCart(res.data);

      setCart(items);

      // sink selected: pastikan id konsisten number dan masih ada di items
      setSelected((prev) => {
        const prevNums = prev.map((x) => Number(x));
        const existing = prevNums.filter((id) =>
          items.some((x) => Number(x.id) === Number(id))
        );
        return existing;
      });
    } catch (e) {
      console.error("Fetch cart failed:", e);
      setCart([]);
      setSelected([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    if (role && role !== "pembeli") {
      navigate("/unauthorized", { replace: true });
      return;
    }

    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSelect = (id) => {
    const cid = Number(id);
    setSelected((prev) => {
      const prevNums = prev.map((x) => Number(x));
      return prevNums.includes(cid)
        ? prevNums.filter((x) => x !== cid)
        : [...prevNums, cid];
    });
  };

  const updateQty = async (id, quantity) => {
    if (quantity < 1) return;
    await api.put(`/cart/${id}`, { quantity });
    fetchCart();
  };

  const removeItem = async (id) => {
    await api.delete(`/cart/${id}`);
    fetchCart();
  };

  const total = cart
    .filter((c) => selected.includes(Number(c.id)))
    .reduce((s, item) => {
      const price = Number(item?.product?.price || 0);
      const qty = Number(item?.quantity || 0);
      return s + price * qty;
    }, 0);

  const handleCheckout = () => {
    // WAJIB: CartPage hanya lempar selected ke halaman checkout, tanpa call API checkout
    navigate("/pembeli/checkout", { state: { selected_ids: selected } });
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
            <p className="text-gray-500 mb-3">Keranjangmu masih kosong</p>

            <Link
              to="/pembeli/obat"
              className="inline-block px-4 py-2 bg-sky-600 text-white rounded-lg"
            >
              Belanja Obat
            </Link>
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
                    checked={selected.includes(Number(item.id))}
                    onChange={() => toggleSelect(item.id)}
                  />

                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {item?.product?.name || "Produk"}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Rp {Number(item?.product?.price || 0).toLocaleString()}
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <button
                        className="px-2 bg-gray-200 rounded"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                        disabled={Number(item.quantity) <= 1}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        className="px-2 bg-gray-200 rounded"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
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
              <h3 className="font-semibold mb-4">Ringkasan Belanja</h3>

              <p className="flex justify-between mb-4">
                <span>Total</span>
                <b>Rp {Number(total || 0).toLocaleString()}</b>
              </p>

              <button
                disabled={selected.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 rounded-xl bg-sky-600 text-white disabled:bg-gray-300"
              >
                Checkout Sekarang
              </button>

              <p className="text-xs text-gray-500 mt-3">
                Setelah checkout, lanjut ke halaman checkout/pembayaran.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
