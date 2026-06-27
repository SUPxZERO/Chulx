<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\CompanionController;
use App\Http\Controllers\Api\V1\MeetingVerificationController;
use App\Http\Controllers\Api\V1\VenueController;
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

        // Companions
        Route::get('/companions', [CompanionController::class, 'index']);
        Route::get('/companions/{id}', [CompanionController::class, 'show']);

        // Bookings
        Route::get('/bookings', [BookingController::class, 'index']);
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::get('/bookings/{booking}', [BookingController::class, 'show']);

        // Booking lifecycle transitions
        Route::post('/bookings/{booking}/accept', [BookingController::class, 'accept']);
        Route::get('/bookings/{booking}/payment-status', [BookingController::class, 'paymentStatus']);
        Route::post('/bookings/{booking}/fund', [BookingController::class, 'fund']);
        Route::post('/bookings/{booking}/start', [BookingController::class, 'start']);
        Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);
        Route::post('/bookings/{booking}/release', [BookingController::class, 'release']);
        Route::post('/bookings/{booking}/cancel', [BookingController::class, 'cancel']);
        Route::post('/bookings/{booking}/dispute', [BookingController::class, 'dispute']);

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
