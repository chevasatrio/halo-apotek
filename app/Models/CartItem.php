<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'product_id',
        'quantity',
        'price'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'price' => 'float'
    ];

    /**
     * Get the cart that owns the cart item.
     */
    public function cart()
    {
        return $this->belongsTo(Cart::class);
    }

    /**
     * Get the product that owns the cart item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Scope a query to only include items from specific cart.
     */
    public function scopeByCart($query, $cartId)
    {
        return $query->where('cart_id', $cartId);
    }

    /**
     * Scope a query to only include items with specific product.
     */
    public function scopeByProduct($query, $productId)
    {
        return $query->where('product_id', $productId);
    }

    /**
     * Calculate subtotal for this cart item.
     */
    public function getSubtotalAttribute()
    {
        return $this->quantity * $this->price;
    }

    /**
     * Get the subtotal formatted as currency.
     */
    public function getSubtotalFormattedAttribute()
    {
        return 'Rp ' . number_format($this->subtotal, 0, ',', '.');
    }

    /**
     * Get the price formatted as currency.
     */
    public function getPriceFormattedAttribute()
    {
        return 'Rp ' . number_format($this->price, 0, ',', '.');
    }

    /**
     * Check if the product is available in stock.
     */
    public function getIsAvailableAttribute()
    {
        return $this->product->stock >= $this->quantity;
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
     * Get the maximum quantity available (based on stock).
     */
    public function getMaxQuantityAttribute()
    {
        return min($this->product->stock, 10); // Max 10 items per order
    }

    /**
     * Increase quantity by given amount.
     */
    public function increaseQuantity($amount = 1)
    {
        $this->increment('quantity', $amount);
    }

    /**
     * Decrease quantity by given amount.
     */
    public function decreaseQuantity($amount = 1)
    {
        if ($this->quantity > $amount) {
            $this->decrement('quantity', $amount);
        } else {
            $this->delete();
        }
    }

    /**
     * Update price if product price has changed.
     */
    public function updatePrice()
    {
        $currentPrice = $this->product->price;
        if ($this->price != $currentPrice) {
            $this->update(['price' => $currentPrice]);
        }
    }
}