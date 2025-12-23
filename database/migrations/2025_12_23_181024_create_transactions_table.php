<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained(); // Pembeli
            $table->foreignId('driver_id')->nullable()->constrained('users'); // Driver
            $table->string('invoice_code')->unique();
            $table->bigInteger('total_amount');

            // Status Flow
            $table->enum('status', ['pending', 'paid', 'processing', 'shipping', 'completed', 'cancelled'])->default('pending');

            // Evidence
            $table->string('payment_proof')->nullable(); // Bukti Bayar User
            $table->string('delivery_proof')->nullable(); // Bukti Kirim Driver

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
