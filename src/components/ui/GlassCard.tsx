import React from 'react';
import { cn } from '@/src/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "glass rounded-3xl p-6 transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
