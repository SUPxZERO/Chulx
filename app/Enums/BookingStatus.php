<?php

declare(strict_types=1);

namespace App\Enums;

enum BookingStatus: string
{
    case PENDING     = 'pending';
    case ACCEPTED    = 'accepted';
    case FUNDED      = 'funded';
    case IN_PROGRESS = 'in_progress';
    case COMPLETED   = 'completed';
    case DISPUTED    = 'disputed';
    case CANCELLED   = 'cancelled';
    case PAID        = 'paid';

    /**
     * Return the list of states this status can legally transition to.
     *
     * @return self[]
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::PENDING     => [self::ACCEPTED, self::CANCELLED],
            self::ACCEPTED    => [self::FUNDED, self::CANCELLED],
            self::FUNDED      => [self::IN_PROGRESS, self::CANCELLED],
            self::IN_PROGRESS => [self::COMPLETED, self::DISPUTED],
            self::COMPLETED   => [self::PAID, self::DISPUTED],
            self::DISPUTED    => [self::PAID, self::CANCELLED],
            self::PAID        => [],
            self::CANCELLED   => [],
        };
    }

    /**
     * Check whether transitioning from the current state to `$target` is allowed.
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    /**
     * Human-readable label for display in UIs and notifications.
     */
    public function label(): string
    {
        return match ($this) {
            self::PENDING     => 'Pending',
            self::ACCEPTED    => 'Accepted',
            self::FUNDED      => 'Funded',
            self::IN_PROGRESS => 'In Progress',
            self::COMPLETED   => 'Completed',
            self::DISPUTED    => 'Disputed',
            self::CANCELLED   => 'Cancelled',
            self::PAID        => 'Paid',
        };
    }
}
