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
        $payload = $request->getContent();
        $apiKey = config('chulx.payway.api_key', 'mock_secret_key');
        // In local development, bypass HMAC if X-Payway-Signature is missing, to allow manual testing
        $receivedSignature = $request->header('X-Payway-Signature');
        
        $isValidSignature = false;
        if ($receivedSignature) {
            $computedSignature = base64_encode(hash_hmac('sha512', $payload, $apiKey, true));
            $isValidSignature = hash_equals($computedSignature, $receivedSignature);
        } elseif (app()->environment('local')) {
            $isValidSignature = true;
        }

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
            $booking->save();

            $totalCents = $booking->base_amount_cents + $booking->safety_fee_cents;

            $wallet = $booking->client->wallet;
            $wallet->increment('hold_amount_cents', $totalCents);

            // Record Escrow Deposit directly from Gateway
            LedgerTransaction::create([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'wallet_id' => $wallet->id,
                'booking_id' => $booking->id,
                'type' => 'ESCROW_DEPOSIT',
                'amount_cents' => $totalCents,
                'running_balance_cents' => $wallet->balance_cents, // Gateway direct
                'reference_id' => $request->input('apv') ?? 'ABA_MOCK_' . time(),
                'metadata' => ['action' => 'gateway_escrow', 'gateway' => 'ABA_PAYWAY'],
            ]);
        });

        // 4. Broadcast to WebSocket (Secondary Verification Mechanism)
        broadcast(new BookingFunded($booking))->toOthers();

        return response()->json(['status' => 'success']);
    }
}
