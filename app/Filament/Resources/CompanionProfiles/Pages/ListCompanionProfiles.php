<?php

namespace App\Filament\Resources\CompanionProfiles\Pages;

use App\Filament\Resources\CompanionProfiles\CompanionProfileResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCompanionProfiles extends ListRecords
{
    protected static string $resource = CompanionProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
