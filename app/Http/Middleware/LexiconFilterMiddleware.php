<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Cache;

class LexiconFilterMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $bannedWords = Cache::remember('lexicon_banned_words', 3600, function () {
            // Fallback default list if DB/Redis empty
            return ['date', 'intimacy', 'private', 'hang out', 'hotel room', 'apartment', 'my place', 'flirt', 'party'];
        });

        $input = $request->all();
        $fieldsToCheck = ['bio', 'description', 'message', 'special_requests'];

        foreach ($fieldsToCheck as $field) {
            if (isset($input[$field]) && is_string($input[$field])) {
                foreach ($bannedWords as $word) {
                    if (preg_match('/\b' . preg_quote($word, '/') . '\b/i', $input[$field])) {
                        // Apply strike to user
                        if ($request->user()) {
                            $user = $request->user();
                            $strikes = $user->strike_history ?? [];
                            $strikes[] = [
                                'word' => $word,
                                'context' => substr($input[$field], 0, 50),
                                'timestamp' => now()->toIso8601String(),
                            ];
                            $user->strike_history = $strikes;
                            $user->save();
                            
                            if (count($strikes) >= 3) {
                                // Invalidate JWT / Logout
                                $user->tokens()->delete();
                                abort(403, 'Account suspended due to repeated Terms of Service violations.');
                            }
                        }

                        return response()->json([
                            'message' => 'Payload contains prohibited terminology (Anti-Vice Policy).',
                            'flagged_word' => $word
                        ], 422);
                    }
                }
            }
        }

        return $next($request);
    }
}
