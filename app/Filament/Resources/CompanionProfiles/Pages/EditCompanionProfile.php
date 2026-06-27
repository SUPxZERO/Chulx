<?php

namespace App\Filament\Resources\CompanionProfiles\Pages;

use App\Filament\Resources\CompanionProfiles\CompanionProfileResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCompanionProfile extends EditRecord
{
    protected static string $resource = CompanionProfileResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
