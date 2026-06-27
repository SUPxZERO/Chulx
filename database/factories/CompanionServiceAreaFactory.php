<?php

namespace Database\Factories;

use App\Models\CompanionServiceArea;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CompanionServiceArea>
 */
class CompanionServiceAreaFactory extends Factory
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
        
        // Create a simple square polygon around the point
        $offset = 0.1; // ~11km
        $geojson = json_encode([
            'type' => 'Polygon',
            'coordinates' => [[
                [$lng - $offset, $lat - $offset],
                [$lng + $offset, $lat - $offset],
                [$lng + $offset, $lat + $offset],
                [$lng - $offset, $lat + $offset],
                [$lng - $offset, $lat - $offset] // Close the ring
            ]]
        ]);

        return [
            'name' => $this->faker->city() . ' Area',
            'boundary' => \Illuminate\Support\Facades\DB::raw("ST_GeomFromGeoJSON('{$geojson}')")
        ];
    }
}
