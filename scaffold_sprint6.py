import os
from datetime import datetime, timedelta

base_dir = r'e:\promgramming\Chulx'
mig_dir = os.path.join(base_dir, 'database', 'migrations')
model_dir = os.path.join(base_dir, 'app', 'Models')

# Model
code = f"""<?php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class ConsentLog extends Model
{{
    use HasFactory;
    
    protected $guarded = [];
    public $timestamps = false;
}}
"""
with open(os.path.join(model_dir, 'ConsentLog.php'), 'w') as f:
    f.write(code)

# Migration
dt = datetime.now() + timedelta(minutes=20)
prefix = dt.strftime('%Y_%m_%d_%H%M%S')
filename = f"{prefix}_create_consent_logs_table.php"
code = f"""<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;
use Illuminate\\Support\\Facades\\DB;

return new class extends Migration
{{
    public function up()
    {{
        Schema::create('consent_logs', function (Blueprint $table) {{
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('tos_version');
            $table->string('ip_address');
            $table->string('user_agent');
            $table->string('checksum'); // SHA256 of terms
            $table->timestamp('accepted_at')->useCurrent();
        }});

        // Immutability Trigger
        DB::unprepared('
            CREATE OR REPLACE FUNCTION prevent_consent_log_modification()
            RETURNS TRIGGER AS $$
            BEGIN
                RAISE EXCEPTION ''Consent logs are immutable for legal compliance. UPDATE and DELETE are strictly prohibited.'';
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER enforce_consent_immutability
            BEFORE UPDATE OR DELETE ON consent_logs
            FOR EACH ROW EXECUTE FUNCTION prevent_consent_log_modification();
        ');
    }}

    public function down()
    {{
        DB::unprepared('DROP TRIGGER IF EXISTS enforce_consent_immutability ON consent_logs;');
        DB::unprepared('DROP FUNCTION IF EXISTS prevent_consent_log_modification();');
        Schema::dropIfExists('consent_logs');
    }}
}};
"""
with open(os.path.join(mig_dir, filename), 'w') as f:
    f.write(code)

print('ConsentLog Model and Migration created.')
