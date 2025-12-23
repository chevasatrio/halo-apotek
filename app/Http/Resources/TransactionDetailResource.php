<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_name' => $this->product->name, // Ambil nama dari relasi produk
            'quantity' => $this->quantity,
            'price_at_purchase' => $this->price, // Harga asli saat transaksi terjadi
            'subtotal' => $this->price * $this->quantity,
            'subtotal_formatted' => 'Rp ' . number_format($this->price * $this->quantity, 0, ',', '.'),
        ];
    }
}