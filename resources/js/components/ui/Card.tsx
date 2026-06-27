// ---------------------------------------------------------------------------
// Card — Glass-morphism dark card with gold hover border
// ---------------------------------------------------------------------------

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@lib/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  hover?: boolean;
  className?: string;
}

export default function Card({
  children,
  hover = true,
  className,
  ...rest
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hover ? { scale: 1.01 } : undefined}
      className={cn(
        'rounded-2xl border border-white/[0.06] bg-[#1A1A3E]/80 p-6 backdrop-blur-sm',
        'transition-colors duration-300',
        hover && 'hover:border-[#D4AF37]/30',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
