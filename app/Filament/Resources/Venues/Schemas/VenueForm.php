<?php

namespace App\Filament\Resources\Venues\Schemas;

use App\Enums\VenueCategory;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class VenueForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('address')
                    ->required(),
                TextInput::make('location'),
                Select::make('category')
                    ->options(VenueCategory::class)
                    ->required(),
                Toggle::make('is_approved')
                    ->required(),
                TextInput::make('capacity')
                    ->numeric(),
            ]);
    }
}
