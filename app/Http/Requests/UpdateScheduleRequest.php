<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'schedules'               => ['required', 'array'],
            'schedules.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'schedules.*.start_time'  => ['required', 'date_format:H:i', 'before:schedules.*.end_time'],
            'schedules.*.end_time'    => ['required', 'date_format:H:i', 'after:schedules.*.start_time'],
        ];
    }
}
