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
            'status' => $this->status,
            'payment_proof' => $this->payment_proof,
            'delivery_proof' => $this->delivery_proof,
            'address' => $this->address ?? 'Alamat tidak tersedia',

            // --- PERBAIKAN 1: Pastikan Tanggal Dikirim ---
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // --- PERBAIKAN 2: Pastikan Data User & Driver Dikirim ---
            // 'whenLoaded' mencegah error jika relasi belum dipanggil controller
            'user' => $this->whenLoaded('user'),
            'driver' => $this->whenLoaded('driver'),
            'details' => TransactionDetailResource::collection($this->whenLoaded('details')),
        ];
    }
}