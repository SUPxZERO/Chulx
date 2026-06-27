<?php

declare(strict_types=1);

namespace App\Enums;

enum AvailabilityStatus: string
{
    case AVAILABLE = 'available';
    case BUSY      = 'busy';
    case OFFLINE   = 'offline';
}
