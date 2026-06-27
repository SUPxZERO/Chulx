<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AvailabilityStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompanionProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'languages',
        'specialties',
        'hourly_rate_cents',
        'availability_status',
        'rating_avg',
        'rating_count',
        'last_location',
        'verified_at',
    ];

    protected $casts = [
        'languages'           => 'array',
        'specialties'         => 'array',
        'availability_status' => AvailabilityStatus::class,
        'rating_avg'          => 'float',
        'rating_count'        => 'integer',
        'hourly_rate_cents'   => 'integer',
        'verified_at'         => 'datetime',
    ];

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * All bookings where this companion's user is the assigned companion.
     */
    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class, 'companion_id', 'user_id');
    }

    /* ------------------------------------------------------------------ */
    /*  Scopes                                                             */
    /* ------------------------------------------------------------------ */

    /**
     * Only companions currently marked as available.
     */
    public function scopeAvailable(Builder $query): Builder
    {
        return $query->where('availability_status', AvailabilityStatus::AVAILABLE);
    }

    /**
     * Companions within `$radiusKm` of a given coordinate.
     * Relies on PostGIS `geography` cast for metre-accurate distance.
     */
    public function scopeNearby(Builder $query, float $lat, float $lng, float $radiusKm): Builder
    {
        $radiusMeters = $radiusKm * 1000;

        return $query->whereRaw(
            'ST_DWithin(last_location, ST_MakePoint(?, ?)::geography, ?)',
            [$lng, $lat, $radiusMeters],
        );
    }

    /**
     * Companions who speak a given language (stored as JSONB array).
     */
    public function scopeSpeaks(Builder $query, string $language): Builder
    {
        return $query->whereJsonContains('languages', $language);
    }
}
