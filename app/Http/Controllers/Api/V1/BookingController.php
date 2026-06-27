<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreBookingRequest;
use App\Http\Resources\BookingResource;
use App\Models\Booking;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    /**
     * List bookings for the authenticated user (client or companion).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $bookings = Booking::with(['client', 'companion', 'venue'])
            ->where(function ($query) use ($user) {
                $query->where('client_id', $user->id)
                      ->orWhere('companion_id', $user->id);
            })
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json(
            BookingResource::collection($bookings)->response()->getData(true),
        );
    }

    /**
     * Create a new booking.
     */
    public function store(StoreBookingRequest $request): JsonResponse
    {
        $booking = $this->bookingService->create(
            client: $request->user(),
            validated: $request->validated(),
        );

        $booking->load(['client', 'companion', 'venue']);

        return response()->json([
            'data' => new BookingResource($booking),
        ], 201);
    }

    /**
     * Show a single booking.
     */
    public function show(Booking $booking): JsonResponse
    {
        $booking->load(['client', 'companion', 'venue']);

        return response()->json([
            'data' => new BookingResource($booking),
        ]);
    }

    /**
     * Companion accepts the booking.
     */
    public function accept(Booking $booking, Request $request): JsonResponse
    {
        $booking = $this->bookingService->accept($booking, $request->user());

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }

    /**
     * Active Polling Fallback: Check payment status directly from DB.
     */
    public function paymentStatus(Booking $booking): JsonResponse
    {
        // For security, ensure the user is the client or companion
        $user = request()->user();
        if ($booking->client_id !== $user->id && $booking->companion_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'status' => $booking->status->value,
            'is_funded' => $booking->status === BookingStatus::FUNDED || $booking->status === BookingStatus::IN_PROGRESS,
        ]);
    }

    /**
     * Client funds the escrow (Legacy/Mock logic, normally replaced by Webhook).
     */
    public function fund(Booking $booking): JsonResponse
    {
        $booking = $this->bookingService->fund($booking);

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }

    /**
     * Start the session.
     */
    public function start(Booking $booking): JsonResponse
    {
        $booking = $this->bookingService->startSession($booking);

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }

    /**
     * Complete the session.
     */
    public function complete(Booking $booking): JsonResponse
    {
        $booking = $this->bookingService->complete($booking);

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }

    /**
     * Release payment from escrow.
     */
    public function release(Booking $booking): JsonResponse
    {
        $booking = $this->bookingService->releasePayment($booking);

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }

    /**
     * Cancel the booking.
     */
    public function cancel(Booking $booking, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $booking = $this->bookingService->cancel($booking, $request->input('reason'));

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }

    /**
     * Dispute the booking.
     */
    public function dispute(Booking $booking, Request $request): JsonResponse
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $booking = $this->bookingService->dispute($booking, $request->input('reason'));

        return response()->json([
            'data' => new BookingResource($booking->load(['client', 'companion', 'venue'])),
        ]);
    }
}
