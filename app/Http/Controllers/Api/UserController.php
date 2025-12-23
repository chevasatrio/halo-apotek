<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Fitur: Admin Create Staff (Kasir/Driver/Admin lain)
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();

        // Pastikan role diisi, kalau kosong default pembeli
        $validated['role'] = $validated['role'] ?? 'pembeli';
        
        // Enkripsi Password
        $validated['password'] = bcrypt($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User baru berhasil ditambahkan',
            'data' => $user // Anda bisa pakai UserResource di sini jika mau lebih rapi
        ], 201);
    }
    
    // Fitur: List Semua User (Opsional, buat Admin lihat staff)
    public function index() {
        return response()->json(User::all());
    }
}