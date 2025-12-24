<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;

class HomeController extends Controller
{
    // Fungsi index untuk menampilkan tampilan beranda
    public function index()
    {
        $products = Product::all();
        return view('layouts.frontend.beranda', compact('products'));
    }

    // Fungsi beranda untuk menampilkan halaman beranda apotek
    public function beranda()
    {
        $products = Product::all();
        return view('layouts.frontend.beranda', compact('products'));
    }

    // Fungsi detail produk
    public function detailProduk($id)
    {
        $product = Product::findOrFail($id);
        $relatedProducts = Product::where('id', '!=', $id)->take(4)->get();
        return view('layouts.frontend.detail-produk', compact('product', 'relatedProducts'));
    }

    // Fungsi halaman keranjang
    public function keranjang()
    {
        return view('layouts.frontend.keranjang');
    }

    // Fungsi halaman checkout
    public function checkout()
    {
        return view('layouts.frontend.checkout');
    }
}
