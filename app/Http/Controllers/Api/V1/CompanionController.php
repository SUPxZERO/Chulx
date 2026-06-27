<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\SearchCompanionRequest;
use App\Http\Resources\CompanionProfileResource;
use App\Models\CompanionProfile;
use App\Services\CompanionSearchService;
use Illuminate\Http\JsonResponse;

final class CompanionController extends Controller
{
    public function __construct(
        private readonly CompanionSearchService $searchService,
    ) {}

    /**
     * Search / list companions.
     */
    public function index(SearchCompanionRequest $request): JsonResponse
    {
        $results = $this->searchService->search($request->validated());

        return response()->json(
            CompanionProfileResource::collection($results)->response()->getData(true),
        );
    }

    /**
     * Show a single companion profile.
     */
    public function show(int $id): JsonResponse
    {
        $profile = CompanionProfile::with('user')->findOrFail($id);

        return response()->json([
            'data' => new CompanionProfileResource($profile),
        ]);
    }
}
