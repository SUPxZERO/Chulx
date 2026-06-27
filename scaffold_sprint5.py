import os
from datetime import datetime, timedelta

base_dir = r'e:\promgramming\Chulx'
mig_dir = os.path.join(base_dir, 'database', 'migrations')
model_dir = os.path.join(base_dir, 'app', 'Models')

os.makedirs(mig_dir, exist_ok=True)
os.makedirs(model_dir, exist_ok=True)

models = ['ChatMessage', 'LexiconEntry', 'PanicEvent', 'MeetingVerification']
for m in models:
    code = f"""<?php
namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Factories\\HasFactory;
use Illuminate\\Database\\Eloquent\\Model;

class {m} extends Model
{{
    use HasFactory;
    protected $guarded = [];
}}
"""
    with open(os.path.join(model_dir, f'{m}.php'), 'w') as f:
        f.write(code)

print('Models created.')

def make_mig(name, class_name, up_content, down_content, offset_minutes=0):
    dt = datetime.now() + timedelta(minutes=offset_minutes)
    prefix = dt.strftime('%Y_%m_%d_%H%M%S')
    filename = f"{prefix}_{name}.php"
    code = f"""<?php

use Illuminate\\Database\\Migrations\\Migration;
use Illuminate\\Database\\Schema\\Blueprint;
use Illuminate\\Support\\Facades\\Schema;

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

# 1. Chat Messages
make_mig('create_chat_messages_table', 'CreateChatMessagesTable', """
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('users')->cascadeOnDelete();
            $table->text('content');
            $table->boolean('is_redacted')->default(false);
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('chat_messages');
""", 10)

# 2. Lexicon Entries
make_mig('create_lexicon_entries_table', 'CreateLexiconEntriesTable', """
        Schema::create('lexicon_entries', function (Blueprint $table) {
            $table->id();
            $table->string('word')->unique();
            $table->string('language'); // EN, KM, etc.
            $table->enum('severity', ['BLOCK', 'WARN', 'REDACT'])->default('REDACT');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('lexicon_entries');
""", 11)

# 3. Panic Events
make_mig('create_panic_events_table', 'CreatePanicEventsTable', """
        Schema::create('panic_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('triggered_by')->constrained('users')->cascadeOnDelete();
            $table->geography('location', subtype: 'POINT', srid: 4326)->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->boolean('escrow_frozen')->default(true);
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('panic_events');
""", 12)

# 4. Meeting Verifications
make_mig('create_meeting_verifications_table', 'CreateMeetingVerificationsTable', """
        Schema::create('meeting_verifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->string('totp_secret');
            $table->timestamp('scanned_at')->nullable();
            $table->boolean('verified_offline')->default(false);
            $table->timestamps();
        });
""", """
        Schema::dropIfExists('meeting_verifications');
""", 13)

print('Migrations created.')
