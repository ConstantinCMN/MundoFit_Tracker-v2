'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Zap, BookOpen, TrendingUp } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { MuscleMap, type MuscleId, type BodyView } from '@/components/workouts/muscle-map';

// Which view best shows each muscle
const MUSCLE_PRIMARY_VIEW: Record<MuscleId, BodyView> = {
  chest:      'front',
  shoulders:  'front',
  biceps:     'front',
  triceps:    'back',
  forearms:   'front',
  abs:        'front',
  quads:      'front',
  calves:     'back',
  traps:      'back',
  lats:       'back',
  lower_back: 'back',
  glutes:     'back',
  hamstrings: 'back',
};

// Body region grouping — drives the badge label
const MUSCLE_REGION: Record<MuscleId, 'push' | 'pull' | 'core' | 'legs'> = {
  chest:      'push',
  shoulders:  'push',
  triceps:    'push',
  biceps:     'pull',
  forearms:   'pull',
  traps:      'pull',
  lats:       'pull',
  lower_back: 'pull',
  abs:        'core',
  quads:      'legs',
  hamstrings: 'legs',
  glutes:     'legs',
  calves:     'legs',
};

function fadeUp(delay = 0) {
  return {
    initial:    { opacity: 0, y: 14 },
    animate:    { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

type Props = { muscle: MuscleId };

export function MuscleDetailClient({ muscle }: Props) {
  const tm = useTranslations('workouts.muscles');
  const tb = useTranslations('body');

  const view        = MUSCLE_PRIMARY_VIEW[muscle];
  const region      = MUSCLE_REGION[muscle];
  const selectedSet = useMemo(() => new Set<MuscleId>([muscle]), [muscle]);

  const muscleName = (() => {
    try { return tm(muscle as Parameters<typeof tm>[0]); } catch { return muscle; }
  })();

  const description = (() => {
    try { return tb(`muscleDesc.${muscle}` as Parameters<typeof tb>[0]); } catch { return ''; }
  })();

  const regionLabel = (() => {
    try { return tb(`region.${region}` as Parameters<typeof tb>[0]); } catch { return region; }
  })();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col pb-8"
    >
      {/* Muscle name + region badge */}
      <motion.div {...fadeUp(0)} className="px-5 pt-5">
        <span className="inline-flex items-center rounded-full border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.06)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#aaff00]/70">
          {regionLabel}
        </span>
        <h2 className="mt-2 text-[28px] font-black leading-tight text-[#f5f5f5]">{muscleName}</h2>
        {description && (
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#555555]">{description}</p>
        )}
      </motion.div>

      {/* Body map — this muscle highlighted, read-only */}
      <motion.div {...fadeUp(0.08)} className="mt-4 flex justify-center px-5">
        <div className="w-full max-w-[240px]">
          <MuscleMap view={view} selected={selectedSet} onToggle={() => {}} />
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div {...fadeUp(0.16)} className="mt-6 space-y-3 px-5">
        {/* Generate Workout — active */}
        <Link
          href={`/workouts/generator?muscles=${muscle}`}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#aaff00] py-4 text-[16px] font-black text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.2)]"
        >
          <Zap size={17} />
          {tb('generateWorkout')}
        </Link>

        {/* Browse Exercises — routes to library (Phase 2 will make this muscle-scoped) */}
        <Link
          href="/workouts/library"
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-3.5 text-[14px] font-semibold text-[#888888]"
        >
          <BookOpen size={15} />
          {tb('browseExercises')}
        </Link>

        {/* View Progress — Phase 3 placeholder */}
        <div className="relative flex w-full items-center justify-center gap-2.5 rounded-2xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] py-3.5 text-[14px] font-semibold text-[#333333]">
          <TrendingUp size={15} />
          {tb('viewProgress')}
          <span className="absolute right-4 rounded-full bg-[rgba(255,255,255,0.06)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-[#444444]">
            {tb('comingSoon')}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
