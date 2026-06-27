<?php

namespace Database\Factories;

use App\Models\CompanionSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompanionSchedule>
 */
class CompanionScheduleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'day_of_week' => $this->faker->numberBetween(1, 7),
            'start_time' => '09:00:00',
            'end_time' => '17:00:00',
        ];
    }
}
