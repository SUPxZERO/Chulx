<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BookingResource\Pages;
use App\Models\Booking;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use App\Enums\BookingStatus;
use Filament\Tables\Actions\Action;
use Filament\Notifications\Notification;

class BookingResource extends Resource
{
    protected static ?string $model = Booking::class;
    protected static string | \BackedEnum | null $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Schema $form): Schema
    {
        return $form->components([
            // Form schema generated here
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')->sortable(),
                Tables\Columns\TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Action::make('resolve_dispute')
                    ->label('Resolve Dispute')
                    ->color('danger')
                    ->icon('heroicon-o-shield-exclamation')
                    ->visible(fn (Booking $record): bool => $record->status === BookingStatus::DISPUTED)
                    ->form([
                        Forms\Components\Select::make('resolution')
                            ->options([
                                BookingStatus::PAID->value => 'Resolve in favor of Companion (Pay)',
                                BookingStatus::CANCELLED->value => 'Resolve in favor of Client (Cancel/Refund)',
                            ])
                            ->required(),
                    ])
                    ->action(function (Booking $record, array $data): void {
                        $record->transitionTo(BookingStatus::from($data['resolution']), isAdmin: true);
                        
                        Notification::make()
                            ->title('Dispute Resolved')
                            ->success()
                            ->send();
                    }),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListBookings::route('/'),
            'create' => Pages\CreateBooking::route('/create'),
            'edit' => Pages\EditBooking::route('/{record}/edit'),
        ];
    }
}
