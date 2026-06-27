// ---------------------------------------------------------------------------
// StarRating — Gold star display (supports half-stars via width clip)
// ---------------------------------------------------------------------------

import { Star } from 'lucide-react';
import { cn } from '@lib/cn';

interface StarRatingProps {
  rating: number;       // 0 – 5, supports decimals (e.g. 4.5)
  maxStars?: number;
  size?: number;        // icon size in px
  className?: string;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  className,
  showValue = false,
}: StarRatingProps) {
  const clamped = Math.min(Math.max(rating, 0), maxStars);

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const fill = Math.min(Math.max(clamped - i, 0), 1); // 0, partial, or 1

        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {/* Background (empty) star */}
            <Star
              className="absolute inset-0 text-white/10"
              size={size}
              strokeWidth={1.5}
            />
            {/* Filled star — clipped to `fill` width */}
            <span
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fill * 100}%` }}
            >
              <Star
                className="text-[#D4AF37]"
                size={size}
                fill="currentColor"
                strokeWidth={0}
              />
            </span>
          </span>
        );
      })}

      {showValue && (
        <span className="ml-1.5 text-sm font-medium text-[#E8E8E8]/70">
          {clamped.toFixed(1)}
        </span>
      )}
    </div>
  );
}
