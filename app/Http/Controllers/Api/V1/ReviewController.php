<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\CompanionProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * Store a new review for a completed or paid booking.
     */
    public function store(Request $request, Booking $booking)
    {
        // Must be the client submitting the review
        if ($request->user()->id !== $booking->client_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Booking must be completed or paid
        if (!in_array($booking->status->value, ['COMPLETED', 'PAID'])) {
            return response()->json(['message' => 'Booking must be completed to leave a review.'], 400);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($request, $booking, $validated) {
            $review = Review::create([
                'booking_id' => $booking->id,
                'reviewer_id' => $booking->client_id,
                'reviewee_id' => $booking->companion_id,
                'rating' => $validated['rating'],
                'comment' => $validated['comment'],
            ]);

            // Update Companion's aggregate rating
            $companionProfile = CompanionProfile::where('user_id', $booking->companion_id)->first();
            if ($companionProfile) {
                // In a real production system, this could be queued or calculated via DB aggregation.
                // Doing it sync for MVP simplicity.
                $avgRating = Review::where('reviewee_id', $booking->companion_id)->avg('rating');
                $count = Review::where('reviewee_id', $booking->companion_id)->count();
                
                $companionProfile->update([
                    // Assuming CompanionProfile has these columns, else they are dynamic
                    'rating' => round($avgRating, 2),
                    'total_reviews' => $count,
                ]);
            }

            return response()->json($review, 201);
        });
    }
}
