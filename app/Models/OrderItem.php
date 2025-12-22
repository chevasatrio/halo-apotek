<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'subtotal'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float',
        'subtotal' => 'float',
    ];

    /**
     * Get the order that owns the order item.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the product that owns the order item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope a query to only include items with specific product.
     */
    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Calculate subtotal automatically.
     */
    public function calculateSubtotal()
    {
        return $this->quantity * $this->price;
    }

    /**
     * Update subtotal based on quantity and price.
     */
    public function updateSubtotal()
    {
        $this->subtotal = (float) $this->calculateSubtotal();
        $this->save();
    }

    /**
     * Get the price formatted as currency.
     */
    public function getPriceFormattedAttribute()
    {
        return 'Rp ' . number_format((float) ($this->price ?? 0), 0, ',', '.');
    }

    /**
     * Get the subtotal formatted as currency.
     */
    public function getSubtotalFormattedAttribute()
    {
        return 'Rp ' . number_format((float) ($this->subtotal ?? 0), 0, ',', '.');
    }

    /**
     * Check if the product requires prescription.
     */
    public function getRequiresPrescriptionAttribute()
    {
        return $this->product->requires_prescription ?? false;
    }

    /**
     * Get the product name.
     */
    public function getProductNameAttribute()
    {
        return $this->product->name ?? 'Product Deleted';
    }

    /**
     * Get the product image URL.
     */
    public function getProductImageAttribute()
    {
        return $this->product->image_url ?? null;
    }

    /**
     * Get the product category.
     */
    public function getProductCategoryAttribute()
    {
        return $this->product->category->name ?? null;
    }
}