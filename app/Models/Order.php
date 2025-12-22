<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'user_id',
        'total_amount',
        'status',
        'payment_status',
        'payment_method',
        'notes',
        'shipping_address',
        'shipping_cost',
        'approved_by',
        'approved_at',
        'processed_by',
        'processed_at'
    ];

    protected $casts = [
        'total_amount' => 'float',
        'shipping_cost' => 'float',
        'approved_at' => 'datetime',
        'processed_at' => 'datetime'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function prescription()
    {
        return $this->hasOne(Prescription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function delivery()
    {
        return $this->hasOne(Delivery::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function getIsPrescriptionRequiredAttribute()
    {
        return $this->items()
            ->whereHas('product', function ($query) {
                $query->where('requires_prescription', true);
            })
            ->exists();
    }
}