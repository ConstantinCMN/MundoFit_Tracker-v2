import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Card } from '@/components/ui/card';

type DashboardCardProps = {
  accent?: boolean;
  className?: string;
  children: ReactNode;
};

export function DashboardCard({ accent = false, className, children }: DashboardCardProps) {
  return (
    <Card
      className={cn(
        'backdrop-blur-sm',
        accent
          ? 'border-accent/20 bg-accent/5'
          : 'border-border bg-bg-surface',
        className
      )}
    >
      {children}
    </Card>
  );
}
