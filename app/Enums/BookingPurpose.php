<?php

declare(strict_types=1);

namespace App\Enums;

enum BookingPurpose: string
{
    case WEDDING   = 'wedding';
    case BUSINESS  = 'business';
    case TOURISM   = 'tourism';
    case CORPORATE = 'corporate';
    case OTHER     = 'other';
}
