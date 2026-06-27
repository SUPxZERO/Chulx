<?php

namespace App\Filament\Resources\LexiconEntries\Pages;

use App\Filament\Resources\LexiconEntries\LexiconEntryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditLexiconEntry extends EditRecord
{
    protected static string $resource = LexiconEntryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
