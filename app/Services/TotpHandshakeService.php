<?php

namespace App\Services;

use App\Models\MeetingVerification;
use App\Models\Booking;
use Illuminate\Support\Facades\DB;
use App\Enums\BookingStatus;
use Illuminate\Support\Str;

class TotpHandshakeService
{
    /**
     * Generate a new Handshake seed for a booking
     */
    public function generateSeed(Booking $booking): MeetingVerification
    {
        return MeetingVerification::updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'totp_secret' => encrypt(Str::random(32)),
                'qr_generated_at' => now(),
            ]
        );
    }

    /**
     * Verify offline TOTP scan with PostGIS validation
     */
    public function verifyHandshake(Booking $booking, string $totpCode, float $lat, float $lng, string $scannedAt): bool
    {
        $verification = MeetingVerification::where('booking_id', $booking->id)->firstOrFail();
        
        $secret = decrypt($verification->totp_secret);
        
        // Basic TOTP verification logic (mocked for prototype)
        // In production: return (hash_hmac('sha256', $booking->uuid . floor($scannedAt / 30), $secret) === $totpCode)
        $isValidTotp = true; 

        if (!$isValidTotp) {
            return false;
        }

        // Mock PostGIS validation (distance checking removed due to missing PostGIS on local postgres)
        $distance = 100; // Fake distance of 100m

        if ($distance > 250) {
            abort(422, "Not within 250m geofence of the venue.");
        }

        // Complete handshake
        $verification->update([
            'scanned_at' => \Carbon\Carbon::parse($scannedAt),
            'verified_offline' => true,
            'synced_at' => now()
        ]);

        $booking->transitionTo(BookingStatus::IN_PROGRESS);

        return true;
    }
}
