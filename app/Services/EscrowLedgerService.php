<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\LedgerTransaction;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Enums\LedgerType;
use App\Enums\BookingStatus;

class EscrowLedgerService
{
    /**
     * Record an escrow deposit from a client payment.
     */
    public function deposit(Booking $booking, string $referenceId, int $amountCents): LedgerTransaction
    {
        return DB::transaction(function () use ($booking, $referenceId, $amountCents) {
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $booking->client_id],
                ['balance_cents' => 0, 'currency' => 'KHR']
            );

            // Escrow holds funds, so running balance for the user doesn't increase, 
            // but the platform holds it. For simplicity, we just record the transaction.
            $transaction = LedgerTransaction::create([
                'uuid' => Str::uuid(),
                'wallet_id' => $wallet->id,
                'booking_id' => $booking->id,
                'type' => LedgerType::ESCROW_DEPOSIT,
                'amount_cents' => $amountCents,
                'running_balance_cents' => $wallet->balance_cents,
                'reference_id' => $referenceId,
            ]);

            $booking->transitionTo(BookingStatus::FUNDED);

            return $transaction;
        });
    }

    /**
     * Release escrow to companion and capture platform fee.
     */
    public function releaseAndCapture(Booking $booking, string $referenceId): void
    {
        DB::transaction(function () use ($booking, $referenceId) {
            $companionWallet = Wallet::firstOrCreate(
                ['user_id' => $booking->companion_id],
                ['balance_cents' => 0, 'currency' => 'KHR']
            );

            // Escrow release to companion (80%)
            $companionAmount = $booking->companion_payout_cents;
            $companionWallet->balance_cents += $companionAmount;
            $companionWallet->save();

            LedgerTransaction::create([
                'uuid' => Str::uuid(),
                'wallet_id' => $companionWallet->id,
                'booking_id' => $booking->id,
                'type' => LedgerType::ESCROW_RELEASE,
                'amount_cents' => $companionAmount,
                'running_balance_cents' => $companionWallet->balance_cents,
                'reference_id' => $referenceId,
            ]);

            // Fee capture (20% commission + 5% safety fee)
            $platformFee = $booking->platform_fee_cents + $booking->safety_fee_cents;
            
            LedgerTransaction::create([
                'uuid' => Str::uuid(),
                'wallet_id' => null, // null wallet implies platform master wallet
                'booking_id' => $booking->id,
                'type' => LedgerType::FEE_CAPTURE,
                'amount_cents' => $platformFee,
                'running_balance_cents' => 0,
                'reference_id' => $referenceId,
            ]);

            $booking->transitionTo(BookingStatus::PAID);
        });
    }

    /**
     * Refund a client.
     */
    public function refund(Booking $booking, string $referenceId, int $amountCents): LedgerTransaction
    {
        return DB::transaction(function () use ($booking, $referenceId, $amountCents) {
            $clientWallet = Wallet::firstOrCreate(
                ['user_id' => $booking->client_id],
                ['balance_cents' => 0, 'currency' => 'KHR']
            );

            $transaction = LedgerTransaction::create([
                'uuid' => Str::uuid(),
                'wallet_id' => $clientWallet->id,
                'booking_id' => $booking->id,
                'type' => LedgerType::REFUND,
                'amount_cents' => $amountCents,
                'running_balance_cents' => $clientWallet->balance_cents,
                'reference_id' => $referenceId,
            ]);

            $booking->transitionTo(BookingStatus::CANCELLED);

            return $transaction;
        });
    }
}
