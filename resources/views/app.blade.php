<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>Chulx — Cultural Ambassador Marketplace</title>
    <meta name="description" content="Chulx is Cambodia's premier Cultural Ambassador marketplace. Find verified local companions for weddings, business events, tourism, and cultural experiences.">

    <!-- Preload Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
</head>
<body class="antialiased bg-[#0F0F23] text-[#E8E8E8] font-['Inter',sans-serif]">
    <div id="app"></div>
</body>
</html>
