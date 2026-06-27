<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        
        Schema::create('panic_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('triggered_by')->constrained('users')->cascadeOnDelete();
            $table->string('location')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->boolean('escrow_frozen')->default(true);
            $table->timestamps();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('panic_events');

    }
};
