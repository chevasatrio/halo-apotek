<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_price'
    ];

    protected $casts = [
        'total_price' => 'float'
    ];

    /**
     * Get the user that owns the cart.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the items for the cart.
     */
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }

    /**
     * Scope a query to only include carts for specific user.
     */
    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Check if cart is empty.
     */
    public function getIsEmptyAttribute()
    {
        return $this->items->isEmpty();
    }

    /**
     * Get the total items count.
     */
    public function getItemsCountAttribute()
    {
        return $this->items->sum('quantity');
    }

    /**
     * Get the total price formatted as currency.
     */
    public function getTotalPriceFormattedAttribute()
    {
        return 'Rp ' . number_format($this->total_price, 0, ',', '.');
    }

    /**
     * Calculate and update the total price.
     */
    public function calculateTotalPrice()
    {
        $total = $this->items->sum(function ($item) {
            return $item->quantity * $item->price;
        });

        $this->update(['total_price' => $total]);
        return $total;
    }

    /**
     * Add product to cart.
     */
    public function addProduct($productId, $quantity = 1)
    {
        $product = Product::findOrFail($productId);

        // Check stock
        if ($product->stock < $quantity) {
            throw new \Exception('Insufficient stock for product: ' . $product->name);
        }

        $cartItem = $this->items()->where('product_id', $productId)->first();

        if ($cartItem) {
            // Update existing item
            $cartItem->increment('quantity', $quantity);
        } else {
            // Add new item
            $this->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $product->price
            ]);
        }

        // Update total price
        $this->calculateTotalPrice();

        return $this->fresh()->load('items.product');
    }

    /**
     * Remove product from cart.
     */
    public function removeProduct($productId)
    {
        $this->items()->where('product_id', $productId)->delete();
        $this->calculateTotalPrice();

        return $this->fresh()->load('items.product');
    }

    /**
     * Update product quantity in cart.
     */
    public function updateProductQuantity($productId, $quantity)
    {
        $product = Product::findOrFail($productId);

        // Check stock
        if ($product->stock < $quantity) {
            throw new \Exception('Insufficient stock for product: ' . $product->name);
        }

        $cartItem = $this->items()->where('product_id', $productId)->first();

        if ($cartItem) {
            if ($quantity > 0) {
                $cartItem->update(['quantity' => $quantity]);
            } else {
                $cartItem->delete();
            }
        } elseif ($quantity > 0) {
            $this->items()->create([
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $product->price
            ]);
        }

        // Update total price
        $this->calculateTotalPrice();

        return $this->fresh()->load('items.product');
    }

    /**
     * Clear all items from cart.
     */
    public function clear()
    {
        $this->items()->delete();
        $this->update(['total_price' => 0]);

        return $this->fresh();
    }

    /**
     * Check if cart contains products that require prescription.
     */
    public function getRequiresPrescriptionAttribute()
    {
        return $this->items->contains(function ($item) {
            return $item->product->requires_prescription ?? false;
        });
    }

    /**
     * Get the prescription required products.
     */
    public function getPrescriptionProductsAttribute()
    {
        return $this->items->filter(function ($item) {
            return $item->product->requires_prescription ?? false;
        })->pluck('product');
    }

    /**
     * Validate cart before checkout.
     */
    public function validateForCheckout()
    {
        $errors = [];

        // Check if cart is empty
        if ($this->isEmpty) {
            $errors[] = 'Keranjang belanja kosong';
        }

        // Check stock availability
        foreach ($this->items as $item) {
            if (!$item->isAvailable) {
                $errors[] = "Stok {$item->product->name} tidak mencukupi";
            }
        }

        return [
            'is_valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Get cart summary.
     */
    public function getSummaryAttribute()
    {
        return [
            'items_count' => $this->items_count,
            'total_price' => $this->total_price,
            'total_price_formatted' => $this->total_price_formatted,
            'requires_prescription' => $this->requires_prescription,
            'is_empty' => $this->isEmpty
        ];
    }
}