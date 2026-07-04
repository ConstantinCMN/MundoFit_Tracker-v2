'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';
import {
  calculateBMI,
  calculateTDEE,
  getBMICategory,
  type BMICategory,
} from '@/lib/utils/fitness';
import type { Profile, Gender, ActivityLevel } from '@/types';
import { fadeUp } from '@/components/dashboard/ui/animations';
import { SectionHeader } from '@/components/dashboard/ui/section-header';
import { DashboardCard } from '@/components/dashboard/ui/dashboard-card';

// ── StatCard ───────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  unitColor,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string;
  unit?: string;
  unitColor?: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <DashboardCard accent={accent} className="px-4 py-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
        {label}
      </p>
      <p
        className={cn(
          'font-bold tabular-nums leading-tight',
          compact ? 'text-[14px]' : 'text-[22px] leading-none',
          accent ? 'text-[#aaff00]' : 'text-[#f5f5f5]'
        )}
      >
        {value}
      </p>
      {unit && (
        <p className="mt-1.5 text-[11px]" style={{ color: unitColor ?? '#666666' }}>
          {unit}
        </p>
      )}
    </DashboardCard>
  );
}

// ── QuickStatsSection ──────────────────────────────────────────────────────────

type QuickStatsSectionProps = {
  profile: Profile;
};

export function QuickStatsSection({ profile }: QuickStatsSectionProps) {
  const t = useTranslations('dashboard');

  const weight        = profile.weight_kg ?? 0;
  const height        = profile.height_cm ?? 0;
  const age           = profile.age ?? 0;
  const gender        = (profile.gender ?? 'male') as Gender;
  const activityLevel = (profile.activity_level ?? 'sedentary') as ActivityLevel;

  const bmi = useMemo(
    () => (weight > 0 && height > 0 ? calculateBMI(weight, height) : null),
    [weight, height]
  );

  const tdee = useMemo(
    () =>
      weight > 0 && height > 0 && age > 0
        ? calculateTDEE(weight, height, age, gender, activityLevel)
        : null,
    [weight, height, age, gender, activityLevel]
  );

  const bmiCategory: BMICategory | null = bmi ? getBMICategory(bmi) : null;

  const bmiColors: Record<BMICategory, string> = {
    underweight: '#60a5fa',
    normal:      '#aaff00',
    overweight:  '#fbbf24',
    obese:       '#f87171',
  };

  const bmiCategoryLabels: Record<BMICategory, string> = {
    underweight: t('bmiLabel.underweight'),
    normal:      t('bmiLabel.normal'),
    overweight:  t('bmiLabel.overweight'),
    obese:       t('bmiLabel.obese'),
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary:         'Sedentary',
    lightly_active:    'Light',
    moderately_active: 'Moderate',
    very_active:       'Very Active',
    athlete:           'Athlete',
  };

  const notSet = t('primaryStats.notSet');

  return (
    <motion.section {...fadeUp(0.10)} className="px-5">
      <SectionHeader label={t('primaryStats.title')} />
      <div className="grid grid-cols-2 gap-3">
        {/* Weight */}
        <StatCard
          label={t('primaryStats.weight')}
          value={weight > 0 ? String(weight) : notSet}
          unit={weight > 0 ? 'kg' : undefined}
        />
        {/* BMI */}
        <StatCard
          label={t('primaryStats.bmi')}
          value={bmi ? String(bmi) : notSet}
          unit={bmiCategory ? bmiCategoryLabels[bmiCategory] : undefined}
          unitColor={bmiCategory ? bmiColors[bmiCategory] : undefined}
        />
        {/* Calories — accent card; replaces Goal which is shown in the Hero badge */}
        <StatCard
          label={t('primaryStats.calories')}
          value={tdee ? String(tdee) : notSet}
          unit={tdee ? 'kcal' : undefined}
          accent
        />
        {/* Activity Level */}
        <StatCard
          label="Activity"
          value={activityLabels[activityLevel]}
          compact
        />
      </div>
    </motion.section>
  );
}
