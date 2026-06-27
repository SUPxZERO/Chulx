<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add CHECK constraint to wallets to prevent negative balances
        DB::statement('ALTER TABLE wallets ADD CONSTRAINT wallets_balance_cents_check CHECK (balance_cents >= 0);');

        // 2. Add cancellation fields to bookings
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('cancellation_reason')->nullable();
            $table->foreignId('cancelled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->integer('cancellation_penalty_cents')->nullable();
        });

        // 3. Create payout_requests table
        Schema::create('payout_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('amount_cents');
            $table->enum('status', ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'])->default('PENDING');
            $table->jsonb('bank_details_json');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_requests');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['cancelled_by']);
            $table->dropColumn(['cancellation_reason', 'cancelled_by', 'cancellation_penalty_cents']);
        });

        DB::statement('ALTER TABLE wallets DROP CONSTRAINT wallets_balance_cents_check;');
    }
};
