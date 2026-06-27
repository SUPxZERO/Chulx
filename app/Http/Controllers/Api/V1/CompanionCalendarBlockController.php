<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCalendarBlockRequest;
use App\Models\CompanionCalendarBlock;
use Illuminate\Http\JsonResponse;

final class CompanionCalendarBlockController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $blocks = $user->companionCalendarBlocks()
                       ->where('end_datetime', '>=', now()) // Only future/current blocks
                       ->orderBy('start_datetime')
                       ->get();
                       
        return response()->json($blocks);
    }

    public function store(StoreCalendarBlockRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // Prevent overlapping blocks (basic check)
        $overlapping = $user->companionCalendarBlocks()
            ->where(function ($q) use ($request) {
                $q->whereBetween('start_datetime', [$request->validated('start_datetime'), $request->validated('end_datetime')])
                  ->orWhereBetween('end_datetime', [$request->validated('start_datetime'), $request->validated('end_datetime')]);
            })->exists();

        if ($overlapping) {
            return response()->json(['message' => 'This block overlaps with an existing calendar block.'], 422);
        }

        $block = $user->companionCalendarBlocks()->create($request->validated());

        return response()->json([
            'message' => 'Calendar block added.',
            'data'    => $block
        ], 201);
    }

    public function destroy(CompanionCalendarBlock $block): JsonResponse
    {
        // Ensure the block belongs to the authenticated user
        if ($block->companion_id !== auth()->id()) {
            abort(403);
        }

        $block->delete();

        return response()->json(['message' => 'Calendar block removed.']);
    }
}
