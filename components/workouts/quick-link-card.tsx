'use client';

import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function QuickLinkCard({
  icon: Icon,
  label,
  color,
  onClick,
  badge,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  color: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-4 text-left backdrop-blur-sm"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}22` }}
      >
        <Icon size={18} color={color} />
      </div>
      <span className="flex-1 text-[13px] font-semibold leading-tight text-[#cccccc]">
        {label}
      </span>
      {badge && (
        <span className="rounded-full bg-[rgba(170,255,0,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#aaff00]">
          {badge}
        </span>
      )}
      <ChevronRight size={14} color="#444444" />
    </Card>
  );
}
