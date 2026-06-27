<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS postgis;');
        
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->unique();
            $table->enum('role', ['CLIENT', 'COMPANION', 'ADMIN']);
            $table->string('locale')->default('en');
            $table->string('avatar_url')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->jsonb('strike_history')->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('companion_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('bio');
            $table->integer('hourly_rate_cents');
            $table->jsonb('languages'); // e.g. ["en", "km", "zh"]
            $table->jsonb('specialties'); 
            $table->enum('availability_status', ['AVAILABLE', 'BUSY', 'OFFLINE'])->default('OFFLINE');
            $table->decimal('rating_avg', 3, 2)->default(0.00);
            $table->integer('total_bookings')->default(0);
            $table->geometry('last_location', subtype: 'point')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('companion_profiles');
        Schema::dropIfExists('users');

    }
};
