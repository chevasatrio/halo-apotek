<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;
    protected $guarded = ['id']; // Membolehkan semua kolom diisi kecuali ID
    
    // Relasi (Opsional tapi berguna)
    public function details() {
        return $this->hasMany(TransactionDetail::class);
    }
}
