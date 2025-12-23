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
}