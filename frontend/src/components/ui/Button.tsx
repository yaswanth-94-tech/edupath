import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'struggle' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-xl select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 btn-press";
    
    const variants = {
      primary: "gradient-primary-btn text-white border border-white/15 btn-shimmer",
      secondary: "bg-surface-elevated hover:bg-surface-hover text-zinc-200 border border-white/10 hover:border-white/20 shadow-sm",
      glass: "glass text-white hover:text-white border-white/20 hover:border-white/35 shadow-md btn-shimmer",
      ghost: "bg-transparent hover:bg-white/5 text-zinc-400 hover:text-zinc-100",
      outline: "bg-transparent border border-white/15 hover:bg-white/5 text-zinc-200",
      struggle: "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30",
      danger: "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30"
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-xs px-4 py-2 gap-2",
      lg: "text-sm px-5 py-2.5 gap-2.5",
      icon: "w-8 h-8 p-0"
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1.5" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
