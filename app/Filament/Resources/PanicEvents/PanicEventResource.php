<?php

namespace App\Filament\Resources\PanicEvents;

use App\Filament\Resources\PanicEvents\Pages\CreatePanicEvent;
use App\Filament\Resources\PanicEvents\Pages\EditPanicEvent;
use App\Filament\Resources\PanicEvents\Pages\ListPanicEvents;
use App\Filament\Resources\PanicEvents\Schemas\PanicEventForm;
use App\Filament\Resources\PanicEvents\Tables\PanicEventsTable;
use App\Models\PanicEvent;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class PanicEventResource extends Resource
{
    protected static ?string $model = PanicEvent::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'id';

    public static function form(Schema $schema): Schema
    {
        return PanicEventForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PanicEventsTable::configure($table);
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
            'index' => ListPanicEvents::route('/'),
            'create' => CreatePanicEvent::route('/create'),
            'edit' => EditPanicEvent::route('/{record}/edit'),
        ];
    }
}
