<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            // Kita bisa format harga langsung jadi Rupiah di sini
            'price_formatted' => 'Rp ' . number_format($this->price, 0, ',', '.'),
            'price' => $this->price, // Tetap kirim angka murni untuk kalkulasi
            'stock' => $this->stock,
            'image_url' => $this->image ? url('storage/' . $this->image) : null,
            'description' => $this->description,
        ];
    }
}