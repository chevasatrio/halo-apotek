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

// 1. PUBLIC ROUTES
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'index']);

// 2. PROTECTED ROUTES
Route::middleware(['auth:sanctum'])->group(function () {

    // --- UMUM ---
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // --- ROLE: PEMBELI ---
    Route::middleware(['role:pembeli'])->group(function () {
        Route::post('/cart', [CartController::class, 'addToCart']);
        Route::get('/cart', [CartController::class, 'myCart']);
        Route::put('/cart/{id}', [CartController::class, 'update']);
        Route::delete('/cart/{id}', [CartController::class, 'destroy']);
        
        Route::post('/checkout', [TransactionController::class, 'checkout']); 
        Route::post('/transaction/{id}/pay', [TransactionController::class, 'uploadPayment']);
        Route::get('/my-orders', [TransactionController::class, 'myHistory']);
    });

    // --- ROLE: ADMIN & KASIR ---
    Route::middleware(['role:admin,kasir'])->group(function () {
        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/transactions', [TransactionController::class, 'index']);

        // User Management
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        
        // --- ROUTE BARU: Lihat Daftar Driver ---
        Route::get('/drivers', [UserController::class, 'getDrivers']); 

        // Product Management
        Route::post('/products', [ProductController::class, 'store']);
        Route::post('/products/{id}', [ProductController::class, 'update']); 
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);

        // Transaction Process
        Route::post('/transaction/{id}/verify', [TransactionController::class, 'verifyPayment']); 
        Route::post('/transaction/{id}/assign', [TransactionController::class, 'assignDriver']); // Input: driver_id (ID User Driver)
        Route::post('/transaction/{id}/complete-direct', [TransactionController::class, 'completeDirectly']); 
    });

    // --- ROLE: DRIVER ---
    Route::middleware(['role:driver'])->group(function () {
        Route::get('/driver/jobs', [TransactionController::class, 'index']);
        Route::post('/transaction/{id}/complete', [TransactionController::class, 'completeDelivery']);
    });

});