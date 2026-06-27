// ---------------------------------------------------------------------------
// Button — Premium button with variants, sizes, and loading state
// ---------------------------------------------------------------------------

import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@lib/cn';
import Spinner from '@components/ui/Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'form'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-[#D4AF37] to-[#B8962E] text-[#0F0F23] font-semibold shadow-lg shadow-[#D4AF37]/20 hover:shadow-[#D4AF37]/40',
  secondary:
    'border border-[#D4AF37]/60 text-[#D4AF37] bg-transparent hover:bg-[#D4AF37]/10',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20',
  ghost:
    'bg-transparent text-[#E8E8E8] hover:bg-white/5',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-7 py-3.5 text-base rounded-xl gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        whileHover={isDisabled ? undefined : { scale: 1.03 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-colors duration-200 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...rest}
      >
        {loading && <Spinner size="sm" className={variant === 'primary' ? 'text-[#0F0F23]' : ''} />}
        {children}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
