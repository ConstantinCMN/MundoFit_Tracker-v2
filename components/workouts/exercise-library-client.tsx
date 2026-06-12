'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Dumbbell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Exercise } from '@/lib/actions/exercises';
import { ExerciseDetailSheet } from './exercise-detail-sheet';
import { cn } from '@/lib/utils/cn';

type Props = {
  exercises: Exercise[];
  locale: string;
};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.38, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

const MUSCLE_FILTERS = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'quads', 'hamstrings', 'glutes', 'calves',
  'lats', 'traps', 'lower_back',
] as const;

const DIFFICULTY_FILTERS = ['beginner', 'intermediate', 'advanced'] as const;

const DIFFICULTY_DOT: Record<string, string> = {
  beginner:     'bg-emerald-400',
  intermediate: 'bg-amber-400',
  advanced:     'bg-red-400',
};

export function ExerciseLibraryClient({ exercises, locale }: Props) {
  const t  = useTranslations('workouts.exerciseLibrary');
  const tm = useTranslations('workouts.muscles');

  const [search,     setSearch]     = useState('');
  const [muscle,     setMuscle]     = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [location,   setLocation]   = useState<string | null>(null);
  const [selected,   setSelected]   = useState<Exercise | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return exercises.filter(ex => {
      if (q) {
        const ro = ex.name_ro.toLowerCase();
        const en = ex.name_en.toLowerCase();
        const es = ex.name_es.toLowerCase();
        if (!ro.includes(q) && !en.includes(q) && !es.includes(q)) return false;
      }
      if (muscle && !ex.muscle_groups.includes(muscle)) return false;
      if (difficulty && ex.difficulty !== difficulty) return false;
      if (location && location !== 'both') {
        if (ex.location !== location && ex.location !== 'both') return false;
      }
      return true;
    });
  }, [exercises, search, muscle, difficulty, location]);

  const getName = (ex: Exercise) =>
    locale === 'en' ? ex.name_en : locale === 'es' ? ex.name_es : ex.name_ro;

  const muscleLabel = (id: string) => {
    try { return tm(id as Parameters<typeof tm>[0]); } catch { return id; }
  };

  return (
    <>
      <div className="flex flex-col pb-6">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="px-5 pt-5">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
            MundoFit
          </p>
          <h2 className="text-[22px] font-black text-[#f5f5f5]">{t('title')}</h2>
          <p className="mt-1 text-[13px] text-[#555555]">
            {t('exerciseCount', { count: filtered.length })}
          </p>
        </motion.div>

        {/* Search */}
        <motion.div {...fadeUp(0.05)} className="mt-4 px-5">
          <div className="flex items-center gap-2.5 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.04)] px-4 py-3">
            <Search size={15} className="shrink-0 text-[#555]" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 bg-transparent text-[14px] text-[#f5f5f5] placeholder-[#444] outline-none"
            />
          </div>
        </motion.div>

        {/* Difficulty filter */}
        <motion.div {...fadeUp(0.08)} className="mt-3 px-5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <FilterChip
              active={difficulty === null}
              onClick={() => setDifficulty(null)}
              label={t('filterAll')}
            />
            {DIFFICULTY_FILTERS.map(d => (
              <FilterChip
                key={d}
                active={difficulty === d}
                onClick={() => setDifficulty(difficulty === d ? null : d)}
                label={t(`difficulty.${d}` as Parameters<typeof t>[0])}
                dot={DIFFICULTY_DOT[d]}
              />
            ))}
            <FilterChip
              active={location === 'gym'}
              onClick={() => setLocation(location === 'gym' ? null : 'gym')}
              label={t('location.gym')}
            />
            <FilterChip
              active={location === 'home'}
              onClick={() => setLocation(location === 'home' ? null : 'home')}
              label={t('location.home')}
            />
          </div>
        </motion.div>

        {/* Muscle filter */}
        <motion.div {...fadeUp(0.1)} className="mt-2 px-5">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <FilterChip
              active={muscle === null}
              onClick={() => setMuscle(null)}
              label={t('filterAll')}
              small
            />
            {MUSCLE_FILTERS.map(m => (
              <FilterChip
                key={m}
                active={muscle === m}
                onClick={() => setMuscle(muscle === m ? null : m)}
                label={muscleLabel(m)}
                small
              />
            ))}
          </div>
        </motion.div>

        {/* Exercise list */}
        <motion.div {...fadeUp(0.13)} className="mt-4 px-5 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] py-12 text-center">
              <Dumbbell size={28} className="text-[#333]" />
              <div>
                <p className="text-[14px] font-semibold text-[#555]">{t('noResults')}</p>
                <p className="mt-1 text-[12px] text-[#333]">{t('noResultsHint')}</p>
              </div>
            </div>
          ) : (
            filtered.map((ex, i) => (
              <ExerciseCard
                key={ex.id}
                exercise={ex}
                name={getName(ex)}
                muscleLabel={muscleLabel}
                delay={Math.min(i * 0.025, 0.3)}
                onClick={() => setSelected(ex)}
                t={t}
              />
            ))
          )}
        </motion.div>
      </div>

      <ExerciseDetailSheet
        exercise={selected}
        locale={locale}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function FilterChip({
  active,
  onClick,
  label,
  dot,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  dot?: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 rounded-full border font-semibold transition-all',
        small ? 'px-3 py-1 text-[11px]' : 'px-3.5 py-1.5 text-[12px]',
        active
          ? 'border-[#aaff00] bg-[#aaff00] text-[#0a0a0a]'
          : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#888]'
      )}
    >
      <span className="flex items-center gap-1.5">
        {dot && (
          <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
        )}
        {label}
      </span>
    </button>
  );
}

function ExerciseCard({
  exercise,
  name,
  muscleLabel,
  delay,
  onClick,
  t,
}: {
  exercise: Exercise;
  name: string;
  muscleLabel: (id: string) => string;
  delay: number;
  onClick: () => void;
  t: ReturnType<typeof useTranslations<'workouts.exerciseLibrary'>>;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay }}
      className="flex w-full items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 text-left transition-colors active:bg-[rgba(255,255,255,0.05)]"
    >
      {/* Difficulty dot */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
        {exercise.difficulty ? (
          <span className={cn('h-2.5 w-2.5 rounded-full', DIFFICULTY_DOT[exercise.difficulty])} />
        ) : (
          <Dumbbell size={14} className="text-[#444]" />
        )}
      </div>

      {/* Name + muscles */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-[#f0f0f0]">{name}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {exercise.muscle_groups.slice(0, 3).map(m => (
            <span
              key={m}
              className="text-[10px] font-semibold text-[#aaff00]/70"
            >
              {muscleLabel(m)}
            </span>
          ))}
          {exercise.is_custom && (
            <span className="text-[10px] font-semibold text-[#666]">
              · {t('customBadge')}
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={14} className="shrink-0 text-[#444]" />
    </motion.button>
  );
}
