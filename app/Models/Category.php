<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'slug',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get the products for the category.
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Scope a query to only include active categories.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include categories with products.
     */
    public function scopeWithProducts($query)
    {
        return $query->whereHas('products', function ($q) {
            $q->where('is_active', true);
        });
    }

    /**
     * Get the active products count.
     */
    public function getActiveProductsCountAttribute()
    {
        return $this->products()->active()->count();
    }

    /**
     * Get the total products count.
     */
    public function getTotalProductsCountAttribute()
    {
        return $this->products()->count();
    }

    /**
     * Check if category has products.
     */
    public function getHasProductsAttribute()
    {
        return $this->products()->exists();
    }

    /**
     * Check if category is active.
     */
    public function getIsActiveAttribute($value)
    {
        return (bool) $value;
    }

    /**
     * Get the status in Bahasa Indonesia.
     */
    public function getStatusTextAttribute()
    {
        return $this->is_active ? 'Aktif' : 'Non-Aktif';
    }

    /**
     * Get the formatted description (with line breaks).
     */
    public function getDescriptionFormattedAttribute()
    {
        return nl2br(e($this->description));
    }

    /**
     * Get the URL for the category.
     */
    public function getUrlAttribute()
    {
        return route('categories.show', $this->slug);
    }

    /**
     * Activate the category.
     */
    public function activate()
    {
        $this->update(['is_active' => true]);
    }

    /**
     * Deactivate the category.
     */
    public function deactivate()
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Toggle the active status.
     */
    public function toggleActive()
    {
        $this->update(['is_active' => !$this->is_active]);
    }
}