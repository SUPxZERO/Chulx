import os

base_dir = r'e:\promgramming\Chulx'
resource_dir = os.path.join(base_dir, 'app', 'Filament', 'Resources')

os.makedirs(resource_dir, exist_ok=True)

resources = {
    'UserResource': 'User',
    'BookingResource': 'Booking',
    'VenueResource': 'Venue',
    'RestrictedZoneResource': 'RestrictedZone'
}

for r_class, m_class in resources.items():
    code = f"""<?php

namespace App\\Filament\\Resources;

use App\\Filament\\Resources\\{r_class}\\Pages;
use App\\Models\\{m_class};
use Filament\\Forms;
use Filament\\Forms\\Form;
use Filament\\Resources\\Resource;
use Filament\\Tables;
use Filament\\Tables\\Table;

class {r_class} extends Resource
{{
    protected static ?string $model = {m_class}::class;
    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {{
        return $form->schema([
            // Form schema generated here
        ]);
    }}

    public static function table(Table $table): Table
    {{
        return $table
            ->columns([
                Tables\\Columns\\TextColumn::make('id')->sortable(),
                Tables\\Columns\\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\\Actions\\EditAction::make(),
            ])
            ->bulkActions([
                Tables\\Actions\\BulkActionGroup::make([
                    Tables\\Actions\\DeleteBulkAction::make(),
                ]),
            ]);
    }}

    public static function getRelations(): array
    {{
        return [];
    }}

    public static function getPages(): array
    {{
        return [
            'index' => Pages\\List{m_class}s::route('/'),
            'create' => Pages\\Create{m_class}::route('/create'),
            'edit' => Pages\\Edit{m_class}::route('/{{record}}/edit'),
        ];
    }}
}}
"""
    with open(os.path.join(resource_dir, f'{r_class}.php'), 'w') as f:
        f.write(code)

    # Make pages
    pages_dir = os.path.join(resource_dir, r_class, 'Pages')
    os.makedirs(pages_dir, exist_ok=True)
    
    list_code = f"""<?php
namespace App\\Filament\\Resources\\{r_class}\\Pages;
use App\\Filament\\Resources\\{r_class};
use Filament\\Actions;
use Filament\\Resources\\Pages\\ListRecords;
class List{m_class}s extends ListRecords {{
    protected static string $resource = {r_class}::class;
    protected function getHeaderActions(): array {{
        return [ Actions\\CreateAction::make() ];
    }}
}}"""
    with open(os.path.join(pages_dir, f'List{m_class}s.php'), 'w') as f: f.write(list_code)

    create_code = f"""<?php
namespace App\\Filament\\Resources\\{r_class}\\Pages;
use App\\Filament\\Resources\\{r_class};
use Filament\\Resources\\Pages\\CreateRecord;
class Create{m_class} extends CreateRecord {{
    protected static string $resource = {r_class}::class;
}}"""
    with open(os.path.join(pages_dir, f'Create{m_class}.php'), 'w') as f: f.write(create_code)

    edit_code = f"""<?php
namespace App\\Filament\\Resources\\{r_class}\\Pages;
use App\\Filament\\Resources\\{r_class};
use Filament\\Actions;
use Filament\\Resources\\Pages\\EditRecord;
class Edit{m_class} extends EditRecord {{
    protected static string $resource = {r_class}::class;
    protected function getHeaderActions(): array {{
        return [ Actions\\DeleteAction::make() ];
    }}
}}"""
    with open(os.path.join(pages_dir, f'Edit{m_class}.php'), 'w') as f: f.write(edit_code)

print("Filament resources created!")
