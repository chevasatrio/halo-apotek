<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index() {
        return response()->json(Product::all());
    }

    public function store(Request $request) {
        // Validasi simpel
        $request->validate([
            'name' => 'required',
            'price' => 'required|integer',
            'stock' => 'required|integer'
        ]);

        $product = Product::create($request->all());
        return response()->json(['message' => 'Produk dibuat', 'data' => $product]);
    }
}