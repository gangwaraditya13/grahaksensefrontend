import React, { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/utils';

export const Skeleton: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-surface-secondary/80', className)}
      {...props}
    />
  );
};
