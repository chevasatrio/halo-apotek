<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prescription extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'prescription_image',
        'doctor_notes',
        'status',
        'verified_by',
        'verified_at',
        'rejection_reason'
    ];

    protected $casts = [
        'verified_at' => 'datetime'
    ];

    /**
     * Get the order that owns the prescription.
     */
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * Get the user who verified the prescription.
     */
    public function verifier()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /**
     * Scope a query to only include pending prescriptions.
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope a query to only include approved prescriptions.
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    /**
     * Scope a query to only include rejected prescriptions.
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * Check if prescription is pending.
     */
    public function getIsPendingAttribute()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if prescription is approved.
     */
    public function getIsApprovedAttribute()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if prescription is rejected.
     */
    public function getIsRejectedAttribute()
    {
        return $this->status === 'rejected';
    }

    /**
     * Get the prescription image URL.
     */
    public function getImageUrlAttribute()
    {
        return $this->prescription_image ? asset('storage/' . $this->prescription_image) : null;
    }

    /**
     * Get the verification status in Bahasa Indonesia.
     */
    public function getStatusTextAttribute()
    {
        $statuses = [
            'pending' => 'Menunggu Verifikasi',
            'approved' => 'Disetujui',
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
}