// ---------------------------------------------------------------------------
// Badge — Status pill badges with contextual colours
// ---------------------------------------------------------------------------

import { cn } from '@lib/cn';
import type { AvailabilityStatus, BookingStatus } from '@types/models';

type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'gold';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25',
  warning: 'bg-amber-500/15 text-amber-400 ring-amber-500/25',
  danger:  'bg-red-500/15 text-red-400 ring-red-500/25',
  info:    'bg-sky-500/15 text-sky-400 ring-sky-500/25',
  neutral: 'bg-white/8 text-[#E8E8E8]/60 ring-white/10',
  gold:    'bg-[#D4AF37]/15 text-[#D4AF37] ring-[#D4AF37]/25',
};

export default function Badge({
  children,
  variant = 'neutral',
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Helpers to map domain statuses → badge variants
// ---------------------------------------------------------------------------

const availabilityMap: Record<AvailabilityStatus, BadgeVariant> = {
  AVAILABLE: 'success',
  BUSY: 'warning',
  OFFLINE: 'neutral',
};

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return <Badge variant={availabilityMap[status]}>{status}</Badge>;
}

const bookingStatusMap: Record<BookingStatus, BadgeVariant> = {
  pending:     'warning',
  accepted:    'info',
  funded:      'gold',
  in_progress: 'info',
  completed:   'success',
  disputed:    'danger',
  cancelled:   'neutral',
  paid:        'success',
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const display = status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return <Badge variant={bookingStatusMap[status]}>{display}</Badge>;
}
