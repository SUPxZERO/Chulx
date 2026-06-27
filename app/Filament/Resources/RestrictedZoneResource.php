<?php

namespace App\Filament\Resources;

use App\Filament\Resources\RestrictedZoneResource\Pages;
use App\Models\RestrictedZone;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class RestrictedZoneResource extends Resource
{
    protected static ?string $model = RestrictedZone::class;
    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Schema $form): Schema
    {
        return $form->components([
            // Form schema generated here
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRestrictedZones::route('/'),
            'create' => Pages\CreateRestrictedZone::route('/create'),
            'edit' => Pages\EditRestrictedZone::route('/{record}/edit'),
        ];
    }
}
