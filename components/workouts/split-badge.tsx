'use client';

import { useTranslations } from 'next-intl';
import { isSplitType, SPLIT_ICON, SPLIT_COLOR } from '@/lib/workouts/split-types';

export function SplitBadge({ split }: { split: string | null | undefined }) {
  const t = useTranslations('workoutStart');

  const value = split ?? null;
  if (!isSplitType(value)) return null;

  const Icon = SPLIT_ICON[value];
  const color = SPLIT_COLOR[value];

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
      style={{ background: `${color}1c`, color }}
    >
      <Icon size={10} />
      {t(`types.${split}.label`)}
    </span>
  );
}
