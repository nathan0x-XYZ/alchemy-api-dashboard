'use client';

import { HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  'rounded-2xl p-6 transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white dark:bg-gray-800 shadow-sm hover:shadow-md',
        stat: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/5 dark:to-purple-500/5',
        status: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children?: ReactNode;
  title?: string;
  value?: string | number;
  label?: string;
  status?: 'healthy' | 'warning' | 'error';
}

const statusColors = {
  healthy: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function Card({
  className,
  variant,
  children,
  title,
  value,
  label,
  status,
  ...props
}: CardProps) {
  return (
    <div className={cn(cardVariants({ variant, className }))} {...props}>
      {variant === 'stat' ? (
        <>
          {label && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
          )}
          {value && (
            <p className="text-3xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              {value}
            </p>
          )}
        </>
      ) : variant === 'status' ? (
        <div className="flex items-center space-x-3">
          {status && (
            <div className="flex-shrink-0">
              <div className={cn('w-2 h-2 rounded-full', statusColors[status])} />
            </div>
          )}
          <div>
            {title && <h3 className="font-medium">{title}</h3>}
            {children}
          </div>
        </div>
      ) : (
        <>
          {title && <h3 className="font-medium mb-2">{title}</h3>}
          {children}
        </>
      )}
    </div>
  );
}
