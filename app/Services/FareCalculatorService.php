<?php

declare(strict_types=1);

namespace App\Services;

use Carbon\Carbon;

final class FareCalculatorService
{
    /**
     * Calculate all fare components for a booking.
     *
     * @return array{base_amount_cents: int, safety_fee_cents: int, platform_fee_cents: int, companion_payout_cents: int}
     */
    public function calculate(int $hourlyRateCents, string $scheduledStart, string $scheduledEnd): array
    {
        $start = Carbon::parse($scheduledStart);
        $end   = Carbon::parse($scheduledEnd);

        $hours = (int) ceil($start->diffInMinutes($end) / 60);
        $hours = max($hours, 1);

        $baseAmountCents    = $hourlyRateCents * $hours;
        $safetyFeeCents     = (int) round(config('chulx.safety_fee') * 100);
        $platformFeeCents   = (int) round($baseAmountCents * config('chulx.commission_rate'));
        $companionPayoutCents = $baseAmountCents - $platformFeeCents;

        return [
            'base_amount_cents'     => $baseAmountCents,
            'safety_fee_cents'      => $safetyFeeCents,
            'platform_fee_cents'    => $platformFeeCents,
            'companion_payout_cents' => $companionPayoutCents,
        ];
    }
}
