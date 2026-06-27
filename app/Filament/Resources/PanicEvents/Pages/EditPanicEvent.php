<?php

namespace App\Filament\Resources\PanicEvents\Pages;

use App\Filament\Resources\PanicEvents\PanicEventResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPanicEvent extends EditRecord
{
    protected static string $resource = PanicEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
