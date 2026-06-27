<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Booking;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('booking.{bookingId}', function ($user, $bookingId) {
    $booking = Booking::find($bookingId);
    if (!$booking) {
        return false;
    }

    // Only allow the client or the companion assigned to the booking to listen
    return (int) $user->id === (int) $booking->client_id || (int) $user->id === (int) $booking->companion_id;
});
