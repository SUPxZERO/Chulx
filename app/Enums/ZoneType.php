<?php

declare(strict_types=1);

namespace App\Enums;

enum ZoneType: string
{
    case HOTEL       = 'hotel';
    case RESIDENTIAL = 'residential';
    case NIGHTCLUB   = 'nightclub';
    case RED_LIGHT   = 'red_light';
}
