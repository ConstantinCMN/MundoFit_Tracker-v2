'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

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
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-left backdrop-blur-sm transition-colors hover:bg-[rgba(255,255,255,0.05)]"
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
    </motion.button>
  );
}
