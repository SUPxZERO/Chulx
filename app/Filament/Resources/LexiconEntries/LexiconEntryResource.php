<?php

namespace App\Filament\Resources\LexiconEntries;

use App\Filament\Resources\LexiconEntries\Pages\CreateLexiconEntry;
use App\Filament\Resources\LexiconEntries\Pages\EditLexiconEntry;
use App\Filament\Resources\LexiconEntries\Pages\ListLexiconEntries;
use App\Filament\Resources\LexiconEntries\Schemas\LexiconEntryForm;
use App\Filament\Resources\LexiconEntries\Tables\LexiconEntriesTable;
use App\Models\LexiconEntry;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class LexiconEntryResource extends Resource
{
    protected static ?string $model = LexiconEntry::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return LexiconEntryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return LexiconEntriesTable::configure($table);
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
            'index' => ListLexiconEntries::route('/'),
            'create' => CreateLexiconEntry::route('/create'),
            'edit' => EditLexiconEntry::route('/{record}/edit'),
        ];
    }
}
