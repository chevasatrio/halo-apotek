<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('recipient_name')->after('user_id')->nullable();
            $table->string('phone_number')->after('recipient_name')->nullable();
            $table->text('address')->after('phone_number')->nullable();
            $table->string('city')->after('address')->nullable();
            $table->string('postal_code')->after('city')->nullable();
            $table->string('payment_method')->after('total_amount')->default('transfer');
            $table->text('notes')->after('payment_method')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropColumn([
                'recipient_name',
                'phone_number',
                'address',
                'city',
                'postal_code',
                'payment_method',
                'notes'
            ]);
        });
    }
};
