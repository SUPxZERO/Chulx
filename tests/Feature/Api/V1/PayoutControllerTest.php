<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class PayoutControllerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_can_list_payout_requests()
    {
        $user = User::factory()->create();
        $user->wallet()->create(['balance_cents' => 10000, 'hold_amount_cents' => 0]);

        $user->payoutRequests()->create([
            'amount_cents' => 5000,
            'status' => 'PENDING',
            'bank_details_json' => ['bank_name' => 'Bank', 'account_name' => 'Name', 'account_number' => '123'],
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/payouts');

        $response->assertStatus(200)
                 ->assertJsonCount(1, 'data')
                 ->assertJsonPath('data.0.amount_cents', 5000);
    }

    public function test_can_request_payout_with_sufficient_balance()
    {
        $user = User::factory()->create();
        $user->wallet()->create(['balance_cents' => 10000, 'hold_amount_cents' => 0]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/payouts', [
            'amount_cents' => 5000,
            'bank_details' => [
                'bank_name' => 'Test Bank',
                'account_name' => 'Test Name',
                'account_number' => '123456789',
            ],
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'Payout requested successfully. Funds are on hold.');

        $this->assertDatabaseHas('payout_requests', [
            'user_id' => $user->id,
            'amount_cents' => 5000,
            'status' => 'PENDING',
        ]);

        $this->assertDatabaseHas('wallets', [
            'user_id' => $user->id,
            'balance_cents' => 10000,
            'hold_amount_cents' => 5000,
        ]);
    }

    public function test_cannot_request_payout_with_insufficient_available_balance()
    {
        $user = User::factory()->create();
        // Total balance is 10000, but 8000 is on hold. Available = 2000.
        $user->wallet()->create(['balance_cents' => 10000, 'hold_amount_cents' => 8000]);

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/payouts', [
            'amount_cents' => 5000,
            'bank_details' => [
                'bank_name' => 'Test Bank',
                'account_name' => 'Test Name',
                'account_number' => '123456789',
            ],
        ]);

        $response->assertStatus(400)
                 ->assertJsonPath('message', 'Insufficient available funds for this payout.');

        $this->assertDatabaseCount('payout_requests', 0);
    }
}
