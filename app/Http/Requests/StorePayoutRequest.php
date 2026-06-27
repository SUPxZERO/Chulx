<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePayoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount_cents'               => ['required', 'integer', 'gt:0'],
            'bank_details'               => ['required', 'array'],
            'bank_details.bank_name'     => ['required', 'string', 'max:255'],
            'bank_details.account_name'  => ['required', 'string', 'max:255'],
            'bank_details.account_number'=> ['required', 'string', 'max:255'],
        ];
    }
}
