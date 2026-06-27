<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin \App\Models\Booking
 */
final class BookingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'uuid'                  => $this->uuid,
            'client'                => new UserResource($this->whenLoaded('client')),
            'companion'             => new UserResource($this->whenLoaded('companion')),
            'venue'                 => new VenueResource($this->whenLoaded('venue')),
            'status'                => $this->status,
            'scheduled_start'       => $this->scheduled_start,
            'scheduled_end'         => $this->scheduled_end,
            'base_amount_cents'     => $this->base_amount_cents,
            'safety_fee_cents'      => $this->safety_fee_cents,
            'platform_fee_cents'    => $this->platform_fee_cents,
            'companion_payout_cents' => $this->companion_payout_cents,
            'purpose'               => $this->purpose,
            'special_requests'      => $this->special_requests,
            'extensions'            => $this->whenLoaded('extensions'),
            'created_at'            => $this->created_at?->toIso8601String(),
            'updated_at'            => $this->updated_at?->toIso8601String(),
        ];
    }
}
