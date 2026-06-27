<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Catch-all route serves the React SPA shell. All client-side routing
| is handled by React Router. API routes are in routes/api.php.
|
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
