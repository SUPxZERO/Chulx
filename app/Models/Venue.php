<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\VenueCategory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Venue extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'address',
        'category',
        'latitude',
        'longitude',
        'location',
        'is_approved',
        'approved_by',
        'description',
        'phone',
        'website',
    ];

    protected $casts = [
        'category'    => VenueCategory::class,
        'is_approved' => 'boolean',
        'latitude'    => 'float',
        'longitude'   => 'float',
    ];

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }
}
