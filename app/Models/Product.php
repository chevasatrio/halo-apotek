<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'price',
        'stock',
        'image',
        'category_id',
        'type',
        'requires_prescription',
        'is_active'
    ];

    protected $casts = [
        'price' => 'float',
        'stock' => 'integer',
        'requires_prescription' => 'boolean',
        'is_active' => 'boolean'
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function cartItems()
    {
        return $this->hasMany(CartItem::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeAvailable($query)
    {
        return $query->where('stock', '>', 0);
    }

// Tambahkan ke Product.php setelah method yang sudah ada

/**
 * Get the image URL.
 */
public function getImageUrlAttribute()
{
    if (!$this->image) {
        return asset('images/default-product.jpg');
    }
    
    if (str_starts_with($this->image, 'http')) {
        return $this->image;
    }
    
    return asset('storage/' . $this->image);
}

/**
 * Get the price formatted as currency.
 */
public function getPriceFormattedAttribute()
{
    return 'Rp ' . number_format($this->price, 0, ',', '.');
}

/**
 * Check if product is out of stock.
 */
public function getIsOutOfStockAttribute()
{
    return $this->stock <= 0;
}

/**
 * Check if product is low in stock.
 */
public function getIsLowStockAttribute()
{
    return $this->stock > 0 && $this->stock <= 10;
}

/**
 * Get the type in Bahasa Indonesia.
 */
public function getTypeTextAttribute()
{
    $types = [
        'obat_bebas' => 'Obat Bebas',
        'obat_keras' => 'Obat Keras',
        'alat_kesehatan' => 'Alat Kesehatan'
    ];

    return $types[$this->type] ?? $this->type;
}

/**
 * Get the prescription requirement in Bahasa Indonesia.
 */
public function getPrescriptionTextAttribute()
{
    return $this->requires_prescription ? 'Perlu Resep' : 'Tidak Perlu Resep';
}

/**
 * Decrease stock by given quantity.
 */
public function decreaseStock($quantity)
{
    if ($this->stock < $quantity) {
        throw new \Exception('Insufficient stock');
    }
    
    $this->decrement('stock', $quantity);
}

/**
 * Increase stock by given quantity.
 */
public function increaseStock($quantity)
{
    $this->increment('stock', $quantity);
}

/**
 * Get related products (same category).
 */
public function relatedProducts($limit = 4)
{
    return self::where('category_id', $this->category_id)
        ->where('id', '!=', $this->id)
        ->where('is_active', true)
        ->where('stock', '>', 0)
        ->limit($limit)
        ->get();
}
}