<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\StoreUserRequest;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\HasApiTokens;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        // 1. Validasi Input
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        // 2. Cek Credential
        if (Auth::attempt($credentials)) {
            $user = Auth::user();

            // 3. Hapus token lama (Opsional, untuk keamanan single session)
            // $user->tokens()->delete(); 

            // 4. Buat Token Baru
            $token = $user->createToken('api-token')->plainTextToken;

            return response()->json([
                'message' => 'Login berhasil',
                'token' => $token,
                'user' => $user
            ]);
        }

        return response()->json(['message' => 'Email atau Password salah'], 401);
    }

    public function logout(Request $request)
    {
        // Hapus token yang sedang dipakai saat ini
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function register(StoreUserRequest $request)
    {
        $validated = $request->validated();

        // Paksa role jadi 'pembeli' jika register mandiri (Public)
        $validated['role'] = 'pembeli';

        // Enkripsi password manual sebelum simpan
        $validated['password'] = bcrypt($validated['password']);

        $user = User::create($validated);

        // Opsi A: Langsung login (kasih token)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Registrasi berhasil',
            'token' => $token,
            'user' => $user
        ], 201);
    }
}