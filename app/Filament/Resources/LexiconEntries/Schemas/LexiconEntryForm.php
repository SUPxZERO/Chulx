<?php

namespace App\Filament\Resources\LexiconEntries\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class LexiconEntryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('word')
                    ->required(),
                TextInput::make('language')
                    ->required(),
                Select::make('severity')
                    ->options([
                        'REDACT' => 'Redact (***)',
                        'BLOCK' => 'Block Message & Strike',
                    ])
                    ->required()
                    ->default('REDACT'),
                Toggle::make('is_active')
                    ->required(),
            ]);
    }
}
