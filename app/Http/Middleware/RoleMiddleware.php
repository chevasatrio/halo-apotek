<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // 1. Cek apakah user login (redundant jika sudah pakai auth:sanctum, tapi good practice)
        if (! $request->user()) {
            return response()->json(['message' => 'Anda belum login'], 401);
        }

        // 2. Cek apakah role user cocok dengan salah satu role yang diizinkan
        // Contoh penggunaan di route: role:admin,kasir (maka $roles = ['admin', 'kasir'])
        if (! in_array($request->user()->role, $roles)) {
            return response()->json([
                'message' => 'Akses Ditolak. Role Anda (' . $request->user()->role . ') tidak diizinkan.'
            ], 403);
        }

        return $next($request);
    }
}