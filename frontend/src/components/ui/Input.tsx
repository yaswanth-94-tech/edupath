import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2.5 rounded-xl bg-[#090D16]/80 border text-xs text-slate-100 placeholder-slate-500",
          "outline-none transition-all duration-150 backdrop-blur-md",
          "focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error 
            ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/30" 
            : "border-white/10 hover:border-white/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
