<?php

// =============================================================================
// Chulx — Application Configuration
// =============================================================================
// Central configuration for business rules, feature flags, and service keys.
// All values are driven by environment variables with sensible defaults.
// =============================================================================

return [

    /*
    |--------------------------------------------------------------------------
    | Commission & Fees
    |--------------------------------------------------------------------------
    |
    | Financial parameters governing platform transactions.
    | COMMISSION_RATE: Platform take as a decimal (0.15 = 15%)
    | SAFETY_FEE: Flat fee in USD added to each ride for insurance/safety fund
    |
    */

    'commission_rate' => (float) env('CHULX_COMMISSION_RATE', 0.15),
    'safety_fee'      => (float) env('CHULX_SAFETY_FEE', 0.50),

    /*
    |--------------------------------------------------------------------------
    | Ride Timing
    |--------------------------------------------------------------------------
    |
    | BUFFER_MINUTES: Grace period (in minutes) before a ride is marked late.
    | Used in ETA calculations and driver punctuality scoring.
    |
    */

    'buffer_minutes' => (int) env('CHULX_BUFFER_MINUTES', 10),

    /*
    |--------------------------------------------------------------------------
    | Lexicon Filter (Profanity / Content Moderation)
    |--------------------------------------------------------------------------
    |
    | When enabled, user-generated content (chat messages, reviews, driver
    | notes) is scanned against a blocklist. Supports Khmer + English.
    |
    */

    'lexicon_filter' => [
        'enabled'    => (bool) env('CHULX_LEXICON_FILTER_ENABLED', true),
        'strictness' => env('CHULX_LEXICON_STRICTNESS', 'medium'), // low|medium|high
        'locales'    => ['km', 'en'],
    ],

    /*
    |--------------------------------------------------------------------------
    | ABA PayWay — Payment Gateway
    |--------------------------------------------------------------------------
    */

    'payway' => [
        'merchant_id' => env('ABA_PAYWAY_MERCHANT_ID'),
        'api_key'     => env('ABA_PAYWAY_API_KEY'),
        'api_url'     => env('ABA_PAYWAY_API_URL', 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1'),
        'return_url'  => env('ABA_PAYWAY_RETURN_URL'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Google Maps
    |--------------------------------------------------------------------------
    */

    'google_maps' => [
        'api_key' => env('GOOGLE_MAPS_API_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Supported Currencies
    |--------------------------------------------------------------------------
    | ISO 4217 codes. Primary is used for display; all are accepted via PayWay.
    |
    */

    'currencies' => [
        'primary'   => 'USD',
        'supported' => ['USD', 'KHR'],
        'khr_rate'  => (float) env('CHULX_KHR_EXCHANGE_RATE', 4100), // 1 USD = X KHR
    ],

    /*
    |--------------------------------------------------------------------------
    | Localization
    |--------------------------------------------------------------------------
    */

    'locales' => [
        'km' => 'ភាសាខ្មែរ',
        'en' => 'English',
    ],

];
