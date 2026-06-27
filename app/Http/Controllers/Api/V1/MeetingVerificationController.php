<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\MeetingVerification;
use App\Services\TOTPService;
use App\Enums\BookingStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MeetingVerificationController extends Controller
{
    private TOTPService $totp;

    public function __construct(TOTPService $totp)
    {
        $this->totp = $totp;
    }

    /**
     * Client generates the offline QR code.
     */
    public function generate(Request $request, Booking $booking)
    {
        // Only the client can generate the QR code
        if ($request->user()->id !== $booking->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($booking->status !== BookingStatus::FUNDED) {
            return response()->json(['message' => 'Booking must be funded before handshake.'], 400);
        }

        $verification = MeetingVerification::firstOrNew(['booking_id' => $booking->id]);

        if (!$verification->exists) {
            $verification->totp_secret = $this->totp->generateSeed();
            $verification->save();
        }

        // Return the raw otpauth URI. The React app handles rendering the QR code offline.
        $uri = $this->totp->generateOtpAuthUrl(
            'Chulx',
            'Client_' . $booking->client_id,
            $verification->totp_secret
        );

        return response()->json([
            'uri' => $uri,
        ]);
    }

    /**
     * Companion verifies the 6-digit TOTP code and locks in GPS coordinates.
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

        // Verify the code with a 30s drift window
        $isValid = $this->totp->verify($verification->totp_secret, $validated['code']);

        if (!$isValid) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
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
        });

        return response()->json([
            'message' => 'Handshake successful. Session started.',
            'booking_status' => $booking->status->value,
        ]);
    }
}
