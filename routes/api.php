<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PrescriptionController;
use App\Http\Controllers\Api\DeliveryController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Products (public view)
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{id}', [ProductController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/profile', [AuthController::class, 'profile']);

    // Dashboard
    Route::get('/dashboard/stats', [OrderController::class, 'dashboardStats']);
    
    // Products management (admin only)
    Route::middleware('admin')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    });

    // Cart routes
    Route::prefix('cart')->group(function () {
        Route::get('/', [CartController::class, 'index']);
        Route::post('/items', [CartController::class, 'addItem']);
        Route::put('/items/{id}', [CartController::class, 'updateItem']);
        Route::delete('/items/{id}', [CartController::class, 'removeItem']);
        Route::delete('/clear', [CartController::class, 'clear']);
    });

    // Orders routes
    Route::prefix('orders')->group(function () {
        Route::get('/', [OrderController::class, 'index']);
        Route::post('/', [OrderController::class, 'store']);
        Route::get('/history', [OrderController::class, 'history']);
        Route::get('/pending-approval', [OrderController::class, 'pendingApproval'])->middleware('admin');
        Route::get('/{id}', [OrderController::class, 'show']);
        Route::put('/{id}/status', [OrderController::class, 'updateStatus']);
        Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
        Route::post('/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof']);
        Route::post('/{id}/assign-driver', [OrderController::class, 'assignDriver'])->middleware(['admin', 'kasir']);
        Route::get('/{id}/timeline', [OrderController::class, 'statusTimeline']);
        Route::get('/{orderNumber}/invoice', [OrderController::class, 'invoice']);
    });

    // Payments routes
    Route::prefix('payments')->group(function () {
        Route::get('/', [PaymentController::class, 'index']);
        Route::get('/{id}', [PaymentController::class, 'show']);
        Route::post('/{id}/verify', [PaymentController::class, 'verify'])->middleware(['admin', 'kasir']);
    });

    // Prescriptions routes
    Route::prefix('prescriptions')->group(function () {
        Route::get('/', [PrescriptionController::class, 'index']);
        Route::post('/{id}/verify', [PrescriptionController::class, 'verify'])->middleware('admin');
        Route::post('/orders/{orderId}/upload', [PrescriptionController::class, 'upload']);
    });

    // Reports (admin/kasir only)
    Route::middleware(['admin', 'kasir'])->group(function () {
        Route::get('/reports/sales', [OrderController::class, 'salesReport']);
    });

    // Delivery routes (for drivers)
    Route::middleware('driver')->prefix('deliveries')->group(function () {
        Route::get('/', [DeliveryController::class, 'index']);
        Route::get('/{id}', [DeliveryController::class, 'show']);
        Route::post('/{id}/accept', [DeliveryController::class, 'accept']);
        Route::post('/{id}/update-status', [DeliveryController::class, 'updateStatus']);
        Route::post('/{id}/upload-evidence', [DeliveryController::class, 'uploadEvidence']);
    });
});