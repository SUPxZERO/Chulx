<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanionSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'companion_id',
        'day_of_week',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        // start_time and end_time are best left as strings in 'H:i:s' format for APIs
    ];

    public function companion(): BelongsTo
    {
        return $this->belongsTo(User::class, 'companion_id');
    }
}
