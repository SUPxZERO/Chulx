<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\BookingPurpose;
use App\Enums\BookingStatus;
use App\Exceptions\StateTransitionException;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Booking extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'client_id',
        'companion_id',
        'venue_id',
        'status',
        'purpose',
        'scheduled_at',
        'started_at',
        'completed_at',
        'duration_minutes',
        'total_cents',
        'fee_cents',
        'notes',
    ];

    protected $casts = [
        'status'           => BookingStatus::class,
        'purpose'          => BookingPurpose::class,
        'scheduled_at'     => 'datetime',
        'started_at'       => 'datetime',
        'completed_at'     => 'datetime',
        'duration_minutes' => 'integer',
        'total_cents'      => 'integer',
        'fee_cents'        => 'integer',
    ];

    /* ------------------------------------------------------------------ */
    /*  Boot – auto-generate UUID                                          */
    /* ------------------------------------------------------------------ */

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $booking): void {
            if (empty($booking->uuid)) {
                $booking->uuid = (string) Str::uuid();
            }
        });
    }

    /* ------------------------------------------------------------------ */
    /*  Relationships                                                      */
    /* ------------------------------------------------------------------ */

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function companion(): BelongsTo
    {
        return $this->belongsTo(User::class, 'companion_id');
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    /**
     * Ledger transactions that reference this booking.
     */
    public function ledgerTransactions(): HasMany
    {
        return $this->hasMany(LedgerTransaction::class);
    }

    /* ------------------------------------------------------------------ */
    /*  State Machine                                                      */
    /* ------------------------------------------------------------------ */

    /**
     * Validate and apply a status transition.
     *
     * @throws StateTransitionException When the transition is illegal.
     */
    public function transitionTo(BookingStatus $newStatus, bool $isAdmin = false): void
    {
        if (! $this->status->canTransitionTo($newStatus)) {
            throw new StateTransitionException(
                "Cannot transition booking [{$this->uuid}] from "
                . "{$this->status->value} to {$newStatus->value}.",
            );
        }

        // DISPUTED state can only be resolved by admin — no self-resolution by client or companion
        if ($this->status === BookingStatus::DISPUTED && !$isAdmin) {
            throw new StateTransitionException(
                "Booking [{$this->uuid}] is DISPUTED and can only be resolved by an administrator."
            );
        }

        $this->status = $newStatus;
        $this->save();
    }

    /* ------------------------------------------------------------------ */
    /*  Scopes                                                             */
    /* ------------------------------------------------------------------ */

    public function scopeForCompanion(Builder $query, int $userId): Builder
    {
        return $query->where('companion_id', $userId);
    }

    public function scopeForClient(Builder $query, int $userId): Builder
    {
        return $query->where('client_id', $userId);
    }

    /**
     * Bookings that are still in an active (non-terminal) state.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->whereNotIn('status', [
            BookingStatus::CANCELLED,
            BookingStatus::PAID,
        ]);
    }
}
