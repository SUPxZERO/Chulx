<?php

namespace Database\Factories;

use App\Models\Venue;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Venue>
 */
class VenueFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $lat = $this->faker->latitude(-90, 90);
        $lng = $this->faker->longitude(-180, 180);

        return [
            'name'        => $this->faker->company() . ' Hotel',
            'address'     => $this->faker->address(),
            'category'    => $this->faker->randomElement(['restaurant', 'event_hall', 'conference', 'other']),
            'is_approved' => true,
            'capacity'    => $this->faker->numberBetween(2, 10),
            'location'    => \Illuminate\Support\Facades\DB::raw("ST_SetSRID(ST_MakePoint({$lng}, {$lat}), 4326)"),
        ];
    }
}
