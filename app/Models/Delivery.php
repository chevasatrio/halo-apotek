<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'driver_id',
        'tracking_number',
        'status',
        'delivery_address',
        'notes',
        'signature_image',
        'delivery_photo',
        'receiver_name',
        'receiver_phone',
        'current_latitude',
        'current_longitude',
        'location_updated_at',
        'accepted_at',
        'picked_up_at',
        'delivered_at',
        'evidence_uploaded_at'
    ];

    protected $casts = [
        'current_latitude' => 'decimal:8',
        'current_longitude' => 'decimal:8',
        'accepted_at' => 'datetime',
        'picked_up_at' => 'datetime',
        'delivered_at' => 'datetime',
        'evidence_uploaded_at' => 'datetime',
        'location_updated_at' => 'datetime'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeActive($query)
    {
        return $query->whereIn('status', ['accepted', 'picked_up', 'on_delivery']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'delivered');
    }

    public function getHasEvidenceAttribute()
    {
        return !empty($this->signature_image) || !empty($this->delivery_photo);
    }

    public function getEstimatedDeliveryTimeAttribute()
    {
        if ($this->status == 'delivered') {
            return $this->delivered_at;
        }

        $baseTime = $this->created_at;
        
        switch ($this->status) {
            case 'pending':
                return $baseTime->addMinutes(30);
            case 'accepted':
                return $baseTime->addMinutes(60);
            case 'picked_up':
                return $this->picked_up_at ? $this->picked_up_at->addMinutes(45) : $baseTime->addMinutes(90);
            case 'on_delivery':
                return now()->addMinutes(30);
            default:
                return $baseTime->addHours(2);
        }
    }
}