<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        return response()->json([
            // Hitung total uang masuk (hanya yang statusnya 'completed' atau 'shipping' atau 'paid')
            // Sesuaikan status dengan logic bisnis Anda. Di sini kita ambil semua kecuali cancelled/unpaid.
            'total_revenue' => Transaction::whereNotIn('status', ['unpaid', 'cancelled', 'pending'])->sum('total_amount'),
            'total_revenue_formatted' => 'Rp ' . number_format(Transaction::whereNotIn('status', ['unpaid', 'cancelled', 'pending'])->sum('total_amount'), 0, ',', '.'),

            // Statistik Pesanan
            'orders_pending' => Transaction::where('status', 'pending')->count(),
            'orders_processing' => Transaction::where('status', 'processing')->count(),
            'orders_completed' => Transaction::where('status', 'completed')->count(),

            // Statistik Lain
            'total_products' => Product::count(),
            'total_users' => User::where('role', 'pembeli')->count(),
            'low_stock_products' => Product::where('stock', '<', 10)->get() // Peringatan stok menipis
        ]);
    }
}