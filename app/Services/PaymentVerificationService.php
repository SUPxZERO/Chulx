<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentVerificationService
{
    protected EscrowLedgerService $escrowService;

    public function __construct(EscrowLedgerService $escrowService)
    {
        $this->escrowService = $escrowService;
    }

    /**
     * Handle incoming webhook from ABA Payway (Primary).
     */
    public function handleWebhook(array $payload, string $signature): void
    {
        // 1. Verify HMAC Signature
        // ... (Mocked for development)
        
        $booking = Booking::where('uuid', $payload['tran_id'])->firstOrFail();
        
        if ($booking->status === \App\Enums\BookingStatus::PENDING) {
            // 2. Deposit into Escrow Ledger
            $this->escrowService->deposit($booking, $payload['hash'], $booking->base_amount_cents + $booking->safety_fee_cents);
            
            // 3. Broadcast WebSocket event to Client (Secondary)
            // event(new \App\Events\PaymentConfirmed($booking));
        }
    }

    /**
     * Active Polling Fallback.
     */
    public function checkStatus(Booking $booking): bool
    {
        if ($booking->status !== \App\Enums\BookingStatus::PENDING) {
            return true;
        }

        // Query ABA Payway directly
        // $response = Http::post('https://checkout.payway.com.kh/api/payment-gateway/v1/payments/check-transaction', [...]);
        
        // Mocking successful response for development
        $isPaid = false; 

        if ($isPaid) {
            $this->escrowService->deposit($booking, 'mock_hash_' . time(), $booking->base_amount_cents + $booking->safety_fee_cents);
            // event(new \App\Events\PaymentConfirmed($booking));
            return true;
        }

        return false;
    }
}
