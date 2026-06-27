<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreServiceAreaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'max:255'],
            // Validate that we receive a valid JSON string containing the GeoJSON polygon coordinates
            // E.g. {"type": "Polygon", "coordinates": [[[lng, lat], [lng, lat], ...]]}
            'boundary' => ['required', 'json'], 
        ];
    }
}
