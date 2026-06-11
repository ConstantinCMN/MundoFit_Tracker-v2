'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Scale, Activity, Dumbbell, Flame } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import {
  calculateBMI,
  calculateTDEE,
  getBMICategory,
  type BMICategory,
} from '@/lib/utils/fitness';
import type { Profile, Goal, ActivityLevel, Gender } from '@/types';

// ── Animation helper ──────────────────────────────────────────────────────────

function fadeUp(delay: number) {
  return {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────

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
    <div
      className={cn(
        'rounded-2xl border px-4 py-4',
        accent
          ? 'border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.07)]'
          : 'border-[#1e1e1e] bg-[#111111]'
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
        {label}
      </p>
      <p
        className={cn(
          'font-bold leading-tight tabular-nums',
          compact ? 'text-[15px]' : 'text-[22px] leading-none',
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
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient({
  profile,
  hour,
  dateStr,
}: {
  profile: Profile;
  hour: number;
  dateStr: string;
}) {
  const t = useTranslations('dashboard');
  const router = useRouter();

  // Greeting
  const greetingKey: 'morning' | 'afternoon' | 'evening' =
    hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const greetingLabels: Record<'morning' | 'afternoon' | 'evening', string> = {
    morning: t('greeting.morning'),
    afternoon: t('greeting.afternoon'),
    evening: t('greeting.evening'),
  };

  // Profile values
  const weight = profile.weight_kg ?? 0;
  const height = profile.height_cm ?? 0;
  const age = profile.age ?? 0;
  const gender = (profile.gender ?? 'male') as Gender;
  const activityLevel = (profile.activity_level ?? 'sedentary') as ActivityLevel;
  const goal = profile.goal as Goal | null;

  // Fitness calculations
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

  const idealWeight =
    height > 0 ? parseFloat((22 * Math.pow(height / 100, 2)).toFixed(1)) : null;

  const weightDiff =
    idealWeight !== null && weight > 0
      ? parseFloat((weight - idealWeight).toFixed(1))
      : null;

  // Label lookup tables (static keys for next-intl type safety)
  const bmiCategoryLabels: Record<BMICategory, string> = {
    underweight: t('bmiLabel.underweight'),
    normal: t('bmiLabel.normal'),
    overweight: t('bmiLabel.overweight'),
    obese: t('bmiLabel.obese'),
  };

  const goalLabels: Record<Goal, string> = {
    lose_weight: t('goalLabel.loseWeight'),
    build_muscle: t('goalLabel.buildMuscle'),
    improve_endurance: t('goalLabel.improveEndurance'),
    stay_healthy: t('goalLabel.stayHealthy'),
    athletic_performance: t('goalLabel.athleticPerformance'),
  };

  const motivationalMessages: Record<Goal, string> = {
    lose_weight: t('hero.motivational.loseWeight'),
    build_muscle: t('hero.motivational.buildMuscle'),
    improve_endurance: t('hero.motivational.improveEndurance'),
    stay_healthy: t('hero.motivational.stayHealthy'),
    athletic_performance: t('hero.motivational.athleticPerformance'),
  };

  const recommendations: Record<Goal, string> = {
    lose_weight: t('recommendation.loseWeight'),
    build_muscle: t('recommendation.buildMuscle'),
    improve_endurance: t('recommendation.improveEndurance'),
    stay_healthy: t('recommendation.stayHealthy'),
    athletic_performance: t('recommendation.athleticPerformance'),
  };

  // BMI colors
  const bmiColors: Record<BMICategory, string> = {
    underweight: '#60a5fa',
    normal: '#aaff00',
    overweight: '#fbbf24',
    obese: '#f87171',
  };

  // Goal icons
  const goalIcons: Record<Goal, string> = {
    lose_weight: '🔥',
    build_muscle: '💪',
    improve_endurance: '🫀',
    stay_healthy: '💚',
    athletic_performance: '🏆',
  };

  // Quick actions
  const quickActions = [
    { key: 'updateWeight', Icon: Scale, color: '#aaff00', path: '/weight' },
    { key: 'viewProgress', Icon: Activity, color: '#60a5fa', path: '/measurements' },
    { key: 'startWorkout', Icon: Dumbbell, color: '#c084fc', path: '/workouts' },
    { key: 'nutrition', Icon: Flame, color: '#fb923c', path: '/calories' },
  ] as const;

  const notSet = t('primaryStats.notSet');

  // Weight diff display
  const diffAbs = weightDiff !== null ? Math.abs(weightDiff) : null;
  const weightDiffColor =
    diffAbs === null
      ? '#333333'
      : diffAbs < 1
      ? '#aaff00'
      : diffAbs < 5
      ? '#fbbf24'
      : '#f87171';

  const weightDiffLabel =
    weightDiff === null
      ? null
      : Math.abs(weightDiff) < 0.1
      ? t('progress.weightIdeal')
      : weightDiff > 0
      ? t('progress.weightAbove', { diff: String(Math.abs(weightDiff)) })
      : t('progress.weightBelow', { diff: String(Math.abs(weightDiff)) });

  return (
    <div className="px-5 pb-10 pt-4">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <div className="mb-4 flex items-center gap-4">
          {/* Avatar */}
          <div className="flex h-[56px] w-[56px] shrink-0 items-center justify-center rounded-full border-2 border-[rgba(170,255,0,0.35)] bg-[rgba(170,255,0,0.1)] shadow-[0_0_20px_rgba(170,255,0,0.1)]">
            <span className="text-[22px] font-bold text-[#aaff00]">
              {(profile.first_name ?? '?').charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="min-w-0">
            {/* Date — server-computed, no hydration risk */}
            <p className="mb-0.5 text-[12px] font-medium text-[#555555]">{dateStr}</p>
            <h1 className="text-[20px] font-bold leading-snug text-[#f5f5f5]">
              {greetingLabels[greetingKey]}, {profile.first_name ?? ''} 👋
            </h1>
          </div>
        </div>

        {/* Motivational banner */}
        {goal && (
          <div className="rounded-2xl border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.05)] px-4 py-3">
            <p className="text-[13px] font-medium leading-relaxed text-[#aaff00]/90">
              {motivationalMessages[goal]}
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Primary Stats ─────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.07)} className="mb-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
          {t('primaryStats.title')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label={t('primaryStats.calories')}
            value={tdee ? String(tdee) : notSet}
            unit={tdee ? 'kcal' : undefined}
            accent
          />
          <StatCard
            label={t('primaryStats.weight')}
            value={weight > 0 ? String(weight) : notSet}
            unit={weight > 0 ? 'kg' : undefined}
          />
          <StatCard
            label={t('primaryStats.bmi')}
            value={bmi ? String(bmi) : notSet}
            unit={bmiCategory ? bmiCategoryLabels[bmiCategory] : undefined}
            unitColor={bmiCategory ? bmiColors[bmiCategory] : undefined}
          />
          <StatCard
            label={t('primaryStats.goal')}
            value={goal ? goalLabels[goal] : notSet}
            compact
          />
        </div>
      </motion.div>

      {/* ── Progress ──────────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.14)} className="mb-8">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
          {t('progress.title')}
        </p>
        <div className="flex flex-col gap-3">
          {/* Goal card */}
          {goal && (
            <div className="flex items-center gap-4 rounded-2xl border border-[#1e1e1e] bg-[#111111] px-5 py-4">
              <span className="text-[32px] leading-none">{goalIcons[goal]}</span>
              <div>
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                  {t('progress.yourGoal')}
                </p>
                <p className="text-[16px] font-bold text-[#f5f5f5]">{goalLabels[goal]}</p>
              </div>
            </div>
          )}

          {/* BMI status + Weight vs ideal */}
          <div className="grid grid-cols-2 gap-3">
            {/* BMI */}
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#111111] px-4 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                {t('progress.bmiStatus')}
              </p>
              {bmi && bmiCategory ? (
                <>
                  <p
                    className="text-[22px] font-bold leading-none tabular-nums"
                    style={{ color: bmiColors[bmiCategory] }}
                  >
                    {String(bmi)}
                  </p>
                  <p
                    className="mt-1.5 text-[11px] font-semibold"
                    style={{ color: bmiColors[bmiCategory] }}
                  >
                    {bmiCategoryLabels[bmiCategory]}
                  </p>
                </>
              ) : (
                <p className="text-[22px] font-bold leading-none text-[#333333]">—</p>
              )}
            </div>

            {/* Weight vs ideal */}
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#111111] px-4 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                {t('progress.idealWeight')}
              </p>
              {weightDiff !== null ? (
                <>
                  <p
                    className="text-[22px] font-bold leading-none tabular-nums"
                    style={{ color: weightDiffColor }}
                  >
                    {Math.abs(weightDiff) < 0.1
                      ? '✓'
                      : weightDiff > 0
                      ? `+${String(weightDiff)}`
                      : String(weightDiff)}{' '}
                    {Math.abs(weightDiff) >= 0.1 && (
                      <span className="text-[14px] font-medium">kg</span>
                    )}
                  </p>
                  <p className="mt-1.5 text-[11px] text-[#555555]">{weightDiffLabel}</p>
                </>
              ) : (
                <p className="text-[22px] font-bold leading-none text-[#333333]">—</p>
              )}
            </div>
          </div>

          {/* Recommendation */}
          {goal && (
            <div className="rounded-2xl border border-[#1e1e1e] bg-[#111111] px-5 py-4">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                {t('progress.recommendation')}
              </p>
              <p className="text-[13px] leading-relaxed text-[#888888]">
                {recommendations[goal]}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
      <motion.div {...fadeUp(0.21)}>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
          {t('actions.title')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ key, Icon, color, path }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push(path)}
              className="flex items-center gap-3 rounded-2xl border border-[#1e1e1e] bg-[#111111] px-4 py-4 text-left transition-colors hover:border-[#2a2a2a] hover:bg-[#161616]"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${color}22` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-[13px] font-semibold leading-tight text-[#cccccc]">
                {t(`actions.${key}`)}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
