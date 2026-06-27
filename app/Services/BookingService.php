<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Booking;
use App\Models\CompanionProfile;
use App\Models\LedgerTransaction;
use App\Models\RestrictedZone;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

final class BookingService
{
    public function __construct(
        private readonly FareCalculatorService $fareCalculator,
    ) {}

    /**
     * Create a new booking with PENDING status.
     */
    public function create(User $client, array $validated): Booking
    {
        return DB::transaction(function () use ($client, $validated) {
            $venue = Venue::findOrFail($validated['venue_id']);

            // Validate venue is not inside a restricted zone
            $inRestrictedZone = RestrictedZone::query()
                ->where('is_active', true)
                ->whereRaw(
                    'ST_Contains(boundary, (SELECT location FROM venues WHERE id = ?))',
                    [$venue->id]
                )
                ->exists();

            if ($inRestrictedZone) {
                throw ValidationException::withMessages([
                    'venue_id' => ['The selected venue is in a restricted zone and cannot be booked.'],
                ]);
            }

            $companion = User::findOrFail($validated['companion_id']);
            $profile   = CompanionProfile::where('user_id', $companion->id)->firstOrFail();

            $fare = $this->fareCalculator->calculate(
                hourlyRateCents: $profile->hourly_rate_cents,
                scheduledStart: $validated['scheduled_start'],
                scheduledEnd: $validated['scheduled_end'],
            );

            return Booking::create([
                'uuid'                  => (string) Str::uuid(),
                'client_id'             => $client->id,
                'companion_id'          => $companion->id,
                'venue_id'              => $venue->id,
                'status'                => 'PENDING',
                'scheduled_start'       => $validated['scheduled_start'],
                'scheduled_end'         => $validated['scheduled_end'],
                'base_amount_cents'     => $fare['base_amount_cents'],
                'safety_fee_cents'      => $fare['safety_fee_cents'],
                'platform_fee_cents'    => $fare['platform_fee_cents'],
                'companion_payout_cents' => $fare['companion_payout_cents'],
                'purpose'               => $validated['purpose'],
                'special_requests'      => $validated['special_requests'] ?? null,
            ]);
        });
    }

    /**
     * Companion accepts a pending booking.
     */
    public function accept(Booking $booking, User $companion): Booking
    {
        return DB::transaction(function () use ($booking, $companion) {
            $booking->transitionTo('ACCEPTED');
            $booking->save();

            return $booking->fresh();
        });
    }

    /**
     * Client funds the escrow for an accepted booking.
     */
    public function fund(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking->transitionTo('FUNDED');
            $booking->save();

            $wallet = $booking->client->wallet;
            $totalAmount = $booking->base_amount_cents + $booking->safety_fee_cents;

            LedgerTransaction::create([
                'id'                    => (string) Str::uuid(),
                'wallet_id'             => $wallet->id,
                'booking_id'            => $booking->id,
                'type'                  => 'ESCROW_DEPOSIT',
                'amount_cents'          => -$totalAmount,
                'running_balance_cents' => $wallet->balance_cents - $totalAmount,
                'reference_id'          => 'ESC-' . $booking->uuid,
                'metadata'              => ['action' => 'fund_escrow'],
            ]);

            $wallet->decrement('balance_cents', $totalAmount);
            $wallet->increment('hold_amount_cents', $totalAmount);

            return $booking->fresh();
        });
    }

    /**
     * Start the booking session (companion and client are together).
     */
    public function startSession(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking->transitionTo('IN_PROGRESS');
            $booking->save();

            return $booking->fresh();
        });
    }

    /**
     * Mark the session as completed.
     */
    public function complete(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking->transitionTo('COMPLETED');
            $booking->save();

            return $booking->fresh();
        });
    }

    /**
     * Release payment from escrow to companion and capture platform fees.
     */
    public function releasePayment(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking->transitionTo('PAID');
            $booking->save();

            $clientWallet    = $booking->client->wallet;
            $companionWallet = $booking->companion->wallet;
            $totalHeld       = $booking->base_amount_cents + $booking->safety_fee_cents;

            // Release escrow hold from client wallet
            $clientWallet->decrement('hold_amount_cents', $totalHeld);

            // ESCROW_RELEASE ledger entry on client wallet
            LedgerTransaction::create([
                'id'                    => (string) Str::uuid(),
                'wallet_id'             => $clientWallet->id,
                'booking_id'            => $booking->id,
                'type'                  => 'ESCROW_RELEASE',
                'amount_cents'          => $totalHeld,
                'running_balance_cents' => $clientWallet->balance_cents,
                'reference_id'          => 'REL-' . $booking->uuid,
                'metadata'              => ['action' => 'release_escrow'],
            ]);

            // FEE_CAPTURE ledger entry (platform keeps its commission)
            LedgerTransaction::create([
                'id'                    => (string) Str::uuid(),
                'wallet_id'             => $clientWallet->id,
                'booking_id'            => $booking->id,
                'type'                  => 'FEE_CAPTURE',
                'amount_cents'          => $booking->platform_fee_cents,
                'running_balance_cents' => $clientWallet->balance_cents,
                'reference_id'          => 'FEE-' . $booking->uuid,
                'metadata'              => ['action' => 'capture_platform_fee'],
            ]);

            // SAFETY_FEE ledger entry
            LedgerTransaction::create([
                'id'                    => (string) Str::uuid(),
                'wallet_id'             => $clientWallet->id,
                'booking_id'            => $booking->id,
                'type'                  => 'SAFETY_FEE',
                'amount_cents'          => $booking->safety_fee_cents,
                'running_balance_cents' => $clientWallet->balance_cents,
                'reference_id'          => 'SAF-' . $booking->uuid,
                'metadata'              => ['action' => 'capture_safety_fee'],
            ]);

            // Pay companion
            $companionWallet->increment('balance_cents', $booking->companion_payout_cents);

            return $booking->fresh();
        });
    }

    /**
     * Cancel a booking. If it was funded, issue a refund.
     */
    public function cancel(Booking $booking, string $reason): Booking
    {
        return DB::transaction(function () use ($booking, $reason) {
            $wasFunded = $booking->status === 'FUNDED';

            $booking->transitionTo('CANCELLED');
            $booking->special_requests = ($booking->special_requests ? $booking->special_requests . "\n" : '')
                . '[CANCELLED] ' . $reason;
            $booking->save();

            if ($wasFunded) {
                $clientWallet = $booking->client->wallet;
                $totalRefund  = $booking->base_amount_cents + $booking->safety_fee_cents;

                $clientWallet->increment('balance_cents', $totalRefund);
                $clientWallet->decrement('hold_amount_cents', $totalRefund);

                LedgerTransaction::create([
                    'id'                    => (string) Str::uuid(),
                    'wallet_id'             => $clientWallet->id,
                    'booking_id'            => $booking->id,
                    'type'                  => 'REFUND',
                    'amount_cents'          => $totalRefund,
                    'running_balance_cents' => $clientWallet->balance_cents,
                    'reference_id'          => 'RFD-' . $booking->uuid,
                    'metadata'              => ['action' => 'cancel_refund', 'reason' => $reason],
                ]);
            }

            return $booking->fresh();
        });
    }

    /**
     * Dispute a booking.
     */
    public function dispute(Booking $booking, string $reason): Booking
    {
        return DB::transaction(function () use ($booking, $reason) {
            $booking->transitionTo('DISPUTED');
            $booking->special_requests = ($booking->special_requests ? $booking->special_requests . "\n" : '')
                . '[DISPUTED] ' . $reason;
            $booking->save();

            return $booking->fresh();
        });
    }
}
