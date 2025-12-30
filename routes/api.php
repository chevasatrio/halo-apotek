<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\Api\UserController;


// 1. PUBLIC (Bisa diakses siapa saja)
Route::post('/login', [AuthController::class, 'login']); 
Route::post('/register', [AuthController::class, 'register']);
Route::get('/products', [ProductController::class, 'index']);

// 2. PROTECTED (Harus Login / Punya Token)
Route::middleware(['auth:sanctum'])->group(function () {

    // A. Area Umum (Semua User Login bisa akses)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // B. Area PEMBELI (Hanya Role: Pembeli)
    // Cart & Checkout & Upload Bukti Bayar
    Route::middleware(['role:pembeli'])->group(function () {
        Route::post('/cart', [CartController::class, 'addToCart']);
        Route::get('/cart', [CartController::class, 'myCart']);
        Route::post('/checkout', [TransactionController::class, 'checkout']);
        Route::post('/transaction/{id}/pay', [TransactionController::class, 'uploadPayment']); 
    });

    // C. Area STAFF (Admin & Kasir)
    // Admin & Kasir bisa kelola produk (misal) dan konfirmasi bayar
    Route::middleware(['role:admin,kasir'])->group(function () {
        Route::get('/users', [UserController::class, 'index']); // Lihat semua user
        Route::post('/users', [UserController::class, 'store']); // Create Kasir/Driver
        Route::post('/products', [ProductController::class, 'store']); // Tambah Produk
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::post('/transaction/{id}/confirm', [TransactionController::class, 'confirmPayment']);
    });

    // D. Area DRIVER (Hanya Role: Driver)
    Route::middleware(['role:driver'])->group(function () {
        Route::post('/transaction/{id}/complete', [TransactionController::class, 'completeDelivery']);
    });
    
});