<?php
namespace App\Filament\Resources\RestrictedZoneResource\Pages;
use App\Filament\Resources\RestrictedZoneResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;
class EditRestrictedZone extends EditRecord {
    protected static string $resource = RestrictedZoneResource::class;
    protected function getHeaderActions(): array {
        return [ Actions\DeleteAction::make() ];
    }
}