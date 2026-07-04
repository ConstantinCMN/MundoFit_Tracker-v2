'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Flame } from 'lucide-react';
import type { Profile, Goal } from '@/types';
import { fadeUp } from '@/components/dashboard/ui/animations';

const GOAL_ICONS: Record<Goal, string> = {
  lose_weight:          '🔥',
  build_muscle:         '💪',
  improve_endurance:    '🫀',
  stay_healthy:         '💚',
  athletic_performance: '🏆',
};

const GOAL_LABEL_KEY: Record<Goal, string> = {
  lose_weight:          'loseWeight',
  build_muscle:         'buildMuscle',
  improve_endurance:    'improveEndurance',
  stay_healthy:         'stayHealthy',
  athletic_performance: 'athleticPerformance',
};

type HeroSectionProps = {
  profile: Profile;
  hour: number;
  dateStr: string;
};

export function HeroSection({ profile, hour, dateStr }: HeroSectionProps) {
  const t = useTranslations('dashboard');

  const greetingKey: 'morning' | 'afternoon' | 'evening' =
    hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const greetings = {
    morning:   t('greeting.morning'),
    afternoon: t('greeting.afternoon'),
    evening:   t('greeting.evening'),
  };

  const goal = profile.goal as Goal | null;

  const motivationalMessages: Record<Goal, string> = {
    lose_weight:          t('hero.motivational.loseWeight'),
    build_muscle:         t('hero.motivational.buildMuscle'),
    improve_endurance:    t('hero.motivational.improveEndurance'),
    stay_healthy:         t('hero.motivational.stayHealthy'),
    athletic_performance: t('hero.motivational.athleticPerformance'),
  };

  return (
    <section className="px-5 pt-6">

      {/* Avatar + greeting */}
      <motion.div {...fadeUp(0)} className="mb-5 flex items-center gap-4">

        {/* Avatar — outer glow extends beyond the ring */}
        <div className="relative shrink-0">
          <div className="absolute -inset-2 rounded-full bg-[#aaff00] opacity-[0.12] blur-xl" />
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[rgba(170,255,0,0.35)] bg-[rgba(170,255,0,0.08)]"
            style={{ boxShadow: '0 0 24px rgba(170,255,0,0.14)' }}
          >
            <span className="text-[23px] font-black leading-none text-[#aaff00]">
              {(profile.first_name ?? '?').charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Greeting */}
        <div className="min-w-0">
          <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
            {dateStr}
          </p>
          <h1 className="text-[22px] font-black leading-tight tracking-tight text-[#f5f5f5]">
            {greetings[greetingKey]}
            {profile.first_name && (
              <>, <span className="text-[#aaff00]">{profile.first_name}</span></>
            )}
            {' '}👋
          </h1>
        </div>
      </motion.div>

      {/* Badge pills — streak first, then goal */}
      <motion.div {...fadeUp(0.10)} className="mb-4 flex flex-wrap gap-2">

        {/* Streak — placeholder until workout_sessions data available */}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[11px]">
          <Flame size={11} color="#fb923c" />
          <span className="font-black tabular-nums text-[#fb923c]">—</span>
          <span className="font-semibold text-[#555555]">day streak</span>
        </span>

        {/* Goal */}
        {goal && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.06)] px-3 py-1 text-[11px] font-bold text-[#aaff00]/75">
            {GOAL_ICONS[goal]}
            {t(`goalLabel.${GOAL_LABEL_KEY[goal]}` as Parameters<typeof t>[0])}
          </span>
        )}
      </motion.div>

      {/* Motivational banner */}
      {goal && (
        <motion.div
          {...fadeUp(0.20)}
          className="overflow-hidden rounded-2xl border border-[rgba(170,255,0,0.12)] bg-[rgba(170,255,0,0.03)] backdrop-blur-sm"
        >
          <div className="flex items-start gap-3 px-4 py-3.5">
            <span className="mt-0.5 shrink-0 text-[17px] leading-none">{GOAL_ICONS[goal]}</span>
            <p className="text-[12.5px] font-medium leading-relaxed text-[#aaff00]/65">
              {motivationalMessages[goal]}
            </p>
          </div>
        </motion.div>
      )}

    </section>
  );
}
