<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    // 1. Izinkan akses (Wajib true)
    public function authorize(): bool
    {
        return true; 
    }

    // 2. Definisi aturan validasi
    public function rules(): array
    {
        return [
            // Contoh validasi checkout
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'address' => 'required|string|max:255',
            // Tambahkan rule lain sesuai kebutuhan
        ];
    }

    // 3. (Opsional) Custom pesan error agar bahasa Indonesia
    public function messages(): array
    {
        return [
            'items.required' => 'Keranjang belanja tidak boleh kosong.',
            'items.*.quantity.min' => 'Jumlah barang minimal 1.',
        ];
    }
}