<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'payment_number',
        'amount',
        'method',
        'payment_proof',
        'status',
        'notes',
        'verified_by',
        'verified_at'
    ];

    protected $casts = [
        'amount' => 'float',
        'verified_at' => 'datetime'
    ];

    /**
     * Get the order that owns the payment.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who verified the payment.
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope a query to only include pending payments.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include verified payments.
     */
    public function scopeVerified($query)
    {
        return $query->where('status', 'verified');
    }

    /**
     * Scope a query to only include rejected payments.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if payment is pending.
     */
    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if payment is verified.
     */
    public function getIsVerifiedAttribute()
    {
        return $this->status === 'verified';
    }

    /**
     * Check if payment is rejected.
     */
    public function getIsRejectedAttribute()
    {
        return $this->status === 'rejected';
    }

    /**
     * Get the payment proof URL.
     */
    public function getProofUrlAttribute()
    {
        return $this->payment_proof ? asset('storage/' . $this->payment_proof) : null;
    }

    /**
     * Get the payment method in Bahasa Indonesia.
     */
    public function getMethodTextAttribute()
    {
        $methods = [
            'cash' => 'Tunai',
            'transfer' => 'Transfer Bank',
            'credit_card' => 'Kartu Kredit',
            'qris' => 'QRIS'
        ];

        return $methods[$this->method] ?? $this->method;
    }

    /**
     * Get the payment status in Bahasa Indonesia.
     */
    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => 'Menunggu Verifikasi',
            'verified' => 'Terverifikasi',
            'rejected' => 'Ditolak'
        ];

        return $statuses[$this->status] ?? $this->status;
    }

    /**
     * Get the verification date formatted.
     */
    public function getVerifiedAtFormattedAttribute()
    {
        return $this->verified_at ? $this->verified_at->format('d/m/Y H:i') : null;
    }

    /**
     * Get the amount formatted as currency.
     */
    public function getAmountFormattedAttribute()
    {
        return 'Rp ' . number_format((float) $this->amount, 0, ',', '.');
    }

    /**
     * Check if payment has proof.
     */
    public function getHasProofAttribute()
    {
        return !empty($this->payment_proof);
    }
}