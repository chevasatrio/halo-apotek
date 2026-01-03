<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Cart;
use App\Models\User;
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\TransactionResource;

class TransactionController extends Controller
{
    /**
     * FASE 1: CHECKOUT (PEMBELI)
     * Stok berkurang di sini agar tidak overselling.
     */
    public function checkout(CheckoutRequest $request)
    {
        $user = auth()->user();
        $validatedData = $request->validated();

        $cartItems = Cart::with('product')->where('user_id', $user->id)->get();

        if ($cartItems->isEmpty()) {
            return response()->json(['message' => 'Keranjang belanja kosong.'], 400);
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
                    'address' => $validatedData['address'] ?? $user->address ?? 'Alamat tidak diisi',
                ]);

                // B. Loop Cart Items
                foreach ($cartItems as $item) {
                    $product = Product::where('id', $item->product_id)->lockForUpdate()->first();

                    if (!$product || $product->stock < $item->quantity) {
                        throw new \Exception("Stok {$product->name} tidak cukup.");
                    }

                    $subtotal = $product->price * $item->quantity;
                    $totalAmount += $subtotal;

                    TransactionDetail::create([
                        'transaction_id' => $transaction->id,
                        'product_id' => $product->id,
                        'quantity' => $item->quantity,
                        'price' => $product->price
                    ]);

                    // --- PENTING: STOK BERKURANG DI SINI ---
                    $product->decrement('stock', $item->quantity);
                }

                $transaction->update(['total_amount' => $totalAmount]);

                // C. Kosongkan Keranjang
                Cart::where('user_id', $user->id)->delete();

                $transaction->load(['details.product', 'user']); 

                return $transaction;
            });

            return response()->json([
                'message' => 'Checkout berhasil. Silakan lakukan pembayaran.',
                'data' => new TransactionResource($result)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Checkout gagal',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * FASE 2: UPLOAD BUKTI BAYAR (PEMBELI)
     */
    public function uploadPayment(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => 'required|image|max:2048'
        ]);

        $transaction = Transaction::where('user_id', auth()->id())->findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi bukan status pending.'], 400);
        }

        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');
            
            $transaction->update([
                'payment_proof' => $path,
                'status' => 'paid'
            ]);

            return response()->json(['message' => 'Bukti bayar diterima. Menunggu verifikasi admin.']);
        }

        return response()->json(['message' => 'File gagal diupload'], 400);
    }

    /**
     * FASE 3: VERIFIKASI PEMBAYARAN (ADMIN/KASIR)
     */
    public function verifyPayment($id)
    {
        $transaction = Transaction::findOrFail($id);

        if ($transaction->status !== 'paid') {
            return response()->json(['message' => 'Hanya transaksi status Paid yang bisa diverifikasi.'], 400);
        }

        $transaction->update(['status' => 'processing']);

        return response()->json(['message' => 'Pembayaran valid. Status: Processing.']);
    }

    /**
     * OPSI A: ASSIGN DRIVER (ADMIN/KASIR)
     * Jika barang harus dikirim.
     */
    public function assignDriver(Request $request, $id)
    {
        $request->validate([
            'driver_id' => 'required|exists:users,id'
        ]);

        $transaction = Transaction::findOrFail($id);
        
        // Cek status valid
        if (!in_array($transaction->status, ['processing', 'paid'])) {
             return response()->json(['message' => 'Transaksi belum siap dikirim (Cek status).'], 400);
        }

        $driver = User::where('id', $request->driver_id)->where('role', 'driver')->first();
        if (!$driver) {
            return response()->json(['message' => 'User ID tersebut bukan Driver.'], 400);
        }

        $transaction->update([
            'status' => 'shipping',
            'driver_id' => $driver->id
        ]);

        return response()->json(['message' => 'Driver ditugaskan. Status: Shipping.']);
    }

    /**
     * OPSI B: SELESAIKAN LANGSUNG (ADMIN/KASIR)
     * Jika pembeli ambil di toko (Self Pickup).
     */
    public function completeDirectly(Request $request, $id)
    {
        $transaction = Transaction::findOrFail($id);

        if (!in_array($transaction->status, ['paid', 'processing', 'shipping'])) {
            return response()->json([
                'message' => 'Gagal. Transaksi harus berstatus Paid, Processing, atau Shipping.'
            ], 400);
        }

        $transaction->update([
            'status' => 'completed',
            'driver_id' => null, // Tidak butuh driver
            'delivery_proof' => 'taken_in_store.jpg' // Dummy proof
        ]);

        return response()->json(['message' => 'Transaksi selesai (Ambil di tempat).']);
    }

    /**
     * FASE 5: DRIVER SELESAIKAN PESANAN (DRIVER)
     */
    public function completeDelivery(Request $request, $id)
    {
        $request->validate([
            'delivery_proof' => 'required|image|max:2048'
        ]);

        $transaction = Transaction::where('driver_id', auth()->id())->findOrFail($id);

        if ($request->hasFile('delivery_proof')) {
            $path = $request->file('delivery_proof')->store('delivery_proofs', 'public');

            $transaction->update([
                'status' => 'completed',
                'delivery_proof' => $path
            ]);

            return response()->json(['message' => 'Pesanan selesai diantar.']);
        }
        
        return response()->json(['message' => 'Gagal upload bukti.'], 400);
    }

    /**
     * LIHAT RIWAYAT (PEMBELI)
     */
    public function myHistory()
    {
        $transactions = Transaction::where('user_id', auth()->id())
            ->with(['details.product'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)
        ]);
    }

    /**
     * LIHAT SEMUA (ADMIN/KASIR/DRIVER)
     */
    public function index()
    {
        $query = Transaction::with(['user', 'details.product', 'driver'])->orderBy('created_at', 'desc');

        if (auth()->user()->role === 'driver') {
            $query->where(function($q) {
                $q->where('driver_id', auth()->id())
                  ->orWhere('status', 'shipping');
            });
        }

        $transactions = $query->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)
        ]);
    }
}