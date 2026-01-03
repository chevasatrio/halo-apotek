<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// ==========================
// 1. PUBLIC ROUTES (Tanpa Login)
// ==========================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']); // Katalog Produk

// ==========================
// 2. PROTECTED ROUTES (Wajib Login)
// ==========================
Route::middleware(['auth:sanctum'])->group(function () {

    // --- LOGOUT & USER INFO ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- ROLE: PEMBELI ---
    Route::middleware(['role:pembeli'])->group(function () {
        // Keranjang Belanja
        Route::post('/cart', [CartController::class, 'addToCart']);
        Route::get('/cart', [CartController::class, 'myCart']);
        Route::put('/cart/{id}', [CartController::class, 'update']); // Update Qty
        Route::delete('/cart/{id}', [CartController::class, 'destroy']); // Hapus Item

        // Transaksi
        Route::post('/checkout', [TransactionController::class, 'checkout']);
        Route::post('/transaction/{id}/pay', [TransactionController::class, 'uploadPayment']); // Upload Bukti Bayar
        Route::get('/my-orders', [TransactionController::class, 'myHistory']); // Riwayat Belanja
    });

    // --- ROLE: ADMIN & KASIR ---
    Route::middleware(['role:admin,kasir'])->group(function () {
        // Dashboard & List Transaksi
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/transactions', [TransactionController::class, 'index']); // Lihat semua order

        // Manajemen User (Admin buat akun staff)
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);

        // Manajemen Produk
        Route::post('/products', [ProductController::class, 'store']);
        // Update Produk (Pakai POST agar bisa upload file/gambar)
        Route::post('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Proses Transaksi (Lifecycle)
        Route::post('/transaction/{id}/verify', [TransactionController::class, 'verifyPayment']); // Verifikasi Bukti Bayar
        Route::post('/transaction/{id}/assign', [TransactionController::class, 'assignDriver']); // Pilih Driver

        // Delete User
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // --- ROLE: DRIVER ---
    Route::middleware(['role:driver'])->group(function () {
        Route::get('/driver/jobs', [TransactionController::class, 'index']); // List tugas pengiriman
        Route::post('/transaction/{id}/complete', [TransactionController::class, 'completeDelivery']); // Upload bukti sampai
    });

});