<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLocationPingRequest;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

final class LocationPingController extends Controller
{
    /**
     * Store a high-frequency location ping.
     */
    public function store(StoreLocationPingRequest $request, Booking $booking): JsonResponse
    {
        $user = $request->user();

        // 1. Authorization: Only the assigned companion can ping
        if ($booking->companion_id !== $user->id) {
            abort(403);
        }

        // 2. State Check: Only allow pings when ACTIVE (Accepted, Funded, or In Progress)
        $validStatuses = [
            BookingStatus::ACCEPTED,
            BookingStatus::FUNDED,
            BookingStatus::IN_PROGRESS
        ];

        if (!in_array($booking->status, $validStatuses, true)) {
            abort(400, 'Location tracking is not active for this booking status.');
        }

        $lat = $request->validated('lat');
        $lng = $request->validated('lng');

        // 3. High Performance Insert using DB facade (Bypass Eloquent Model overhead)
        DB::insert('
            INSERT INTO location_pings (booking_id, companion_id, location, speed, heading, battery_level, created_at)
            VALUES (?, ?, ST_MakePoint(? , ?), ?, ?, ?, ?)
        ', [
            $booking->id,
            $user->id,
            $lng, // ST_MakePoint takes (lon, lat)
            $lat,
            $request->validated('speed'),
            $request->validated('heading'),
            $request->validated('battery_level'),
            now()
        ]);

        // 4. Update the user\'s last known location for quick lookup
        DB::update('
            UPDATE users 
            SET last_location = ST_MakePoint(?, ?), last_location_updated_at = ?
            WHERE id = ?
        ', [
            $lng,
            $lat,
            now(),
            $user->id
        ]);

        // 5. Return 202 Accepted. No payload needed for a ping.
        return response()->json(null, 202);
    }
}
