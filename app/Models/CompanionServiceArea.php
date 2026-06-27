<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanionServiceArea extends Model
{
    use HasFactory;

    protected $fillable = [
        'companion_id',
        'name',
        // 'boundary' is handled explicitly via DB::raw in the controller due to PostGIS
    ];

    public function companion(): BelongsTo
    {
        return $this->belongsTo(User::class, 'companion_id');
    }
}
