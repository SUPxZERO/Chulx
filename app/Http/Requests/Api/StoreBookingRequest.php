<?php

declare(strict_types=1);

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

final class StoreBookingRequest extends FormRequest
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
            'companion_id'    => ['required', 'exists:users,id'],
            'venue_id'        => ['required', 'exists:venues,id'],
            'scheduled_start' => ['required', 'date', 'after:now'],
            'scheduled_end'   => ['required', 'date', 'after:scheduled_start'],
            'purpose'         => ['required', 'in:WEDDING,BUSINESS,TOURISM,CORPORATE,OTHER'],
            'special_requests' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $start = $this->date('scheduled_start');
            $end = $this->date('scheduled_end');

            if ($start && $end && $start->diffInMinutes($end) < 60) {
                $validator->errors()->add('scheduled_end', 'The booking must be for at least 1 hour.');
            }
            
            if ($start && $start->diffInMinutes(now()) > -30) {
                 $validator->errors()->add('scheduled_start', 'The booking must be scheduled at least 30 minutes in advance.');
            }
        });
    }
}
