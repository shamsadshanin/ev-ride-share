import { ReactNode } from 'react';
import { cn } from '@/src/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function GlassCard({ children, className, id }: GlassCardProps) {
  return (
    <div 
      id={id}
      className={cn(
        "glass rounded-3xl p-6 transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}
