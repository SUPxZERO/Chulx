<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\CompanionProfile;
use App\Models\CompanionSchedule;
use App\Models\CompanionServiceArea;
use App\Models\Venue;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RolePermissionSeeder::class);

        // 1. Create Admin
        $admin = User::factory()->create([
            'name' => 'Admin Chulx',
            'email' => 'admin@chulx.com',
            'phone' => '+1234567890',
            'role' => 'ADMIN',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole('ADMIN');
        $admin->wallet()->create(['balance_cents' => 0, 'currency' => 'USD']);

        // 2. Create Venues
        Venue::factory(15)->create();

        // 3. Create 10 Clients
        $clients = User::factory(10)->create([
            'role' => 'CLIENT',
            'password' => Hash::make('password'),
        ]);
        foreach ($clients as $client) {
            $client->assignRole('CLIENT');
            $client->wallet()->create(['balance_cents' => 500000, 'currency' => 'USD']); // $5,000.00
        }

        // Ensure we have one predictable client for login testing
        $testClient = User::factory()->create([
            'name' => 'Test Client',
            'email' => 'client@chulx.com',
            'role' => 'CLIENT',
            'password' => Hash::make('password'),
        ]);
        $testClient->assignRole('CLIENT');
        $testClient->wallet()->create(['balance_cents' => 1000000, 'currency' => 'USD']); // $10,000.00

        // 4. Create 20 Companions
        $companions = User::factory(20)->create([
            'role' => 'COMPANION',
            'password' => Hash::make('password'),
        ]);

        foreach ($companions as $companion) {
            $companion->assignRole('COMPANION');
            $companion->wallet()->create(['balance_cents' => 0, 'currency' => 'USD']);
            
            // Create Profile
            CompanionProfile::factory()->create([
                'user_id' => $companion->id,
                'verified_at' => now(),
            ]);

            // Create Schedule (Mon-Fri)
            for ($i = 1; $i <= 5; $i++) {
                CompanionSchedule::factory()->create([
                    'companion_id' => $companion->id,
                    'day_of_week' => $i,
                ]);
            }

            // Create Service Area
            CompanionServiceArea::factory()->create([
                'companion_id' => $companion->id,
            ]);
        }

        // Ensure we have one predictable companion for login testing
        $testCompanion = User::factory()->create([
            'name' => 'Test Companion',
            'email' => 'companion@chulx.com',
            'role' => 'COMPANION',
            'password' => Hash::make('password'),
        ]);
        $testCompanion->assignRole('COMPANION');
        $testCompanion->wallet()->create(['balance_cents' => 15000, 'currency' => 'USD']); // $150.00
        
        CompanionProfile::factory()->create([
            'user_id' => $testCompanion->id,
            'verified_at' => now(),
            'hourly_rate_cents' => 10000, // $100
        ]);
        
        CompanionServiceArea::factory()->create([
            'companion_id' => $testCompanion->id,
        ]);

        for ($i = 1; $i <= 7; $i++) {
            CompanionSchedule::factory()->create([
                'companion_id' => $testCompanion->id,
                'day_of_week' => $i,
            ]);
        }
    }
}
