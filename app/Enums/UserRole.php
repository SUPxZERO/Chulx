<?php

declare(strict_types=1);

namespace App\Enums;

enum UserRole: string
{
    case CLIENT    = 'client';
    case COMPANION = 'companion';
    case ADMIN     = 'admin';
}
