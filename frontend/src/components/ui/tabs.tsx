import * as React from 'react';

import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

function Tabs({ value, onValueChange, className, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={cn('space-y-3', className)} {...props} />
    </TabsContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-500',
        className,
      )}
      {...props}
    />
  );
}

interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({
  className,
  value,
  children,
  ...props
}: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) return null;

  const isActive = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onChange(value)}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-3 py-1 transition-colors',
        isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({
  className,
  value,
  ...props
}: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx || ctx.value !== value) return null;

  return (
    <div className={cn(className)} {...props} />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };

