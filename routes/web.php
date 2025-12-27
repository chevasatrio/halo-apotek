<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

// Route::get('/', function () {
//     return ['Laravel' => app()->version()];
// });

require __DIR__.'/auth.php';


// Route::get('/', function () {
//     return view('welcome');
// });

Route::get('/', [HomeController::class, 'index']);
Route::get('/beranda', [HomeController::class, 'beranda'])->name('beranda');
Route::get('/produk/{id}', [HomeController::class, 'detailProduk'])->name('produk.detail');
Route::middleware(['auth'])->group(function () {
    Route::get('/keranjang', [HomeController::class, 'keranjang'])->name('keranjang');
    Route::get('/checkout', [HomeController::class, 'checkout'])->name('checkout');
    Route::post('/checkout', [App\Http\Controllers\TransactionController::class, 'store'])->name('checkout.process');
});
