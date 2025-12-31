<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use App\Http\Requests\UpdateProductRequest;
use Illuminate\Support\Facades\Storage;

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
    public function update(UpdateProductRequest $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->validated();

        // Cek apakah ada upload gambar baru?
        if ($request->hasFile('image')) {
            // 1. Hapus gambar lama jika ada
            if ($product->image && Storage::exists('public/' . $product->image)) {
                Storage::delete('public/' . $product->image);
            }
            
            // 2. Simpan gambar baru
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return response()->json([
            'message' => 'Produk berhasil diperbarui',
            'data' => new \App\Http\Resources\ProductResource($product)
        ]);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        // Hapus gambar dari storage biar bersih
        if ($product->image && Storage::exists('public/' . $product->image)) {
            Storage::delete('public/' . $product->image);
        }

        $product->delete();

        return response()->json([
            'message' => 'Produk berhasil dihapus permanen'
        ]);
    }

}