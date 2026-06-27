<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Booking;
use App\Models\LedgerTransaction;
use App\Enums\BookingStatus;
use App\Enums\LedgerType;
use App\Events\BookingFunded;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    /**
     * Handle ABA Payway webhook for payment confirmation.
     * Primary mechanism of the Tri-Fecta Payment Verification pipeline.
     */
    public function abaPayway(Request $request)
    {
        // 1. Verify HMAC Signature
        // In a real application, we would calculate HMAC of payload using ABA_PAYWAY_API_KEY
        // and compare it with the signature sent in the request header.
        $isValidSignature = true; // Mocked for now
        
        if (!$isValidSignature) {
            Log::warning('ABA Payway Webhook: Invalid Signature.', $request->all());
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 403);
        }

        // 2. Extract Data
        $tran_id = $request->input('tran_id'); // This is the Booking UUID
        $amount = $request->input('amount');
        $status = $request->input('status'); // e.g. 'APPROVED'
        
        if ($status !== 'APPROVED') {
            return response()->json(['status' => 'ignored']);
        }

        $booking = Booking::where('uuid', $tran_id)->first();
        
        if (!$booking) {
            Log::error('ABA Payway Webhook: Booking not found.', ['tran_id' => $tran_id]);
            return response()->json(['status' => 'error', 'message' => 'Booking not found'], 404);
        }

        if ($booking->status !== BookingStatus::ACCEPTED) {
            // Already funded or cancelled
            return response()->json(['status' => 'success', 'message' => 'Already processed']);
        }

        // 3. Process Escrow in DB Transaction
        DB::transaction(function () use ($booking, $request) {
            // State Machine Transition
            $booking->transitionTo(BookingStatus::FUNDED);

            // Record Escrow Deposit
            LedgerTransaction::create([
                'booking_id' => $booking->id,
                'user_id' => $booking->client_id,
                'type' => LedgerType::ESCROW_DEPOSIT,
                'amount_cents' => $booking->total_cents,
                'balance_after_cents' => $booking->total_cents, // Simplified
                'gateway_reference_id' => $request->input('apv') ?? 'ABA_MOCK_' . time(),
                'description' => 'Client payment locked in Escrow (ABA Payway)',
            ]);
        });

        // 4. Broadcast to WebSocket (Secondary Verification Mechanism)
        broadcast(new BookingFunded($booking))->toOthers();

        return response()->json(['status' => 'success']);
    }
}
