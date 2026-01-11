<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // List Semua User (Admin)
    public function index() {
        return response()->json(User::all());
    }

    // --- TAMBAHAN BARU: List Khusus Driver (Agar Admin tau ID nya) ---
    public function getDrivers() {
        // Ambil hanya yang role-nya driver
        $drivers = User::where('role', 'driver')->get();
        return response()->json($drivers);
    }

    // Create User Baru (Admin)
    public function store(StoreUserRequest $request)
    {
        $validated = $request->validated();
        $validated['role'] = $validated['role'] ?? 'pembeli';

        // Enkripsi Password
        $validated['password'] = bcrypt($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'User baru berhasil ditambahkan',
            'data' => $user
        ], 201);
    }

    // Fitur: List Semua User (Opsional, buat Admin lihat staff)
    public function index() {
        return response()->json(User::all());
    }

    // Hapus User (Admin)
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id == auth()->id()) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus permanen.']);
    }

    public function show($id)
{
    // Cari user, jika tidak ditemukan otomatis 404
    $user = User::findOrFail($id);

    return response()->json([
        'message' => 'Detail user ditemukan',
        'data' => $user
    ]);
}
}
