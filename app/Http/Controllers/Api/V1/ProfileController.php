<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadKycRequest;
use App\Models\KycVerification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

final class ProfileController extends Controller
{
    /**
     * Upload KYC Documents to S3 and create a Verification record.
     */
    public function uploadKyc(UploadKycRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // Prevent multiple pending requests
        if ($user->kycVerifications()->where('status', 'PENDING')->exists()) {
            return response()->json([
                'message' => 'You already have a pending KYC verification request.'
            ], 409);
        }

        $disk = config('filesystems.default');
        
        // Helper to store files
        $storeFile = function($file, $prefix) use ($user, $disk) {
            if (!$file) return null;
            
            $filename = sprintf(
                'kyc/%s/%s_%s_%s.%s',
                $user->uuid,
                $prefix,
                now()->timestamp,
                Str::random(6),
                $file->getClientOriginalExtension()
            );
            
            $path = $file->storeAs('', $filename, $disk);
            return $path ? Storage::disk($disk)->url($path) : null;
        };

        $frontUrl = $storeFile($request->file('front_image'), 'front');
        $backUrl = $storeFile($request->file('back_image'), 'back');
        $selfieUrl = $storeFile($request->file('selfie_image'), 'selfie');

        if (!$frontUrl || !$selfieUrl) {
            return response()->json(['message' => 'Failed to upload one or more documents.'], 500);
        }

        $verification = $user->kycVerifications()->create([
            'document_type'   => $request->validated('document_type'),
            'front_image_url' => $frontUrl,
            'back_image_url'  => $backUrl,
            'selfie_url'      => $selfieUrl,
            'status'          => 'PENDING',
        ]);

        return response()->json([
            'message' => 'KYC documents uploaded successfully and are pending review.',
            'data'    => $verification,
        ], 201);
    }
}
