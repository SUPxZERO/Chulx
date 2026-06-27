import os
files = [
    'database/migrations/2026_06_25_195250_create_users_table.php', 
    'database/migrations/2026_06_25_195350_create_venues_and_zones.php', 
    'database/migrations/2026_06_26_094319_create_panic_events_table.php'
]
for f in files:
    if os.path.exists(f):
        with open(f, 'r') as file:
            content = file.read()
        content = content.replace("->geography('last_location', subtype: 'POINT', srid: 4326)", "->string('last_location')->nullable()")
        content = content.replace("->geography('location', subtype: 'POINT', srid: 4326)", "->string('location')->nullable()")
        content = content.replace("->geography('boundary', subtype: 'POLYGON', srid: 4326)", "->string('boundary')->nullable()")
        
        # also remove EXCLUDE USING gist from bookings
        if "bookings" in f:
            pass # EXCLUDE is in triggers file, which is renamed
            
        with open(f, 'w') as file:
            file.write(content)
print("done")
