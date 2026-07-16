import React from 'react';
import { cn } from '@/src/lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

export interface EmeraldButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
}

export const EmeraldButton = React.forwardRef<HTMLButtonElement, EmeraldButtonProps>(
  ({
    children,
    className,
    variant = 'primary',
    isLoading,
    ...props
  }, ref) => {
    const variants = {
      primary: "text-white bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 shadow-lg shadow-emerald-300/50 hover:shadow-emerald-400/60",
      secondary: "bg-emerald-100/80 text-emerald-700 hover:bg-emerald-200/90 backdrop-blur-sm",
      outline: "border-2 border-emerald-500/70 text-emerald-600 hover:bg-emerald-50/70 backdrop-blur-sm",
      ghost: "text-emerald-600 hover:bg-emerald-50/70 backdrop-blur-sm",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative overflow-hidden px-6 py-3 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
          variants[variant],
          className
        )}
        {...props}
      >
        {/* Soft top sheen for a glossy glass feel */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-2xl" />
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

EmeraldButton.displayName = 'EmeraldButton';
