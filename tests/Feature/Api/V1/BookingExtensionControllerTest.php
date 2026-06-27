<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use App\Models\Venue;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class BookingExtensionControllerTest extends TestCase
{
    use DatabaseTransactions;

    private User $client;
    private User $companion;
    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $this->client = User::factory()->create();
        $this->client->wallet()->create(['balance_cents' => 20000, 'hold_amount_cents' => 5000]);

        $this->companion = User::factory()->create();
        $this->companion->wallet()->create(['balance_cents' => 0, 'hold_amount_cents' => 0]);

        $venue = Venue::factory()->create();

        $this->booking = Booking::factory()->create([
            'client_id' => $this->client->id,
            'companion_id' => $this->companion->id,
            'venue_id' => $venue->id,
            'status' => BookingStatus::IN_PROGRESS,
            'base_amount_cents' => 5000,
            'companion_payout_cents' => 4000,
        ]);
    }

    public function test_client_can_request_extension()
    {
        $response = $this->actingAs($this->client, 'sanctum')->postJson("/api/v1/bookings/{$this->booking->id}/extensions", [
            'requested_duration_minutes' => 30,
            'additional_cents' => 2000,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.status', 'PENDING');

        // Client wallet hold should increase by 2000
        $this->assertDatabaseHas('wallets', [
            'user_id' => $this->client->id,
            'hold_amount_cents' => 7000,
        ]);
    }

    public function test_companion_can_accept_extension()
    {
        $extension = $this->booking->bookingExtensions()->create([
            'requested_duration_minutes' => 30,
            'additional_cents' => 2000,
            'status' => 'PENDING',
        ]);

        $response = $this->actingAs($this->companion, 'sanctum')
                         ->postJson("/api/v1/bookings/{$this->booking->id}/extensions/{$extension->id}/accept");

        $response->assertStatus(200)
                 ->assertJsonPath('data.status', 'ACCEPTED');

        // Booking base amount and payout should increase
        $this->assertDatabaseHas('bookings', [
            'id' => $this->booking->id,
            'base_amount_cents' => 7000,
            'companion_payout_cents' => 6000,
        ]);
    }

    public function test_companion_can_reject_extension()
    {
        $extension = $this->booking->bookingExtensions()->create([
            'requested_duration_minutes' => 30,
            'additional_cents' => 2000,
            'status' => 'PENDING',
        ]);

        // Mock the fact that client's money was put on hold when requested
        $this->client->wallet()->update(['hold_amount_cents' => 7000]);

        $response = $this->actingAs($this->companion, 'sanctum')
                         ->postJson("/api/v1/bookings/{$this->booking->id}/extensions/{$extension->id}/reject");

        $response->assertStatus(200)
                 ->assertJsonPath('data.status', 'REJECTED');

        // Client wallet hold should decrease by 2000
        $this->assertDatabaseHas('wallets', [
            'user_id' => $this->client->id,
            'hold_amount_cents' => 5000,
        ]);
    }
}
