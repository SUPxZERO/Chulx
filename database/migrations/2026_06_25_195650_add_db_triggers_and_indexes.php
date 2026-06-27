<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        
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
        DB::statement('CREATE EXTENSION IF NOT EXISTS btree_gist;');
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

    }

    public function down()
    {
        
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

    }
};
