<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MeetingVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'totp_secret',
        'scanned_at',
        'verified_offline',
        'client_lat',
        'client_lng',
    ];

    protected $casts = [
        'scanned_at' => 'datetime',
        'verified_offline' => 'boolean',
        'client_lat' => 'decimal:8',
        'client_lng' => 'decimal:8',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
