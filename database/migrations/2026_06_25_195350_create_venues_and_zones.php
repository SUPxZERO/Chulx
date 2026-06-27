<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->geometry('location', subtype: 'point')->nullable();
            $table->enum('category', ['RESTAURANT', 'EVENT_HALL', 'CONFERENCE', 'TEMPLE', 'MARKET', 'OTHER']);
            $table->boolean('is_approved')->default(true);
            $table->integer('capacity')->nullable();
            $table->timestamps();
        });

        Schema::create('restricted_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('zone_type', ['HOTEL', 'RESIDENTIAL', 'NIGHTCLUB', 'RED_LIGHT']);
            $table->geometry('boundary', subtype: 'polygon')->nullable();
            $table->boolean('is_active')->default(true);
            $table->text('reason')->nullable();
            $table->timestamps();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('restricted_zones');
        Schema::dropIfExists('venues');

    }
};
