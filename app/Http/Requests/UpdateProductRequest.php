<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Ubah jadi true
    }

    public function rules(): array
    {
        // $this->product adalah parameter ID/Model dari route
        // Contoh URL: /api/products/1 (maka id = 1)
        
        return [
            // ignore($this->product) artinya: Cek unik, tapi abaikan ID produk ini sendiri
            'name' => ['required', 'string', 'max:255'], 
            'price' => ['required', 'integer', 'min:100'],
            'stock' => ['required', 'integer', 'min:0'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:2048'], // Image jadi nullable saat update
        ];
    }
}