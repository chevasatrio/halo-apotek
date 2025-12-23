<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;
    protected $guarded = ['id']; // Membolehkan semua kolom diisi kecuali ID

    // Relasi (Opsional tapi berguna)
    public function details()
    {
        return $this->hasMany(TransactionDetail::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function driver()
    { // Relasi ke driver (user)
        return $this->belongsTo(User::class, 'driver_id');
    }
}
