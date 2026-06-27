<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        
        Schema::create('meeting_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('totp_secret');
            $table->timestamp('scanned_at')->nullable();
            $table->boolean('verified_offline')->default(false);
            $table->decimal('client_lat', 10, 8)->nullable();
            $table->decimal('client_lng', 11, 8)->nullable();
            $table->timestamps();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('meeting_verifications');

    }
};
