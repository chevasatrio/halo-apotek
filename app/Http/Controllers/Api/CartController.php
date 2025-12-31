<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;

class CartController extends Controller
{
    // Tambah ke Keranjang
    public function addToCart(Request $request) {
        $request->validate([
            'product_id' => 'required',
            'quantity' => 'required|integer|min:1'
        ]);

        $cart = Cart::updateOrCreate(
            [
                'user_id' => auth()->id(), 
                'product_id' => $request->product_id
            ],
            [
                'quantity' => \DB::raw("quantity + $request->quantity")
            ]
        );

        return response()->json(['message' => 'Masuk keranjang', 'data' => $cart]);
    }

    // Lihat Keranjang Saya
    public function myCart() {
        $cart = Cart::with('product')->where('user_id', auth()->id())->get();
        return response()->json($cart);
    }

    /**
     * UPDATE QTY KERANJANG (PUT)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1'
        ]);

        // Pastikan update cart punya sendiri, bukan punya orang lain
        $cart = Cart::where('user_id', auth()->id())->findOrFail($id);
        
        // Cek stok produk (Opsional tapi bagus)
        if ($cart->product->stock < $request->quantity) {
            return response()->json(['message' => 'Stok tidak mencukupi'], 400);
        }

        $cart->update(['quantity' => $request->quantity]);

        return response()->json(['message' => 'Jumlah barang diupdate']);
    }

    /**
     * HAPUS ITEM DARI KERANJANG (DELETE)
     */
    public function destroy($id)
    {
        // Pastikan hapus cart punya sendiri
        $cart = Cart::where('user_id', auth()->id())->findOrFail($id);
        
        $cart->delete();

        return response()->json(['message' => 'Item dihapus dari keranjang']);
    }
}