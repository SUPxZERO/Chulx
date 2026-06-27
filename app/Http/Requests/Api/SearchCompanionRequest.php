<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

final class SearchCompanionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'latitude'   => ['nullable', 'numeric', 'between:-90,90'],
            'longitude'  => ['nullable', 'numeric', 'between:-180,180'],
            'radius_km'  => ['nullable', 'numeric', 'min:1', 'max:100'],
            'language'   => ['nullable', 'string'],
            'specialty'  => ['nullable', 'string'],
            'min_rate'   => ['nullable', 'integer', 'min:0'],
            'max_rate'   => ['nullable', 'integer', 'min:0'],
            'sort_by'    => ['nullable', 'in:distance,rating,price'],
            'per_page'   => ['nullable', 'integer', 'min:1', 'max:50'],
        ];
    }
}
