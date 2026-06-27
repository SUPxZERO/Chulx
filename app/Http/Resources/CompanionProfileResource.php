<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\CompanionProfile
 */
final class CompanionProfileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'user'                => new UserResource($this->whenLoaded('user')),
            'bio'                 => $this->bio,
            'hourly_rate_cents'   => $this->hourly_rate_cents,
            'hourly_rate_display' => '$' . number_format($this->hourly_rate_cents / 100, 2),
            'languages'           => $this->languages,
            'specialties'         => $this->specialties,
            'availability_status' => $this->availability_status,
            'rating_avg'          => (float) $this->rating_avg,
            'total_bookings'      => (int) $this->total_bookings,
            'verified_at'         => $this->verified_at,
            'distance_km'         => $this->when(
                $this->distance_meters !== null,
                fn () => round($this->distance_meters / 1000, 2),
            ),
        ];
    }
}
