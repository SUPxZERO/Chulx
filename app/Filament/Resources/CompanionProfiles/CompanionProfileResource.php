<?php

namespace App\Filament\Resources\CompanionProfiles;

use App\Filament\Resources\CompanionProfiles\Pages\CreateCompanionProfile;
use App\Filament\Resources\CompanionProfiles\Pages\EditCompanionProfile;
use App\Filament\Resources\CompanionProfiles\Pages\ListCompanionProfiles;
use App\Filament\Resources\CompanionProfiles\Schemas\CompanionProfileForm;
use App\Filament\Resources\CompanionProfiles\Tables\CompanionProfilesTable;
use App\Models\CompanionProfile;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CompanionProfileResource extends Resource
{
    protected static ?string $model = CompanionProfile::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Schema $schema): Schema
    {
        return CompanionProfileForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CompanionProfilesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCompanionProfiles::route('/'),
            'create' => CreateCompanionProfile::route('/create'),
            'edit' => EditCompanionProfile::route('/{record}/edit'),
        ];
    }
}
