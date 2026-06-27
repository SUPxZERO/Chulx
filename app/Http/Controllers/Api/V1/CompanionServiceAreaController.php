<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreServiceAreaRequest;
use App\Models\CompanionServiceArea;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class CompanionServiceAreaController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        
        // Fetch polygons as GeoJSON strings so the frontend can parse them easily
        $areas = $user->companionServiceAreas()
            ->select('id', 'name', DB::raw('ST_AsGeoJSON(boundary) as boundary_geojson'))
            ->get()
            ->map(function ($area) {
                return [
                    'id'       => $area->id,
                    'name'     => $area->name,
                    'boundary' => json_decode($area->boundary_geojson, true),
                ];
            });

        return response()->json($areas);
    }

    public function store(StoreServiceAreaRequest $request): JsonResponse
    {
        $user = $request->user();
        
        if ($user->companionServiceAreas()->count() >= 5) {
            return response()->json(['message' => 'Maximum of 5 service areas reached.'], 403);
        }

        $geojson = $request->validated('boundary');
        
        // Ensure it's valid GeoJSON by using DB::select
        // NOTE: Standard string injection in DB::raw is unsafe. 
        // We use bindings to protect against SQL injection.
        
        $area = new CompanionServiceArea();
        $area->companion_id = $user->id;
        $area->name = $request->validated('name');
        
        // We must save first to get an ID if we want to update the geometry
        // Alternatively, use an insert statement with raw bindings:
        DB::insert('
            INSERT INTO companion_service_areas (companion_id, name, boundary, created_at, updated_at) 
            VALUES (?, ?, ST_GeomFromGeoJSON(?), ?, ?)
        ', [
            $user->id,
            $request->validated('name'),
            $geojson,
            now(),
            now()
        ]);
        
        // Fetch the newly inserted record
        $insertedArea = $user->companionServiceAreas()->latest('id')->first();

        return response()->json([
            'message' => 'Service area created successfully.',
            'data'    => [
                'id' => $insertedArea->id,
                'name' => $insertedArea->name,
                'boundary' => json_decode($geojson, true)
            ]
        ], 201);
    }

    public function destroy(CompanionServiceArea $area): JsonResponse
    {
        if ($area->companion_id !== auth()->id()) {
            abort(403);
        }

        $area->delete();

        return response()->json(['message' => 'Service area removed.']);
    }
}
