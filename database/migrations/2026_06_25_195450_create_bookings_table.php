<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('companion_id')->constrained('users');
            $table->foreignId('venue_id')->constrained('venues');
            $table->enum('status', ['PENDING', 'ACCEPTED', 'FUNDED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'PAID'])->default('PENDING');
            $table->timestamp('scheduled_start');
            $table->timestamp('scheduled_end');
            $table->integer('base_amount_cents');
            $table->integer('safety_fee_cents');
            $table->integer('platform_fee_cents');
            $table->integer('companion_payout_cents');
            $table->enum('purpose', ['WEDDING', 'BUSINESS', 'TOURISM', 'CORPORATE', 'OTHER']);
            $table->text('special_requests')->nullable();
            $table->timestamps();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('bookings');

    }
};
