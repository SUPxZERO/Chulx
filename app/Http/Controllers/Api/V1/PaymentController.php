<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PaymentController extends Controller
{
    /**
     * Generate ABA PayWay checkout session / KHQR payload.
     */
    public function paywayCheckout(Request $request, Booking $booking): JsonResponse
    {
        // 1. Authorization
        if ($request->user()->id !== $booking->client_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // 2. Validate state
        if ($booking->status !== 'ACCEPTED') {
            return response()->json([
                'message' => 'Booking must be ACCEPTED before payment can be initiated.'
            ], 422);
        }

        // 3. Generate PayWay Payload
        // In a real application, we would call the ABA PayWay SDK or API.
        // We'll mock the response to provide the required fields for the frontend.
        
        $totalCents = $booking->base_amount_cents + $booking->safety_fee_cents;
        $amountUsd = number_format($totalCents / 100, 2, '.', '');
        
        $merchantId = config('chulx.payway.merchant_id', 'chulx_mock_merchant');
        $tranId = $booking->uuid;
        $reqTime = now()->format('YmdHis');
        
        // Mock KHQR string
        $khqr = "00020101021238590010A000000615010412345678953038405404" . $amountUsd . "5802KH5905CHULX6010PHNOM PENH6304A1B2";

        return response()->json([
            'hash' => base64_encode(hash_hmac('sha512', $merchantId . $tranId . $amountUsd . $reqTime, config('chulx.payway.api_key', 'mock_secret'), true)),
            'tran_id' => $tranId,
            'amount' => $amountUsd,
            'firstname' => $request->user()->name,
            'email' => $request->user()->email,
            'phone' => $request->user()->phone,
            'khqr' => $khqr,
        ]);
    }
}
