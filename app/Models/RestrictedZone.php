<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\ZoneType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RestrictedZone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'zone_type',
        'boundary',
        'is_active',
        'description',
    ];

    protected $casts = [
        'zone_type' => ZoneType::class,
        'is_active' => 'boolean',
    ];
}
