'use client';

import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const statusIndicatorVariants = cva(
  'inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset transition-colors',
  {
    variants: {
      variant: {
        healthy: 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20',
        warning: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-500/10 dark:text-yellow-400 dark:ring-yellow-500/20',
        error: 'bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20',
        info: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20',
        neutral: 'bg-gray-50 text-gray-700 ring-gray-600/20 dark:bg-gray-500/10 dark:text-gray-400 dark:ring-gray-500/20',
      },
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base px-3 py-1',
      },
      hasAnimation: {
        true: 'animate-pulse',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'default',
      hasAnimation: false,
    },
  }
);

const dotVariants = cva('h-2 w-2 rounded-full', {
  variants: {
    variant: {
      healthy: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      neutral: 'bg-gray-500',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

export interface StatusIndicatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  showDot?: boolean;
  animate?: boolean;
}

export function StatusIndicator({
  className,
  variant,
  size,
  showDot = true,
  animate = false,
  children,
  ...props
}: StatusIndicatorProps) {
  return (
    <div
      className={cn(
        statusIndicatorVariants({ variant, size, hasAnimation: animate, className })
      )}
      {...props}
    >
      {showDot && <div className={cn(dotVariants({ variant }))} />}
      {children}
    </div>
  );
}

// 預設的狀態文字
export const defaultStatusText = {
  healthy: 'Healthy',
  warning: 'Warning',
  error: 'Error',
  info: 'Info',
  neutral: 'Neutral',
} as const;

// 狀態類型
export type StatusType = keyof typeof defaultStatusText;
