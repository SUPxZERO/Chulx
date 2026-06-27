<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Location Pings for active bookings (Real-time safety)
        Schema::create('location_pings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->geometry('location', subtype: 'point');
            $table->decimal('speed', 8, 2)->nullable(); // m/s or km/h based on app choice
            $table->decimal('heading', 5, 2)->nullable(); // degrees 0-360
            
            // Only created_at, intentionally omitting updated_at for an append-only log
            $table->timestamp('created_at')->useCurrent();
            
            // Note: In production, consider adding a Laravel Command via Task Scheduling 
            // e.g., $schedule->command('pings:cleanup')->daily();
            // to delete pings older than X days to prevent unbounded table growth.
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('location_pings');
    }
};
