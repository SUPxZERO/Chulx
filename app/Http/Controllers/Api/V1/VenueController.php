<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\VenueResource;
use App\Models\Venue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class VenueController extends Controller
{
    /**
     * List approved venues (paginated).
     */
    public function index(Request $request): JsonResponse
    {
        $venues = Venue::where('is_approved', true)
            ->orderBy('name')
            ->paginate(15);

        return response()->json(
            VenueResource::collection($venues)->response()->getData(true),
        );
    }

    /**
     * Show a single venue.
     */
    public function show(Venue $venue): JsonResponse
    {
        return response()->json([
            'data' => new VenueResource($venue),
        ]);
    }
}
