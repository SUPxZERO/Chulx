<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class CompanionScheduleControllerTest extends TestCase
{
    use DatabaseTransactions;

    public function test_can_update_weekly_schedule()
    {
        $companion = User::factory()->create();

        $payload = [
            'schedules' => [
                [
                    'day_of_week' => 1, // Monday
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                ],
                [
                    'day_of_week' => 2, // Tuesday
                    'start_time' => '10:00',
                    'end_time' => '15:00',
                ]
            ]
        ];

        $response = $this->actingAs($companion, 'sanctum')->putJson('/api/v1/companions/me/schedule', $payload);

        $response->assertStatus(200)
                 ->assertJsonPath('message', 'Weekly schedule updated successfully.')
                 ->assertJsonCount(2, 'data');

        $this->assertDatabaseHas('companion_schedules', [
            'companion_id' => $companion->id,
            'day_of_week' => 1,
            'start_time' => '09:00',
            'end_time' => '17:00',
        ]);
    }

    public function test_bulk_replace_deletes_old_schedules()
    {
        $companion = User::factory()->create();
        
        // Old schedule
        $companion->companionSchedules()->create([
            'day_of_week' => 5, // Friday
            'start_time' => '18:00',
            'end_time' => '22:00',
        ]);

        $payload = [
            'schedules' => [
                [
                    'day_of_week' => 1,
                    'start_time' => '09:00',
                    'end_time' => '17:00',
                ]
            ]
        ];

        $this->actingAs($companion, 'sanctum')->putJson('/api/v1/companions/me/schedule', $payload);

        // Old schedule should be gone
        $this->assertDatabaseMissing('companion_schedules', [
            'companion_id' => $companion->id,
            'day_of_week' => 5,
        ]);

        // New schedule should exist
        $this->assertDatabaseHas('companion_schedules', [
            'companion_id' => $companion->id,
            'day_of_week' => 1,
        ]);
    }
}
