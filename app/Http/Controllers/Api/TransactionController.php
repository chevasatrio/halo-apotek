<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

// Models
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Cart;

// Import Form Request 
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\TransactionResource;

class TransactionController extends Controller
{
    /**
     * FITUR 1: CHECKOUT (PEMBELI)
     * Menggunakan CheckoutRequest untuk validasi otomatis.
     */
    public function checkout(CheckoutRequest $request)
    {
        // 1. Ambil User yang sedang login
        $user = auth()->user();

        // 2. Ambil Validasi (Alamat)
        $validatedData = $request->validated();

        // 3. AMBIL DARI DATABASE CART (Logic Baru)
        $cartItems = Cart::with('product')->where('user_id', $user->id)->get();

        // Cek apakah keranjang kosong?
        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Keranjang belanja Anda kosong. Silakan belanja dulu.'], 400);
        }

        try {
            $result = DB::transaction(function () use ($cartItems, $user, $validatedData) {

                $totalAmount = 0;

                // A. Buat Header Transaksi
                $transaction = Transaction::create([
                    'user_id' => $user->id,
                    'invoice_code' => 'INV-' . time() . rand(100, 999),
                    'total_amount' => 0,
                    'status' => 'pending',
                    // Simpan alamat jika kolomnya ada, atau gunakan alamat user
                    // 'address' => $validatedData['address'], 
                ]);

                // B. Loop barang dari DATABASE CART
                foreach ($cartItems as $item) {
                    // Lock product
                    $product = Product::where('id', $item->product_id)->lockForUpdate()->first();

                    // Cek Stok
                    if (!$product || $product->stock < $item->quantity) {
                        throw new \Exception("Stok obat {$product->name} tidak cukup.");
                    }

                    // Hitung
                    $subtotal = $product->price * $item->quantity;
                    $totalAmount += $subtotal;

                    // Simpan Detail
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'quantity' => $item->quantity,
                        'price' => $product->price
                    ]);

                    // Kurangi Stok
                    $product->decrement('stock', $item->quantity);
                }

                // C. Update Total
                $transaction->update(['total_amount' => $totalAmount]);

                // D. HAPUS ISI KERANJANG (PENTING!)
                // Karena sudah dibeli, keranjang harus kosong kembali
                Cart::where('user_id', $user->id)->delete();

                // Load relasi untuk output
                $transaction->load(['details.product', 'user']);

                return $transaction;
            });

            return response()->json([
                'message' => 'Checkout berhasil',
                'data' => new \App\Http\Resources\TransactionResource($result)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Checkout gagal',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * FITUR 2: UPLOAD BUKTI BAYAR (PEMBELI)
     */
    public function uploadPayment(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|max:2048' // Max 2MB
        ]);

        $transaction = Transaction::where('user_id', auth()->id())->findOrFail($id);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('payments', 'public');

            $transaction->update([
                'payment_proof' => $path,
                // Opsional: ubah status jadi waiting_verification
            ]);

            return response()->json(['message' => 'Bukti pembayaran berhasil diupload', 'path' => $path]);
        }

        return response()->json(['message' => 'File tidak ditemukan'], 400);
    }

    /**
     * FITUR 3: KONFIRMASI PEMBAYARAN (ADMIN/KASIR)
     */
    public function confirmPayment(Request $request, $id)
    {
        $request->validate([
            'driver_id' => 'required|exists:users,id' // Harus assign ke driver valid
        ]);

        $transaction = Transaction::findOrFail($id);

        $transaction->update([
            'status' => 'shipping', // Ubah status jadi dikirim
            'driver_id' => $request->driver_id
        ]);

        return response()->json(['message' => 'Pembayaran dikonfirmasi, Driver ditugaskan']);
    }

    /**
     * FITUR 4: SELESAIKAN PESANAN (DRIVER)
     */
    public function completeDelivery(Request $request, $id)
    {
        $request->validate([
            'image' => 'required|image|max:2048' // Bukti barang sampai
        ]);

        // Pastikan driver yang login adalah yang ditugaskan (Opsional check)
        $transaction = Transaction::where('driver_id', auth()->id())->findOrFail($id);

        $path = $request->file('image')->store('evidence', 'public');

        $transaction->update([
            'status' => 'completed',
            'delivery_proof' => $path
        ]);

        return response()->json(['message' => 'Pesanan selesai diantar']);
    }

    /**
     * FITUR 5: RIWAYAT TRANSAKSI (PEMBELI)
     */
    public function myHistory()
    {
        $transactions = Transaction::where('user_id', auth()->id())
            ->with(['details.product']) // Eager load biar cepat
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)
        ]);
    }
    /**
     * FITUR 6: DAFTAR TRANSAKSI (ADMIN/KASIR/DRIVER)
     */
    public function index()
    {
        // Jika Driver, mungkin hanya ingin lihat yang ditugaskan ke dia?
        // Tapi untuk simplifikasi tugas, kita tampilkan semua dulu atau filter by role.

        $query = Transaction::with(['user', 'details.product', 'driver'])->orderBy('created_at', 'desc');

        // Jika driver yang akses, kasih lihat hanya job dia ATAU order yang statusnya 'shipping'
        if (auth()->user()->role === 'driver') {
            $query->where('status', 'shipping')
                ->orWhere('driver_id', auth()->id());
        }

        $transactions = $query->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)
        ]);
    }


}