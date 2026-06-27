<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\LoginRequest;
use App\Http\Requests\Api\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

final class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'phone'    => $validated['phone'],
            'password' => $validated['password'],
            'role'     => $validated['role'],
        ]);

        // Assign Spatie role (lowercase for convention)
        $user->assignRole(strtolower($validated['role']));

        // Create wallet
        Wallet::create([
            'user_id'       => $user->id,
            'balance_cents' => 0,
            'currency'      => config('chulx.currencies.primary', 'USD'),
        ]);

        if (strtoupper($validated['role']) === 'COMPANION') {
            \App\Models\CompanionProfile::create([
                'user_id'           => $user->id,
                'bio'               => '',
                'hourly_rate_cents' => 0,
                'languages'         => [],
                'specialties'       => [],
                'availability_status' => \App\Enums\AvailabilityStatus::OFFLINE,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Login the user to the web guard (to grant access to Filament)
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Authenticate and issue a token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Login the user to the web guard (to grant access to Filament)
        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'user'  => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * Return the authenticated user.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['wallet', 'companionProfile']);
        return response()->json([
            'data' => new UserResource($user),
        ]);
    }
}
