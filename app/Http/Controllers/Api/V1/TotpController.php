<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\TotpService;
use Illuminate\Http\Request;

class TotpController extends Controller
{
    /**
     * Generate the offline TOTP secret for the client.
     */
    public function generate(Booking $booking, TotpService $totpService)
    {
        if ($booking->status !== 'FUNDED') {
            return response()->json(['message' => 'Booking must be FUNDED to generate QR.'], 403);
        }

        $secret = $totpService->generateSecret($booking);

        return response()->json(['secret' => $secret]);
    }

    /**
     * Verify the scanned secret from the companion.
     */
    public function verify(Request $request, Booking $booking, TotpService $totpService)
    {
        $request->validate([
            'secret' => 'required|string',
        ]);

        if ($totpService->verify($booking, $request->secret)) {
            // Transition booking to IN_PROGRESS
            if ($booking->status === 'FUNDED') {
                $booking->update(['status' => 'IN_PROGRESS']);
            }
            
            return response()->json(['message' => 'Handshake successful.', 'status' => 'IN_PROGRESS']);
        }

        return response()->json(['message' => 'Invalid or expired QR code.'], 422);
    }
}
