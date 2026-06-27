// ---------------------------------------------------------------------------
// Input — Dark floating-label input, react-hook-form compatible
// ---------------------------------------------------------------------------

import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { cn } from '@lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, wrapperClassName, id, ...rest }, ref) => {
    const [focused, setFocused] = useState(false);
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('relative w-full', wrapperClassName)}>
        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          placeholder=" "
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          className={cn(
            'peer w-full rounded-lg border bg-[#1A1A3E]/60 px-4 pt-5 pb-2 text-[#E8E8E8] outline-none transition-all duration-200',
            'placeholder-transparent',
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-500/40'
              : 'border-white/10 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30',
            className,
          )}
          {...rest}
        />

        {/* Floating label */}
        <label
          htmlFor={inputId}
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#E8E8E8]/50 transition-all duration-200',
            'peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:text-xs',
            'peer-[:not(:placeholder-shown)]:top-2.5 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs',
            focused || rest.value ? 'text-[#D4AF37]/80' : '',
          )}
        >
          {label}
        </label>

        {/* Error message */}
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
