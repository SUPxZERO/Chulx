<?php

declare(strict_types=1);

namespace App\Enums;

enum AvailabilityStatus: string
{
    case AVAILABLE = 'AVAILABLE';
    case BUSY      = 'BUSY';
    case OFFLINE   = 'OFFLINE';
}
