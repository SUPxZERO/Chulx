<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreBookingExtensionRequest;
use App\Models\Booking;
use App\Models\BookingExtension;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class BookingExtensionController extends Controller
{
    /**
     * Client requests an extension.
     */
    public function store(StoreBookingExtensionRequest $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        if ($booking->client_id !== $user->id) {
            abort(403, 'Only the client can request an extension.');
        }

        if ($booking->status->value !== 'in_progress') {
            abort(400, 'Extensions can only be requested while the booking is in progress.');
        }

        $additionalCents = (int) $request->validated('additional_cents');

        $extension = DB::transaction(function () use ($user, $booking, $request, $additionalCents) {
            $wallet = $user->wallet()->lockForUpdate()->firstOrFail();
            $availableBalance = $wallet->balance_cents - $wallet->hold_amount_cents;

            if ($availableBalance < $additionalCents) {
                abort(400, 'Insufficient available funds to cover this extension.');
            }

            // Put funds on hold
            $wallet->hold_amount_cents += $additionalCents;
            $wallet->save();

            return $booking->bookingExtensions()->create([
                'requested_duration_minutes' => $request->validated('requested_duration_minutes'),
                'additional_cents'           => $additionalCents,
                'status'                     => 'PENDING',
            ]);
        });

        return response()->json([
            'message' => 'Extension requested successfully. Waiting for companion approval.',
            'data'    => $extension,
        ], 201);
    }

    /**
     * Companion accepts the extension.
     */
    public function accept(Request $request, Booking $booking, BookingExtension $extension): JsonResponse
    {
        $user = $request->user();

        if ($booking->companion_id !== $user->id) {
            abort(403, 'Only the companion can accept an extension.');
        }

        if ($extension->booking_id !== $booking->id || $extension->status !== 'PENDING') {
            abort(400, 'Invalid extension request.');
        }

        DB::transaction(function () use ($booking, $extension) {
            $extension->update(['status' => 'ACCEPTED']);

            // Actually update the booking financial/time logic
            $booking->base_amount_cents += $extension->additional_cents;
            // Assuming companion_payout_cents also scales, though typically we'd recalculate fees. 
            // For MVP we just add the additional_cents directly.
            $booking->companion_payout_cents += $extension->additional_cents; 
            
            // Note: scheduled_end might be updated, but duration logic is handled via start/complete events
            $booking->save();
        });

        return response()->json([
            'message' => 'Extension accepted.',
            'data'    => $extension,
        ]);
    }

    /**
     * Companion rejects the extension.
     */
    public function reject(Request $request, Booking $booking, BookingExtension $extension): JsonResponse
    {
        $user = $request->user();

        if ($booking->companion_id !== $user->id) {
            abort(403, 'Only the companion can reject an extension.');
        }

        if ($extension->booking_id !== $booking->id || $extension->status !== 'PENDING') {
            abort(400, 'Invalid extension request.');
        }

        DB::transaction(function () use ($booking, $extension) {
            $extension->update(['status' => 'REJECTED']);

            // Release the client's hold
            $clientWallet = $booking->client->wallet()->lockForUpdate()->firstOrFail();
            $clientWallet->hold_amount_cents -= $extension->additional_cents;
            $clientWallet->save();
        });

        return response()->json([
            'message' => 'Extension rejected. Funds released back to client.',
            'data'    => $extension,
        ]);
    }
}
