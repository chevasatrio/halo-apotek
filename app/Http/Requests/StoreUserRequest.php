<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'], // Minimal 8 karakter
            
            // Validasi Role: Hanya boleh role yang valid
            // Jika yang request bukan admin, paksa jadi pembeli (opsional logic)
            'role' => ['nullable', Rule::in(['admin', 'kasir', 'driver', 'pembeli'])],
            
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ];
    }
}