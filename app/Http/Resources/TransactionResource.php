<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_code' => $this->invoice_code,
            'total_amount' => $this->total_amount,
            'total_formatted' => 'Rp ' . number_format($this->total_amount, 0, ',', '.'),
            'status' => ucfirst($this->status), // misal: 'Pending'
            'payment_proof' => $this->payment_proof ? url('storage/' . $this->payment_proof) : null,
            'transaction_date' => $this->created_at->format('d M Y H:i'), // Format tanggal cantik
            
            // Relasi ke User (Pembeli)
            'buyer_name' => $this->user->name,

            // Relasi ke Driver (jika ada) - Menggunakan whenLoaded agar hemat query
            'driver' => $this->when($this->driver_id, function () {
                 return $this->driver ? $this->driver->name : null;
            }),

            // Relasi Item Belanja (Panggil resource detail tadi)
            // Menggunakan whenLoaded('details') agar tidak error jika relasi belum di-load
            'items' => TransactionDetailResource::collection($this->whenLoaded('details')),
        ];
    }
}