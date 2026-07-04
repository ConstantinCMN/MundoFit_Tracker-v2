import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

type DashboardCardProps = {
  accent?: boolean;
  className?: string;
  children: ReactNode;
};

export function DashboardCard({ accent = false, className, children }: DashboardCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border backdrop-blur-sm',
        accent
          ? 'border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.04)]'
          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]',
        className
      )}
    >
      {children}
    </div>
  );
}
