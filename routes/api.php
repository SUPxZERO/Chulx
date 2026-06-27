<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\BookingExtensionController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\CompanionController;
use App\Http\Controllers\Api\V1\CompanionScheduleController;
use App\Http\Controllers\Api\V1\CompanionCalendarBlockController;
use App\Http\Controllers\Api\V1\CompanionServiceAreaController;
use App\Http\Controllers\Api\V1\LocationPingController;
use App\Http\Controllers\Api\V1\MeetingVerificationController;
use App\Http\Controllers\Api\V1\VenueController;
use App\Http\Controllers\Api\V1\PaymentController;
use App\Http\Controllers\Api\V1\PayoutController;
use App\Http\Controllers\Api\V1\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api/v1 (the /api prefix is applied
| automatically by Laravel's RouteServiceProvider).
|
*/

Route::prefix('v1')->group(function () {

    // ------------------------------------------------------------------
    // Public (unauthenticated)
    // ------------------------------------------------------------------
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // ------------------------------------------------------------------
    // Webhooks
    // ------------------------------------------------------------------
    Route::post('/webhooks/aba', [App\Http\Controllers\Api\V1\WebhookController::class, 'abaPayway']);

    // ------------------------------------------------------------------
    // Authenticated (Sanctum)
    // ------------------------------------------------------------------
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/profile/kyc', [\App\Http\Controllers\Api\V1\ProfileController::class, 'uploadKyc']);

        // Payouts
        Route::get('/payouts', [PayoutController::class, 'index']);
        Route::post('/payouts', [PayoutController::class, 'store']);

        // Companions
        Route::get('/companions', [CompanionController::class, 'index']);
        Route::get('/companions/{id}', [CompanionController::class, 'show']);

        // Advanced Scheduling
        Route::get('/companions/me/schedule', [CompanionScheduleController::class, 'index']);
        Route::put('/companions/me/schedule', [CompanionScheduleController::class, 'update']);
        
        Route::get('/companions/me/calendar-blocks', [CompanionCalendarBlockController::class, 'index']);
        Route::post('/companions/me/calendar-blocks', [CompanionCalendarBlockController::class, 'store']);
        Route::delete('/companions/me/calendar-blocks/{block}', [CompanionCalendarBlockController::class, 'destroy']);
        
        Route::get('/companions/me/service-areas', [CompanionServiceAreaController::class, 'index']);
        Route::post('/companions/me/service-areas', [CompanionServiceAreaController::class, 'store']);
        Route::delete('/companions/me/service-areas/{area}', [CompanionServiceAreaController::class, 'destroy']);

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);

        // Booking lifecycle transitions
        Route::post('/bookings/{booking}/accept', [BookingController::class, 'accept']);
        Route::get('/bookings/{booking}/payment-status', [BookingController::class, 'paymentStatus']);
        Route::post('/bookings/{booking}/payway-checkout', [PaymentController::class, 'paywayCheckout']);
        Route::post('/bookings/{booking}/fund', [BookingController::class, 'fund']);
        Route::post('/bookings/{booking}/start', [BookingController::class, 'start']);
        Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);
        Route::post('/bookings/{booking}/release', [BookingController::class, 'release']);
        Route::post('/bookings/{booking}/reviews', [ReviewController::class, 'store']);
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
        Route::post('/bookings/{booking}/dispute', [BookingController::class, 'dispute']);
        Route::post('/bookings/{booking}/pings', [LocationPingController::class, 'store']);

        // Booking Extensions
        Route::post('/bookings/{booking}/extensions', [BookingExtensionController::class, 'store']);
        Route::post('/bookings/{booking}/extensions/{extension}/accept', [BookingExtensionController::class, 'accept']);
        Route::post('/bookings/{booking}/extensions/{extension}/reject', [BookingExtensionController::class, 'reject']);

        // Venues
        Route::get('/venues', [VenueController::class, 'index']);
        Route::get('/venues/{venue}', [VenueController::class, 'show']);

        // Chat
        Route::get('/bookings/{booking}/messages', [ChatController::class, 'index']);
        Route::post('/bookings/{booking}/messages', [ChatController::class, 'store']);

        // TOTP Offline Handshake
        Route::post('/bookings/{booking}/totp/generate', [MeetingVerificationController::class, 'generate']);
        Route::post('/bookings/{booking}/totp/verify', [MeetingVerificationController::class, 'verify']);
    });
});
