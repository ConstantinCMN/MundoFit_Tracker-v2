'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  ArrowUp, ArrowDown, Footprints, ChevronsUp, ChevronsDown, Dumbbell, Sliders, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useRouter } from '@/lib/i18n/navigation';
import { SPLIT_TYPES, type SplitType } from '@/lib/workouts/split-types';

const SPLIT_ICON: Record<SplitType, typeof ArrowUp> = {
  push: ArrowUp,
  pull: ArrowDown,
  legs: Footprints,
  upper: ChevronsUp,
  lower: ChevronsDown,
  full: Dumbbell,
  custom: Sliders,
};

function SplitCard({
  type,
  active,
  label,
  desc,
  onClick,
}: {
  type: SplitType;
  active: boolean;
  label: string;
  desc: string;
  onClick: () => void;
}) {
  const Icon = SPLIT_ICON[type];
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors',
        active
          ? 'border-[#aaff00]/50 bg-[#aaff00]/[0.08]'
          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]'
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          active ? 'bg-[#aaff00] text-[#0a0a0a]' : 'bg-[rgba(255,255,255,0.05)] text-[#888888]'
        )}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn('text-[15px] font-bold', active ? 'text-[#f5f5f5]' : 'text-[#d5d5d5]')}>
          {label}
        </p>
        <p className="mt-0.5 text-[12px] text-[#555555]">{desc}</p>
      </div>
      <ChevronRight size={16} className={active ? 'text-[#aaff00]' : 'text-[#3a3a3a]'} />
    </button>
  );
}

export function SplitTypeSelectorClient() {
  const t = useTranslations('workoutStart');
  const router = useRouter();
  const [selected, setSelected] = useState<SplitType | null>(null);

  function handleContinue() {
    if (!selected) return;
    router.push(`/body?split=${selected}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col pb-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="px-5 pt-5"
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          MundoFit
        </p>
        <h2 className="text-[22px] font-black text-[#f5f5f5]">{t('title')}</h2>
        <p className="mt-1 text-[13px] text-[#555555]">{t('subtitle')}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, delay: 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-5 space-y-2.5 px-5"
      >
        {SPLIT_TYPES.map(type => (
          <SplitCard
            key={type}
            type={type}
            active={selected === type}
            label={t(`types.${type}.label`)}
            desc={t(`types.${type}.desc`)}
            onClick={() => setSelected(type)}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: selected ? 0 : 8 }}
        transition={{ duration: 0.22 }}
        className="mt-5 px-5"
      >
        <button
          type="button"
          disabled={!selected}
          onClick={handleContinue}
          className={cn(
            'flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[16px] font-black transition-opacity',
            selected
              ? 'bg-[#aaff00] text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.2)]'
              : 'bg-[rgba(255,255,255,0.05)] text-[#3a3a3a]'
          )}
        >
          {t('continue')}
        </button>
      </motion.div>
    </motion.div>
  );
}
