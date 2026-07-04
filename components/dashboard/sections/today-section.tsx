'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { CalendarRange, Moon, Check, ChevronRight } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { SPLIT_ICON, SPLIT_COLOR, SPLIT_MUSCLE_MAP, type SplitType } from '@/lib/workouts/split-types';
import { SplitBadge } from '@/components/workouts/split-badge';
import type { MuscleId } from '@/components/workouts/muscle-map';
import type { ScheduleDayWithWorkout } from '@/lib/actions/schedules';
import { fadeUp } from '@/components/dashboard/ui/animations';
import { SectionHeader } from '@/components/dashboard/ui/section-header';
import { DashboardCard } from '@/components/dashboard/ui/dashboard-card';

// ── TodayWorkoutCard ───────────────────────────────────────────────────────────

function TodayWorkoutCard({ todayDay }: { todayDay: ScheduleDayWithWorkout | null }) {
  const t  = useTranslations('dashboard.todayWorkout');
  const tw = useTranslations('workouts');
  const tt = useTranslations('workoutStart.types');
  const tm = useTranslations('workouts.muscles');
  const router = useRouter();

  // ── No active schedule ──────────────────────────────────────────────────────
  if (!todayDay) {
    return (
      <DashboardCard accent>
        <button
          type="button"
          onClick={() => router.push('/workouts/program')}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(170,255,0,0.1)]">
            <CalendarRange size={20} color="#aaff00" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-[#f0f0f0]">{t('setupCta')}</p>
            <p className="mt-0.5 text-[11px] text-[#555555]">{t('setupHint')}</p>
          </div>
          <ChevronRight size={16} color="#aaff00" className="shrink-0 opacity-40" />
        </button>
      </DashboardCard>
    );
  }

  const day       = todayDay;
  const isRest    = day.day_type === 'rest';
  const Icon      = isRest ? Moon : SPLIT_ICON[day.day_type as SplitType];
  const color     = isRest ? '#666666' : SPLIT_COLOR[day.day_type as SplitType];
  const typeLabel = tt(`${day.day_type}.label` as Parameters<typeof tt>[0]);
  const workout   = day.workout;

  // Muscle groups from split map (empty for rest or custom with no canonical set)
  const muscles: MuscleId[] = isRest ? [] : SPLIT_MUSCLE_MAP[day.day_type as SplitType];

  // Duration badge — factual, colour-coded by length; avoids ability-level judgement
  const durationBadge = (() => {
    const min = workout?.estimated_duration_min ?? null;
    if (!min) return null;
    const c = min < 45 ? '#34d399' : min <= 75 ? '#fb923c' : '#f87171';
    return { label: `${min} min`, color: c };
  })();

  // ── Rest day ────────────────────────────────────────────────────────────────
  if (isRest) {
    return (
      <DashboardCard>
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
            <Moon size={20} color={color} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-bold text-[#777777]">{t('restDay')}</p>
            {day.completed && (
              <p className="mt-0.5 text-[11px] text-[#555555]">{t('completed')}</p>
            )}
          </div>
          {day.completed && (
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.1)]">
              <Check size={12} color="#aaff00" strokeWidth={2.5} />
            </span>
          )}
        </div>
      </DashboardCard>
    );
  }

  // ── Workout day ─────────────────────────────────────────────────────────────
  return (
    <DashboardCard>
      <div className="px-4 py-5">

        {/* Header: split icon + workout info */}
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{ background: `${color}1e` }}
          >
            <Icon size={20} color={color} />
          </div>

          <div className="min-w-0 flex-1">
            {/* Name + duration badge */}
            <div className="flex items-start justify-between gap-2">
              <p className="truncate text-[15px] font-black leading-tight text-[#f0f0f0]">
                {workout?.name ?? typeLabel}
              </p>
              <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
                {day.completed && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#aaff00]">
                    <Check size={11} color="#0a0a0a" strokeWidth={3} />
                  </span>
                )}
                {durationBadge && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
                    style={{ color: durationBadge.color, background: `${durationBadge.color}1e` }}
                  >
                    {durationBadge.label}
                  </span>
                )}
              </div>
            </div>

            {/* Split badge + exercise count */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <SplitBadge split={day.day_type} />
              {workout ? (
                <span className="text-[11px] text-[#555555]">
                  {tw('plan.exercises', { count: workout.exerciseCount })}
                </span>
              ) : (
                <span className="text-[11px]" style={{ color: `${color}cc` }}>
                  {t('noWorkout')} · {t('generateCta')} →
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Muscle chips — tinted with split accent colour */}
        {muscles.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {muscles.slice(0, 4).map(m => (
              <span
                key={m}
                className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                style={{
                  background: `${color}12`,
                  color:      `${color}bb`,
                  border:     `1px solid ${color}28`,
                }}
              >
                {tm(m as Parameters<typeof tm>[0])}
              </span>
            ))}
            {muscles.length > 4 && (
              <span className="self-center text-[10px] text-[#3a3a3a]">
                +{muscles.length - 4}
              </span>
            )}
          </div>
        )}

        {/* CTA row — active (not yet completed) workout only */}
        {workout && !day.completed && (
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/workouts/program')}
              className="flex-1 rounded-xl border border-[rgba(255,255,255,0.1)] py-3 text-[12px] font-semibold text-[#666666] transition-colors active:bg-[rgba(255,255,255,0.04)]"
            >
              {t('viewProgram')}
            </button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() =>
                router.push(
                  `/workouts/session?workoutId=${workout.id}&scheduleDay=${day.id}&split=${day.day_type}`
                )
              }
              className="flex-[2] rounded-xl bg-[#aaff00] py-3 text-[13px] font-bold text-[#0a0a0a]"
            >
              {t('startButton')}
            </motion.button>
          </div>
        )}

      </div>
    </DashboardCard>
  );
}

// ── TodaySection ───────────────────────────────────────────────────────────────

type TodaySectionProps = {
  todayDay: ScheduleDayWithWorkout | null;
};

export function TodaySection({ todayDay }: TodaySectionProps) {
  const t = useTranslations('dashboard');

  return (
    <motion.section {...fadeUp(0.05)} className="px-5">
      <SectionHeader label={t('todayWorkout.title')} />
      <TodayWorkoutCard todayDay={todayDay} />
    </motion.section>
  );
}
