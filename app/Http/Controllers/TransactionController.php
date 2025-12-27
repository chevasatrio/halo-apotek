<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255',
            'telepon' => 'required|string|max:20',
            'alamat' => 'required|string',
            'kota' => 'required|string|max:100',
            'kode_pos' => 'nullable|string|max:10',
            'metode_pembayaran' => 'required|in:transfer,cod,ewallet',
            'catatan' => 'nullable|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            $items = $request->items;

            // Calculate total amount and check stock
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception("Stok produk {$product->name} tidak mencukupi.");
                }
                $totalAmount += $product->price * $item['quantity'];
                
                // Reduce stock
                $product->decrement('stock', $item['quantity']);
            }
            
            // Add shipping cost (fixed for now as per frontend)
            $totalAmount += 15000;

            // Create Transaction
            $transaction = Transaction::create([
                'user_id' => Auth::id(),
                'invoice_code' => 'INV-' . strtoupper(Str::random(10)),
                'recipient_name' => $request->nama,
                'phone_number' => $request->telepon,
                'address' => $request->alamat,
                'city' => $request->kota,
                'postal_code' => $request->kode_pos,
                'payment_method' => $request->metode_pembayaran,
                'notes' => $request->catatan,
                'total_amount' => $totalAmount,
                'status' => 'pending',
            ]);

            // Create Transaction Details
            foreach ($items as $item) {
                $product = Product::find($item['product_id']);
                TransactionDetail::create([
                    'transaction_id' => $transaction->id,
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Checkout berhasil',
                'redirect_url' => route('beranda'), // Or a success page
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Checkout gagal: ' . $e->getMessage(),
            ], 500);
        }
    }
}
