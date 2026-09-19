import React, { useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'elevated' | 'outline';
  interactive?: boolean;
  spotlight?: boolean;
  tilt?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', interactive = false, spotlight = true, tilt = false, children, onMouseMove, onMouseLeave, ...props }, forwardedRef) => {
    const localRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const card = localRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (spotlight) {
        card.style.setProperty('--mx', `${x}px`);
        card.style.setProperty('--my', `${y}px`);
      }

      if (tilt && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -4.5;
        const rotateY = ((x - centerX) / centerX) * 4.5;
        card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
      }

      if (onMouseMove) onMouseMove(e);
    }, [spotlight, tilt, onMouseMove]);

    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      const card = localRef.current;
      if (card) {
        if (spotlight) {
          card.style.removeProperty('--mx');
          card.style.removeProperty('--my');
        }
        if (tilt) {
          card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        }
      }
      if (onMouseLeave) onMouseLeave(e);
    }, [spotlight, tilt, onMouseLeave]);

    const baseStyles = "relative rounded-2xl overflow-hidden transition-[box-shadow,border-color,transform] duration-200";
    
    const variants = {
      glass: "glass spotlight-card",
      solid: "bg-[#121826] border border-white/10 shadow-xl",
      elevated: "bg-[#182032] border border-white/12 shadow-2xl",
      outline: "bg-transparent border border-white/15"
    };

    const interactiveStyles = interactive 
      ? "cursor-pointer hover:border-brand-500/40 hover:shadow-brand-500/10" 
      : "";

    return (
      <div
        ref={(node) => {
          (localRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof forwardedRef === 'function') {
            forwardedRef(node);
          } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          baseStyles, 
          variants[variant], 
          spotlight && 'spotlight-card',
          interactiveStyles, 
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
