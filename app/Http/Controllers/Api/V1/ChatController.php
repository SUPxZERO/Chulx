<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\ChatMessage;
use App\Services\LexiconFilterService;
use App\Events\MessageSent;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChatController extends Controller
{
    /**
     * Retrieve chat messages for a booking.
     */
    public function index(Booking $booking)
    {
        // Add authorization later to ensure only client/companion can view
        $messages = ChatMessage::where('booking_id', $booking->id)
            ->with('sender:id,name,avatar_url')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        return response()->json($messages);
    }

    /**
     * Store a new chat message and broadcast it.
     */
    public function store(Request $request, Booking $booking, LexiconFilterService $lexicon)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:1000',
        ]);

        $content = $validated['content'];
        $isRedacted = false;

        // Scan the message via Lexicon Filter
        $scanResult = $lexicon->scan($content);
        
        if ($scanResult['is_flagged']) {
            $isRedacted = true;
            $content = $scanResult['clean_message'];
            
            // Increment strike on the user
            $request->user()->incrementStrike($scanResult['flagged_words'], 'chat');
            
            // Note: If this was the 3rd strike, the user's JWT is now invalidated, 
            // but we still save the redacted message to the DB for the audit trail.
            
            // Cancel booking if user was suspended
            if (!$request->user()->fresh()->is_active) {
                app(\App\Services\BookingService::class)->cancel($booking, 'Terminated automatically due to strict platform Lexicon violations.');
            }
        }

        $message = ChatMessage::create([
            'booking_id' => $booking->id,
            'sender_id' => $request->user()->id,
            'content' => $content,
            'is_redacted' => $isRedacted,
        ]);

        $message->load('sender:id,name,avatar_url');

        // Broadcast the message
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }
}
