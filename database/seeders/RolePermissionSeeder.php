<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create core permissions
        Permission::create(['name' => 'manage users']);
        Permission::create(['name' => 'manage bookings']);
        Permission::create(['name' => 'manage venues']);
        Permission::create(['name' => 'manage finances']);
        Permission::create(['name' => 'view reports']);

        // Create roles and assign permissions
        $clientRole = Role::create(['name' => 'CLIENT']);
        // Clients get basic booking permissions implicitly via policies
        
        $companionRole = Role::create(['name' => 'COMPANION']);
        // Companions get profile management permissions implicitly via policies

        $adminRole = Role::create(['name' => 'ADMIN']);
        $adminRole->givePermissionTo(Permission::all());
    }
}
