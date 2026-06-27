import os
from datetime import datetime, timedelta

base_dir = r'e:\promgramming\Chulx'
mig_dir = os.path.join(base_dir, 'database', 'migrations')
model_dir = os.path.join(base_dir, 'app', 'Models')

os.makedirs(mig_dir, exist_ok=True)
os.makedirs(model_dir, exist_ok=True)

models = ['CompanionProfile', 'Venue', 'RestrictedZone', 'Booking', 'Wallet', 'LedgerTransaction']
for m in models:
    code = f"""<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class {m} extends Model
{{
    use HasFactory;
    protected $guarded = [];
}}
"""
    with open(os.path.join(model_dir, f'{m}.php'), 'w') as f:
        f.write(code)

print('Models created.')

# Delete existing users migration
for f in os.listdir(mig_dir):
    if 'create_users_table' in f:
        os.remove(os.path.join(mig_dir, f))

# We will create the migrations now using timestamps
def make_mig(name, class_name, up_content, down_content, offset_minutes=0):
    dt = datetime.now() + timedelta(minutes=offset_minutes)
    prefix = dt.strftime('%Y_%m_%d_%H%M%S')
    filename = f"{prefix}_{name}.php"
    code = f"""<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

return new class extends Migration
{{
    public function up()
    {{
        {up_content}
    }}

    public function down()
    {{
        {down_content}
    }}
}};
"""
    with open(os.path.join(mig_dir, filename), 'w') as f:
        f.write(code)

# 1. Users & Companion Profiles
make_mig('create_users_table', 'CreateUsersTable', """
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
            $table->geography('last_location', subtype: 'POINT', srid: 4326)->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('companion_profiles');
        Schema::dropIfExists('users');
""", 1)

# 2. Venues & Restricted Zones
make_mig('create_venues_and_zones', 'CreateVenuesAndZones', """
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address');
            $table->geography('location', subtype: 'POINT', srid: 4326);
            $table->enum('category', ['RESTAURANT', 'EVENT_HALL', 'CONFERENCE', 'TEMPLE', 'MARKET', 'OTHER']);
            $table->boolean('is_approved')->default(true);
            $table->integer('capacity')->nullable();
            $table->timestamps();
        });

        Schema::create('restricted_zones', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('zone_type', ['HOTEL', 'RESIDENTIAL', 'NIGHTCLUB', 'RED_LIGHT']);
            $table->geography('boundary', subtype: 'POLYGON', srid: 4326);
            $table->boolean('is_active')->default(true);
            $table->text('reason')->nullable();
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('restricted_zones');
        Schema::dropIfExists('venues');
""", 2)

# 3. Bookings
make_mig('create_bookings_table', 'CreateBookingsTable', """
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('companion_id')->constrained('users');
            $table->foreignId('venue_id')->constrained('venues');
            $table->enum('status', ['PENDING', 'ACCEPTED', 'FUNDED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'PAID'])->default('PENDING');
            $table->timestampTz('scheduled_start');
            $table->timestampTz('scheduled_end');
            $table->integer('base_amount_cents');
            $table->integer('safety_fee_cents');
            $table->integer('platform_fee_cents');
            $table->integer('companion_payout_cents');
            $table->enum('purpose', ['WEDDING', 'BUSINESS', 'TOURISM', 'CORPORATE', 'OTHER']);
            $table->text('special_requests')->nullable();
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('bookings');
""", 3)

# 4. Ledger
make_mig('create_ledgers_table', 'CreateLedgersTable', """
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
""", """
        Schema::dropIfExists('ledger_transactions');
        Schema::dropIfExists('wallets');
""", 4)

# 5. DB Triggers and Indexes
make_mig('add_db_triggers_and_indexes', 'AddDbTriggersAndIndexes', """
        // Spatial Indexes
        DB::statement('CREATE INDEX venues_location_gist ON venues USING GIST (location);');
        DB::statement('CREATE INDEX companion_location_gist ON companion_profiles USING GIST (last_location);');
        DB::statement('CREATE INDEX restricted_zones_boundary_gist ON restricted_zones USING GIST (boundary);');

        // GIN Indexes
        DB::statement('CREATE INDEX companion_languages_gin ON companion_profiles USING GIN (languages);');
        DB::statement('CREATE INDEX companion_specialties_gin ON companion_profiles USING GIN (specialties);');

        // Venue Restricted Zones Trigger
        DB::unprepared("
            CREATE OR REPLACE FUNCTION check_venue_not_in_red_zone()
            RETURNS TRIGGER AS $$
            BEGIN
                IF EXISTS (
                    SELECT 1 FROM restricted_zones rz 
                    WHERE rz.is_active = true 
                    AND ST_Intersects(NEW.location, rz.boundary)
                ) THEN
                    RAISE EXCEPTION 'Venue falls within a restricted compliance zone.';
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER enforce_venue_zones
            BEFORE INSERT OR UPDATE ON venues
            FOR EACH ROW EXECUTE FUNCTION check_venue_not_in_red_zone();
        ");

        // Double Booking constraint
        DB::statement("
            ALTER TABLE bookings 
            ADD CONSTRAINT prevent_double_booking 
            EXCLUDE USING gist (
                companion_id WITH =, 
                tsrange(scheduled_start, scheduled_end + interval '60 minutes') WITH &&
            ) WHERE (status NOT IN ('CANCELLED', 'DISPUTED'));
        ");

        // Ledger immutability trigger
        DB::unprepared("
            CREATE OR REPLACE FUNCTION prevent_ledger_modification()
            RETURNS TRIGGER AS $$
            BEGIN
                RAISE EXCEPTION 'Ledger transactions are append-only. UPDATE and DELETE are strictly prohibited.';
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER enforce_ledger_immutability
            BEFORE UPDATE OR DELETE ON ledger_transactions
            FOR EACH ROW EXECUTE FUNCTION prevent_ledger_modification();
        ");
""", """
        DB::unprepared("DROP TRIGGER IF EXISTS enforce_ledger_immutability ON ledger_transactions;");
        DB::unprepared("DROP FUNCTION IF EXISTS prevent_ledger_modification;");
        DB::statement("ALTER TABLE bookings DROP CONSTRAINT IF EXISTS prevent_double_booking;");
        DB::unprepared("DROP TRIGGER IF EXISTS enforce_venue_zones ON venues;");
        DB::unprepared("DROP FUNCTION IF EXISTS check_venue_not_in_red_zone;");
        DB::statement("DROP INDEX IF EXISTS companion_specialties_gin;");
        DB::statement("DROP INDEX IF EXISTS companion_languages_gin;");
        DB::statement("DROP INDEX IF EXISTS restricted_zones_boundary_gist;");
        DB::statement("DROP INDEX IF EXISTS companion_location_gist;");
        DB::statement("DROP INDEX IF EXISTS venues_location_gist;");
""", 5)

print('Migrations created.')
