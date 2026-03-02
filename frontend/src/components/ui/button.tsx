import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md';
}

const baseClasses =
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 disabled:pointer-events-none disabled:opacity-50';

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-slate-900 text-white hover:bg-slate-800 shadow-sm',
  outline:
    'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
};

const sizes: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button };

