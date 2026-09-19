import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'zinc';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'zinc',
  dot = false,
  children,
  ...props
}) => {
  const variants = {
    emerald: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    rose: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    indigo: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    cyan: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    zinc: "bg-zinc-800 text-zinc-300 border-zinc-700/60"
  };

  const dotColors = {
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    rose: "bg-rose-400",
    indigo: "bg-indigo-400",
    cyan: "bg-cyan-400",
    zinc: "bg-zinc-400"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border font-sans select-none",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
};
