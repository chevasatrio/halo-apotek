<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;
    protected $guarded = ['id']; // Membolehkan semua kolom diisi kecuali ID
    
    // Relasi (Opsional tapi berguna)
    public function details() {
        return $this->hasMany(TransactionDetail::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // (Opsional) Relasi: Satu item keranjang "milik" satu User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
