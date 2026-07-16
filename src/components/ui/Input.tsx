import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/src/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={id} className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 outline-hidden transition-all duration-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 placeholder:text-slate-400",
              icon && "pl-11",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-red-500 px-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
