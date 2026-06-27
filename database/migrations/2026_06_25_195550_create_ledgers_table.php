<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->bigInteger('balance_cents')->default(0);
            $table->bigInteger('hold_amount_cents')->default(0);
            $table->string('currency')->default('KHR');
            $table->timestamps();
        });

        Schema::create('ledger_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('wallet_id')->constrained();
            $table->foreignId('booking_id')->constrained();
            $table->enum('type', ['ESCROW_DEPOSIT', 'ESCROW_RELEASE', 'FEE_CAPTURE', 'REFUND', 'CHARGEBACK_HOLD', 'PAYOUT', 'SAFETY_FEE']);
            $table->bigInteger('amount_cents');
            $table->bigInteger('running_balance_cents');
            $table->string('reference_id')->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

    }

    public function down()
    {
        
        Schema::dropIfExists('ledger_transactions');
        Schema::dropIfExists('wallets');

    }
};
