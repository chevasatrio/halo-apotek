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
        // 1. Ambil data yang sudah lolos validasi (dijamin aman)
       $validatedData = $request->validated();
    $items = $validatedData['items'];

    try {
        $result = DB::transaction(function () use ($items) {
                
                $totalAmount = 0;

                // A. Buat Header Transaksi
                $transaction = Transaction::create([
                    'user_id' => auth()->id(),
                    'invoice_code' => 'INV-' . time() . rand(100, 999),
                    'total_amount' => 0, // Update nanti setelah hitung
                    'status' => 'pending', // unpaid/pending
                ]);

                // B. Loop setiap barang belanjaan
                foreach ($items as $item) {
                    // Lock for Update mencegah race condition (stok minus saat berebut)
                    $product = Product::where('id', $item['product_id'])->lockForUpdate()->first();

                    // Cek stok lagi untuk keamanan ganda
                    if ($product->stock < $item['quantity']) {
                        throw new \Exception("Stok {$product->name} tidak cukup.");
                    }

                    // Hitung Subtotal
                    $subtotal = $product->price * $item['quantity'];
                    $totalAmount += $subtotal;

                    // C. Masukkan ke Transaction Detail
                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'quantity' => $item['quantity'],
                        'price' => $product->price // Simpan harga saat beli (history)
                    ]);

                    // D. Kurangi Stok
                    $product->decrement('stock', $item['quantity']);
                }

                // E. Update Total Harga di Header
                $transaction->update(['total_amount' => $totalAmount]);

                // F. Hapus keranjang user (jika ada logic cart database)
                Cart::where('user_id', auth()->id())->delete();

            // PENTING: Load relasi details agar muncul di Resource
            $transaction->load(['details.product', 'user']); 

            return $transaction;
        });
            // Return Sukses
          return response()->json([
            'message' => 'Checkout berhasil',
            'data' => new TransactionResource($result) // <--- Bungkus pakai Resource
        ], 201);

    } catch (\Exception $e) {
            // Jika ada error (misal stok habis), batalkan semua query DB
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
}