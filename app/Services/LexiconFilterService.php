<?php

namespace App\Services;

use Illuminate\Support\Facades\Redis;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class LexiconFilterService
{
    private const REDIS_KEY = 'lexicon:banned_pattern';

    /**
     * Boot the dictionary into Redis if not present
     */
    public function bootDictionary(): void
    {
        if (!Redis::exists(self::REDIS_KEY)) {
            // Hardcoded initial list as per PDF (EN + KH + Pinglish)
            $banned = [
                'date', 'rent a girlfriend', 'rent a boyfriend', 'intimacy', 'private', 
                'hang out', 'hotel room', 'apartment', 'my place', 'flirt', 'party', 'drink together',
                // Khmer / Pinglish approximations
                'tver sa', 'leng', 'nham sra' 
            ];
            
            // Create a regex pattern: /\b(date|rent a girlfriend|...)\b/i
            $pattern = '/\b(' . implode('|', array_map('preg_quote', $banned)) . ')\b/i';
            Redis::set(self::REDIS_KEY, $pattern);
        }
    }

    /**
     * Scan message against Lexicon. 
     * Returns an array: ['is_flagged' => bool, 'clean_message' => string, 'flagged_words' => array]
     */
    public function scan(string $message): array
    {
        $this->bootDictionary();
        $pattern = Redis::get(self::REDIS_KEY);

        if (preg_match_all($pattern, $message, $matches)) {
            return [
                'is_flagged' => true,
                'clean_message' => '[REDACTED: Violated platform guidelines]',
                'flagged_words' => array_unique($matches[0])
            ];
        }

        return [
            'is_flagged' => false,
            'clean_message' => $message,
            'flagged_words' => []
        ];
    }
}
