import React, { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'gold' | 'outline' | 'discount' | 'secondary' | 'success';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-surface-secondary text-foreground border border-border',
    gold: 'bg-gold/15 text-gold border border-gold/30',
    outline: 'border border-border text-foreground',
    discount: 'bg-red-500/15 text-red-400 border border-red-500/30 font-semibold',
    secondary: 'bg-surface text-muted border border-border',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium tracking-wide uppercase',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
