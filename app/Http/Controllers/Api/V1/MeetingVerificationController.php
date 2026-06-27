<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\MeetingVerification;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingVerificationController extends Controller
{
    /**
     * Client generates/retrieves the static 6-digit PIN.
     */
    public function generate(Request $request, Booking $booking)
    {
        // Only the client can generate the QR code/PIN
        if ($request->user()->id !== $booking->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== BookingStatus::FUNDED) {
            return response()->json(['message' => 'Booking must be funded before handshake.'], 400);
        }

        $verification = MeetingVerification::firstOrNew(['booking_id' => $booking->id]);

        if (!$verification->exists || !$verification->totp_secret) {
            // Generate a secure 6-digit static PIN
            $verification->totp_secret = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            $verification->save();
        }

        return response()->json([
            'pin' => $verification->totp_secret,
        ]);
    }

    /**
     * Companion verifies the 6-digit PIN and locks in GPS coordinates.
     */
    public function verify(Request $request, Booking $booking)
    {
        // Only companion can verify the code
        if ($request->user()->id !== $booking->companion_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== BookingStatus::FUNDED) {
            return response()->json(['message' => 'Booking must be funded to start session.'], 400);
        }

        $validated = $request->validate([
            'code' => 'required|string|size:6',
            'client_lat' => 'required|numeric',
            'client_lng' => 'required|numeric',
        ]);

        $verification = MeetingVerification::where('booking_id', $booking->id)->first();

        if (!$verification) {
            return response()->json(['message' => 'Handshake not initiated by client.'], 400);
        }

        if ($verification->verified_offline) {
            return response()->json(['message' => 'Already verified.'], 400);
        }

        // Verify the static PIN
        if (!hash_equals($verification->totp_secret, $validated['code'])) {
            return response()->json(['message' => 'Invalid PIN.'], 422);
        }

        // Lock it in using a DB transaction
        DB::transaction(function () use ($booking, $verification, $validated) {
            $verification->update([
                'verified_offline' => true,
                'scanned_at' => now(),
                'client_lat' => $validated['client_lat'],
                'client_lng' => $validated['client_lng'],
            ]);

            // Transition the booking to IN_PROGRESS. 
            // This strictly locks the Escrow and starts the billing clock.
            $booking->transitionTo(BookingStatus::IN_PROGRESS);
            $booking->save();
        });

        return response()->json([
            'message' => 'Handshake successful. Session started.',
            'booking_status' => $booking->status->value,
        ]);
    }
}
