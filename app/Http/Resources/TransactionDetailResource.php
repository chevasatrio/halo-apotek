<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'price' => $this->price, // Harga saat transaksi (bisa 0 jika bug)
            
            // --- PENTING: Sertakan data Produk agar Frontend bisa baca harga master ---
            'product' => new ProductResource($this->whenLoaded('product')),
        ];
    }
}