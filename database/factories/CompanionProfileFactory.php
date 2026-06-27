<?php

namespace Database\Factories;

use App\Models\CompanionProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompanionProfile>
 */
class CompanionProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'bio' => $this->faker->paragraph(),
            'hourly_rate_cents' => $this->faker->numberBetween(5000, 50000), // $50.00 to $500.00
            'languages' => json_encode($this->faker->randomElements(['en', 'fr', 'es', 'zh', 'km'], $this->faker->numberBetween(1, 3))),
            'specialties' => json_encode($this->faker->randomElements(['Tour Guide', 'Event Companion', 'Dinner Date', 'Translator'], $this->faker->numberBetween(1, 3))),
            'availability_status' => $this->faker->randomElement(['AVAILABLE', 'BUSY', 'OFFLINE']),
        ];
    }
}
