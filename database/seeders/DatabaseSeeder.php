<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat 4 Akun Role Berbeda
        User::create([
            'name' => 'Admin Apotek',
            'email' => 'admin@halo.com',
            'password' => bcrypt('password'),
            'role' => 'admin'
        ]);

        User::create([
            'name' => 'Kasir Cantik',
            'email' => 'kasir@halo.com',
            'password' => bcrypt('password'),
            'role' => 'kasir'
        ]);

        User::create([
            'name' => 'Mas Driver',
            'email' => 'driver@halo.com',
            'password' => bcrypt('password'),
            'role' => 'driver'
        ]);

        User::create([
            'name' => 'Budi Pembeli',
            'email' => 'budi@gmail.com',
            'password' => bcrypt('password'),
            'role' => 'pembeli'
        ]);

        // 2. Buat Produk Dummy
        Product::create([
            'name' => 'Paracetamol 500mg',
            'price' => 5000,
            'stock' => 100,
            'image' => 'obat1.jpg'
        ]);
        
        Product::create([
            'name' => 'Amoxicillin',
            'price' => 12000,
            'stock' => 50,
            'image' => 'obat2.jpg'
        ]);
    }
}