<?php

namespace App\Filament\Resources\PanicEvents\Pages;

use App\Filament\Resources\PanicEvents\PanicEventResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPanicEvents extends ListRecords
{
    protected static string $resource = PanicEventResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
