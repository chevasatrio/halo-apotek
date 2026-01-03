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

    // Fitur : HAPUS USER (Khusus Admin)
    public function destroy($id)
    {
        // 1. Cari user
        $user = User::findOrFail($id);

        // 2. Cegah Admin menghapus dirinya sendiri (Bunuh diri)
        if ($user->id == auth()->id()) {
            return response()->json([
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri saat sedang login.'
            ], 400);
        }

        // 3. (Opsional) Cegah menghapus user yang punya transaksi aktif
        // Jika Anda ingin user hilang tapi history transaksi tetap ada, gunakan SoftDeletes di Model.
        // Tapi untuk sekarang, kita hapus permanen saja.
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus permanen.'
        ]);
    }
}