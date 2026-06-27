<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Companion Service Areas
        Schema::create('companion_service_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('companion_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->geometry('boundary', subtype: 'polygon');
            $table->timestamps();
        });

        // 2. Companion Schedules (Weekly Availability)
        Schema::create('companion_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('companion_id')->constrained('users')->cascadeOnDelete();
            $table->tinyInteger('day_of_week'); // 0 (Sunday) to 6 (Saturday)
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();

            $table->unique(['companion_id', 'day_of_week', 'start_time'], 'comp_schedule_unique');
        });

        // 3. Companion Calendar Blocks (Specific Overrides)
        Schema::create('companion_calendar_blocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('companion_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->string('reason')->nullable();
            $table->timestamps();
        });

        // 4. Booking Extensions
        Schema::create('booking_extensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->integer('requested_duration_minutes');
            $table->integer('additional_cents');
            $table->enum('status', ['PENDING', 'ACCEPTED', 'REJECTED'])->default('PENDING');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_extensions');
        Schema::dropIfExists('companion_calendar_blocks');
        Schema::dropIfExists('companion_schedules');
        Schema::dropIfExists('companion_service_areas');
    }
};
