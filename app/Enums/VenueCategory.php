<?php

declare(strict_types=1);

namespace App\Enums;

enum VenueCategory: string
{
    case RESTAURANT    = 'restaurant';
    case EVENT_HALL    = 'event_hall';
    case CONFERENCE    = 'conference';
    case TEMPLE        = 'temple';
    case MARKET        = 'market';
    case OTHER         = 'other';
}
