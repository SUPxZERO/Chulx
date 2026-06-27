<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LocationPing extends Model
{
    use HasFactory;

    // We do NOT use typical updated_at for an append-only log table.
    // Ensure you turned off timestamps if your migration only has created_at,
    // or just let Laravel manage it if both exist. We'll leave it default.
    public $timestamps = false;

    protected $fillable = [
        'booking_id',
        'companion_id',
        // 'location' is handled via DB::raw in the controller
        'speed',
        'heading',
        'battery_level',
        'created_at',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function companion(): BelongsTo
    {
        return $this->belongsTo(User::class, 'companion_id');
    }
}
