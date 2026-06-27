<?php

namespace App\Filament\Resources\LexiconEntries\Pages;

use App\Filament\Resources\LexiconEntries\LexiconEntryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListLexiconEntries extends ListRecords
{
    protected static string $resource = LexiconEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
