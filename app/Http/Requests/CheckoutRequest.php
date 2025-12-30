<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            //wajibkan alamat pengiriman
            'address' => ['required', 'string', 'max:500'], 
        ];
    }

    public function messages(): array
    {
        return [
            'address.required' => 'Mohon isi alamat pengiriman.',
        ];
    }
}