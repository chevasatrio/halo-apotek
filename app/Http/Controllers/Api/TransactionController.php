<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\Product;
use App\Models\Cart;
use App\Models\User; // Import Model User
use App\Http\Requests\CheckoutRequest;
use App\Http\Resources\TransactionResource;

class TransactionController extends Controller
{
    /**
     * FASE 1: CHECKOUT (PEMBELI)
     * Status Awal: 'pending'
     */
    public function checkout(CheckoutRequest $request)
    {
        $user = auth()->user();
        $validatedData = $request->validated();

        // Ambil barang dari keranjang user
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
                    'total_amount' => 0, // Hitung nanti
                    'status' => 'pending',
                    // Gunakan alamat dari input request jika ada
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

                    $product->decrement('stock', $item->quantity);
                }

                $transaction->update(['total_amount' => $totalAmount]);

                // C. Kosongkan Keranjang
                Cart::where('user_id', $user->id)->delete();

                // D. Load Relasi
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
     * Status Berubah: 'pending' -> 'paid'
     */
    public function uploadPayment(Request $request, $id)
    {
        $request->validate([
            'payment_proof' => 'required|image|max:2048' // Gunakan key 'payment_proof' di Postman
        ]);

        $transaction = Transaction::where('user_id', auth()->id())->findOrFail($id);

        if ($transaction->status !== 'pending') {
            return response()->json(['message' => 'Transaksi bukan status pending.'], 400);
        }

        if ($request->hasFile('payment_proof')) {
            $path = $request->file('payment_proof')->store('payment_proofs', 'public');

            $transaction->update([
                'payment_proof' => $path,
                'status' => 'paid' // Naik status jadi 'sudah bayar'
            ]);

            return response()->json(['message' => 'Bukti bayar terupload. Menunggu verifikasi admin.']);
        }

        return response()->json(['message' => 'File gagal diupload'], 400);
    }

    /**
     * FASE 3: VERIFIKASI PEMBAYARAN (ADMIN/KASIR)
     * Status Berubah: 'paid' -> 'processing'
     */
    public function verifyPayment($id)
    {
        $transaction = Transaction::findOrFail($id);

        // Hanya boleh verifikasi jika status 'paid'
        if ($transaction->status !== 'paid') {
            return response()->json(['message' => 'Status transaksi belum dibayar (paid).'], 400);
        }

        $transaction->update(['status' => 'processing']);

        return response()->json(['message' => 'Pembayaran valid. Status berubah menjadi Processing.']);
    }

    /**
     * FASE 4: ASSIGN DRIVER / KIRIM BARANG (ADMIN/KASIR)
     * Status Berubah: 'processing' -> 'shipping'
     */
    public function assignDriver(Request $request, $id)
    {
        $request->validate([
            'driver_id' => 'required|exists:users,id'
        ]);

        $transaction = Transaction::findOrFail($id);

        // Cek apakah user yang dipilih benar-benar driver
        $driver = User::where('id', $request->driver_id)->where('role', 'driver')->first();
        if (!$driver) {
            return response()->json(['message' => 'User ID tersebut bukan Driver.'], 400);
        }

        $transaction->update([
            'status' => 'shipping',
            'driver_id' => $driver->id
        ]);

        return response()->json(['message' => 'Driver ditugaskan. Status berubah menjadi Shipping.']);
    }

    /**
     * FASE 5: SELESAIKAN PESANAN (DRIVER)
     * Status Berubah: 'shipping' -> 'completed'
     */
    public function completeDelivery(Request $request, $id)
    {
        $request->validate([
            'delivery_proof' => 'required|image|max:2048' // Gunakan key 'delivery_proof' di Postman
        ]);

        // Pastikan driver yang login adalah yang ditugaskan
        $transaction = Transaction::where('driver_id', auth()->id())->findOrFail($id);

        if ($request->hasFile('delivery_proof')) {
            $path = $request->file('delivery_proof')->store('delivery_proofs', 'public');

            $transaction->update([
                'status' => 'completed',
                'delivery_proof' => $path
            ]);

            return response()->json(['message' => 'Pesanan selesai diantar. Status Completed.']);
        }

        return response()->json(['message' => 'Gagal upload bukti.'], 400);
    }

    /**
     * LIHAT RIWAYAT SENDIRI (PEMBELI)
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
     * LIHAT SEMUA TRANSAKSI (ADMIN/KASIR/DRIVER)
     */
    public function index()
    {
        $query = Transaction::with(['user', 'details.product', 'driver'])->orderBy('created_at', 'desc');

        // Jika Driver, hanya lihat tugas dia
        if (auth()->user()->role === 'driver') {
            $query->where(function ($q) {
                $q->where('driver_id', auth()->id())
                    ->orWhere('status', 'shipping'); // Bisa ambil job baru jika sistemnya "grab" (opsional)
            });
        }

        $transactions = $query->get();

        return response()->json([
            'data' => TransactionResource::collection($transactions)
        ]);
    }
}