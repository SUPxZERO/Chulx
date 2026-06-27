<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CompanionProfile;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

final class CompanionSearchService
{
    /**
     * Search for companions based on various filters.
     *
     * @param  array{
     *     latitude?: float,
     *     longitude?: float,
     *     radius_km?: float,
     *     language?: string,
     *     specialty?: string,
     *     min_rate?: int,
     *     max_rate?: int,
     *     sort_by?: string,
     *     per_page?: int,
     * }  $filters
     */
    public function search(array $filters): LengthAwarePaginator
    {
        $query = CompanionProfile::query()->with('user');

        $latitude  = $filters['latitude'] ?? null;
        $longitude = $filters['longitude'] ?? null;
        $radiusKm  = $filters['radius_km'] ?? 10;

        if ($latitude !== null && $longitude !== null) {
            $query->nearby($latitude, $longitude, $radiusKm);
        }

        if (!empty($filters['language'])) {
            $query->speaks($filters['language']);
        }

        if (!empty($filters['specialty'])) {
            $query->specializedIn($filters['specialty']);
        }

        if (isset($filters['min_rate'])) {
            $query->where('hourly_rate_cents', '>=', $filters['min_rate']);
        }

        if (isset($filters['max_rate'])) {
            $query->where('hourly_rate_cents', '<=', $filters['max_rate']);
        }

        $sortBy = $filters['sort_by'] ?? null;
        match ($sortBy) {
            'distance' => $latitude !== null && $longitude !== null
                ? $query->orderBy('distance_meters', 'asc')
                : $query->orderBy('rating_avg', 'desc'),
            'rating'   => $query->orderBy('rating_avg', 'desc'),
            'price'    => $query->orderBy('hourly_rate_cents', 'asc'),
            default    => $query->orderBy('rating_avg', 'desc'),
        };

        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }
}
