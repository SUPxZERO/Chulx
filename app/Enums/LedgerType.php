<?php

declare(strict_types=1);

namespace App\Enums;

enum LedgerType: string
{
    case ESCROW_DEPOSIT  = 'escrow_deposit';
    case ESCROW_RELEASE  = 'escrow_release';
    case FEE_CAPTURE     = 'fee_capture';
    case REFUND          = 'refund';
    case CHARGEBACK_HOLD = 'chargeback_hold';
    case PAYOUT          = 'payout';
    case SAFETY_FEE      = 'safety_fee';
}
