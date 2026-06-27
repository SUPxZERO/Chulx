<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DisputeTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'raised_by',
        'reason',
        'status', // OPEN, RESOLVED_FAVOR_CLIENT, RESOLVED_FAVOR_COMPANION, REFUNDED
        'resolution_notes',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function raiser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'raised_by');
    }
}
