<?php

namespace App\Filament\Resources\LedgerTransactions\Schemas;

use App\Enums\LedgerType;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class LedgerTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('wallet_id')
                    ->relationship('wallet', 'id')
                    ->required(),
                Select::make('booking_id')
                    ->relationship('booking', 'id')
                    ->required(),
                Select::make('type')
                    ->options(LedgerType::class)
                    ->required(),
                TextInput::make('amount_cents')
                    ->required()
                    ->numeric(),
                TextInput::make('running_balance_cents')
                    ->required()
                    ->numeric(),
                TextInput::make('reference_id'),
                TextInput::make('metadata'),
            ]);
    }
}
