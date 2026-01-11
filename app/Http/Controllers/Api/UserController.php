<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\User; // <--- JANGAN LUPA IMPORT INI
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;


class UserController extends Controller
{
    /**
     * List Semua User (Admin)
     * Method ini menangani error 500 sebelumnya.
     */
    public function index() {
        return response()->json(User::all());
    }

    /**
     * List Khusus Driver (Agar Admin tau ID nya)
     */
    public function getDrivers() {
        $drivers = User::where('role', 'driver')->get();
        return response()->json($drivers);
    }

    /**
     * SELF: Ambil profil user yang sedang login
     * GET /api/user
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    /**
     * SELF: Update profil user yang sedang login (tanpa role)
     * PUT /api/user
     */
    public function updateMe(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            // email optional: jika mau boleh update email, aktifkan:
            // 'email' => 'required|email|unique:users,email,' . $user->id,

            // kalau tabel kamu pakai phone:
            'phone'   => 'nullable|string|max:30',

            // kalau tabel kamu pakai no_hp, aktifkan ini dan matikan phone:
            // 'no_hp' => 'nullable|string|max:30',

            'address' => 'nullable|string|max:500',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $validated['name'];

        // pilih salah satu sesuai kolom DB kamu:
        if (array_key_exists('phone', $validated)) {
            $user->phone = $validated['phone'];
        }
        // kalau pakai no_hp:
        // if (array_key_exists('no_hp', $validated)) {
        //     $user->no_hp = $validated['no_hp'];
        // }

        if (array_key_exists('address', $validated)) {
            $user->address = $validated['address'];
        }

        if ($request->filled('password')) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'data' => $user
        ]);
    }

    /**
     * Detail Satu User
     */
    public function show($id)
    {
        $user = User::findOrFail($id);

        return response()->json([
            'message' => 'Detail user ditemukan',
            'data' => $user
        ]);
    }

    /**
     * Create User Baru (Admin)
     */
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

    /**
     * Hapus User (Admin)
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id == auth()->id()) {
            return response()->json(['message' => 'Tidak bisa menghapus akun sendiri.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User berhasil dihapus permanen.']);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Validasi Manual di sini agar praktis (tanpa buat file Request baru)
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            // Email harus unik, KECUALI milik user ini sendiri
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'role'     => 'required|in:admin,kasir,driver,pembeli',
            'password' => 'nullable|string|min:8', // Password opsional saat edit
        ]);

        // Update data dasar
        $user->name  = $validated['name'];
        $user->email = $validated['email'];
        $user->role  = $validated['role'];

        // Cek apakah admin mengisi password baru?
        if ($request->filled('password')) {
            $user->password = bcrypt($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Data user berhasil diperbarui',
            'data'    => $user
        ]);
    }
}
