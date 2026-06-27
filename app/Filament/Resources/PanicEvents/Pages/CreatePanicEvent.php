<?php

namespace App\Filament\Resources\PanicEvents\Pages;

use App\Filament\Resources\PanicEvents\PanicEventResource;
use Filament\Resources\Pages\CreateRecord;

class CreatePanicEvent extends CreateRecord
{
    protected static string $resource = PanicEventResource::class;
}
