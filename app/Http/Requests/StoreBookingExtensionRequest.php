<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingExtensionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requested_duration_minutes' => ['required', 'integer', 'min:15'],
            'additional_cents'           => ['required', 'integer', 'gt:0'],
        ];
    }
}
