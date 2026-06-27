<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadKycRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Handled by auth:sanctum middleware
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', 'string', 'in:PASSPORT,NATIONAL_ID,DRIVERS_LICENSE'],
            'front_image'   => ['required', 'file', 'mimes:jpeg,png,pdf', 'max:10240'], // 10MB max
            'back_image'    => ['nullable', 'file', 'mimes:jpeg,png,pdf', 'max:10240'],
            'selfie_image'  => ['required', 'file', 'mimes:jpeg,png', 'max:10240'], 
        ];
    }
}
