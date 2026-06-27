<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        
        Schema::create('lexicon_entries', function (Blueprint $table) {
            $table->id();
            $table->string('word')->unique();
            $table->string('language'); // EN, KM, etc.
            $table->enum('severity', ['BLOCK', 'WARN', 'REDACT'])->default('REDACT');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('lexicon_entries');

    }
};
