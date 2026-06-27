<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LedgerType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerTransaction extends Model
{
    use HasFactory;
    use HasUuids;

    /* ------------------------------------------------------------------ */
    /*  UUID primary key                                                   */
    /* ------------------------------------------------------------------ */

    public $incrementing = false;

    protected $keyType = 'string';

    /* ------------------------------------------------------------------ */
    /*  Timestamps – only created_at, no updated_at                        */
    /* ------------------------------------------------------------------ */

    public $timestamps = false;

    protected $fillable = [
        'wallet_id',
        'booking_id',
        'type',
        'amount_cents',
        'balance_after_cents',
        'description',
        'metadata',
        'created_at',
    ];

    protected $casts = [
        'type'                => LedgerType::class,
        'metadata'            => 'array',
        'amount_cents'        => 'integer',
        'balance_after_cents' => 'integer',
        'created_at'          => 'datetime',
    ];

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
