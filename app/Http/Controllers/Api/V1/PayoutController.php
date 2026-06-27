<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePayoutRequest;
use App\Models\PayoutRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class PayoutController extends Controller
{
    /**
     * List all payout requests for the authenticated user.
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        
        $payouts = $user->payoutRequests()->latest()->paginate(15);
        
        return response()->json($payouts);
    }

    /**
     * Store a new payout request and hold the funds.
     */
    public function store(StorePayoutRequest $request): JsonResponse
    {
        $user = $request->user();
        $amountCents = (int) $request->validated('amount_cents');
        
        try {
            $payout = DB::transaction(function () use ($user, $amountCents, $request) {
                // 1. Lock the wallet row to prevent concurrent race conditions
                $wallet = $user->wallet()->lockForUpdate()->firstOrFail();
                
                // 2. Calculate available balance (Total - Held)
                $availableBalance = $wallet->balance_cents - $wallet->hold_amount_cents;
                
                if ($availableBalance < $amountCents) {
                    abort(400, 'Insufficient available funds for this payout.');
                }
                
                // 3. Move the funds into the "hold" bucket. 
                // Note: We do NOT deduct balance_cents here yet. The balance is Total, hold is reserved.
                $wallet->hold_amount_cents += $amountCents;
                $wallet->save();
                
                // 4. Create the Payout Request record
                return $user->payoutRequests()->create([
                    'amount_cents'      => $amountCents,
                    'status'            => 'PENDING',
                    'bank_details_json' => $request->validated('bank_details'),
                ]);
            });
            
            return response()->json([
                'message' => 'Payout requested successfully. Funds are on hold.',
                'data'    => $payout
            ], 201);
            
        } catch (\Exception $e) {
            $code = $e->getCode() === 400 ? 400 : 500;
            return response()->json([
                'message' => $e->getMessage() ?: 'An error occurred while processing the payout request.'
            ], $code);
        }
    }
}
