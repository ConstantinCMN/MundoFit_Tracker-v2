'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { X, Zap, RotateCcw, ChevronLeft, Clock, Dumbbell } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { MuscleMap, type MuscleId, type BodyView } from './muscle-map';
import {
  getExercisesForMuscles,
  saveGeneratedWorkout,
  type GeneratedWorkoutPlan,
  type WorkoutExercisePlan,
} from '@/lib/actions/workouts';
import { cn } from '@/lib/utils/cn';

type Phase = 'select' | 'loading' | 'preview' | 'saving';

const ALL_MUSCLE_IDS: MuscleId[] = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'quads', 'calves',
  'traps', 'lats', 'lower_back', 'glutes', 'hamstrings',
];

const DIFFICULTY_DOT: Record<string, string> = {
  beginner:     'bg-emerald-400',
  intermediate: 'bg-amber-400',
  advanced:     'bg-red-400',
};

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ViewTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex-1 rounded-xl py-2.5 text-[13px] font-bold transition-colors',
        active ? 'text-[#0a0a0a]' : 'text-[#555555]'
      )}
    >
      {active && (
        <motion.div
          layoutId="view-pill"
          className="absolute inset-0 rounded-xl bg-[#aaff00]"
          transition={{ type: 'spring', stiffness: 400, damping: 36 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

function MuscleChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-1.5 rounded-full border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.08)] py-1.5 pl-3 pr-2"
    >
      <span className="text-[12px] font-semibold text-[#aaff00]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(170,255,0,0.15)]"
      >
        <X size={9} color="#aaff00" strokeWidth={2.5} />
      </button>
    </motion.div>
  );
}

function ExercisePlanCard({
  we,
  locale,
  muscleLabel,
}: {
  we: WorkoutExercisePlan;
  locale: string;
  muscleLabel: (id: string) => string;
}) {
  const name =
    locale === 'en' ? we.exercise.name_en
    : locale === 'es' ? we.exercise.name_es
    : we.exercise.name_ro;

  const setInfo = we.reps != null
    ? `${we.sets} × ${we.reps}`
    : `${we.sets} × ${we.duration_sec}s`;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
        {we.exercise.difficulty ? (
          <span className={cn('h-2.5 w-2.5 rounded-full', DIFFICULTY_DOT[we.exercise.difficulty])} />
        ) : (
          <Dumbbell size={14} className="text-[#444]" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-[#f0f0f0]">{name}</p>
        <div className="mt-0.5 flex flex-wrap gap-1">
          {we.exercise.muscle_groups.slice(0, 2).map(m => (
            <span key={m} className="text-[10px] font-semibold text-[#aaff00]/70">
              {muscleLabel(m)}
            </span>
          ))}
        </div>
      </div>
      <span className="shrink-0 text-[13px] font-black tabular-nums text-[#aaff00]">
        {setInfo}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GeneratorClient({ locale }: { locale: string }) {
  const t  = useTranslations('workouts');
  const tm = useTranslations('workouts.muscles');
  const router = useRouter();

  const [view,     setView]     = useState<BodyView>('front');
  const [selected, setSelected] = useState<Set<MuscleId>>(new Set());
  const [phase,    setPhase]    = useState<Phase>('select');
  const [plan,     setPlan]     = useState<GeneratedWorkoutPlan | null>(null);
  const [error,    setError]    = useState<string | null>(null);

  function toggleMuscle(id: MuscleId) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function clearAll() { setSelected(new Set()); }

  const muscleLabel = (id: string) => {
    try { return tm(id as Parameters<typeof tm>[0]); } catch { return id; }
  };

  const selectedList = ALL_MUSCLE_IDS.filter(id => selected.has(id));

  async function handleGenerate() {
    setPhase('loading');
    setError(null);
    const { data, error: err } = await getExercisesForMuscles(selectedList);
    if (err || !data) {
      setError(err ?? t('plan.errorMsg'));
      setPhase('select');
      return;
    }
    setPlan(data);
    setPhase('preview');
  }

  async function handleSave() {
    if (!plan) return;
    setPhase('saving');
    const { error: err } = await saveGeneratedWorkout(plan, locale);
    if (err) {
      setError(err);
      setPhase('preview');
      return;
    }
    router.push('/workouts/history');
  }

  const workoutName =
    locale === 'en' ? plan?.name_en
    : locale === 'es' ? plan?.name_es
    : plan?.name_ro;

  // ── Loading phase ────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#aaff00] border-t-transparent" />
        <p className="text-[13px] text-[#555]">{t('plan.generating')}</p>
      </div>
    );
  }

  // ── Preview / Saving phase ───────────────────────────────────────────────────

  if ((phase === 'preview' || phase === 'saving') && plan) {
    const isSaving = phase === 'saving';
    return (
      <motion.div
        key="preview"
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col pb-6"
      >
        {/* Header */}
        <div className="px-5 pt-5">
          <button
            type="button"
            onClick={() => setPhase('select')}
            disabled={isSaving}
            className="mb-3 flex items-center gap-1 text-[#555] disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            <span className="text-[12px] font-semibold">{t('plan.regenerate')}</span>
          </button>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
            MundoFit
          </p>
          <h2 className="text-[22px] font-black leading-tight text-[#f5f5f5]">{workoutName}</h2>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[12px] text-[#555]">
              {t('plan.exercises', { count: plan.exercises.length })}
            </span>
            <span className="text-[#333]">·</span>
            <span className="flex items-center gap-1 text-[12px] text-[#555]">
              <Clock size={11} />
              {t('plan.estimatedDuration', { min: plan.estimated_duration_min })}
            </span>
          </div>
        </div>

        {/* Exercise list */}
        <div className="mt-4 px-5 space-y-2">
          {plan.exercises.map(we => (
            <ExercisePlanCard
              key={we.exercise.id}
              we={we}
              locale={locale}
              muscleLabel={muscleLabel}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 px-5 text-center text-[12px] text-red-400">{error}</p>
        )}

        {/* CTAs */}
        <div className="mt-6 px-5 space-y-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#aaff00] py-4 text-[16px] font-black text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.2)] disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#0a0a0a] border-t-transparent" />
                {t('plan.saving')}
              </>
            ) : (
              <>
                <Zap size={17} />
                {t('plan.saveWorkout')}
              </>
            )}
          </motion.button>

          <button
            type="button"
            onClick={() => { setPhase('select'); setPlan(null); }}
            disabled={isSaving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-3.5 text-[14px] font-semibold text-[#555] disabled:opacity-40"
          >
            <RotateCcw size={13} />
            {t('plan.regenerate')}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Select phase ─────────────────────────────────────────────────────────────

  return (
    <motion.div
      key="select"
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col pb-6"
    >
      {/* Header */}
      <motion.div {...fadeUp(0)} className="px-5 pt-5">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          MundoFit
        </p>
        <h2 className="text-[22px] font-black text-[#f5f5f5]">{t('generator')}</h2>
        <p className="mt-1 text-[13px] text-[#555555]">{t('muscleMap.selectMuscles')}</p>
      </motion.div>

      {/* Front / Back toggle */}
      <motion.div {...fadeUp(0.06)} className="mt-5 px-5">
        <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-1">
          <ViewTab active={view === 'front'} label={t('bodyMap.front')} onClick={() => setView('front')} />
          <ViewTab active={view === 'back'}  label={t('bodyMap.back')}  onClick={() => setView('back')}  />
        </div>
      </motion.div>

      {/* Body map — anatomy untouched */}
      <motion.div {...fadeUp(0.1)} className="mt-6 flex justify-center px-5">
        <div className="w-full max-w-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: view === 'front' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: view === 'front' ? 20 : -20 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <MuscleMap view={view} selected={selected} onToggle={toggleMuscle} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Tap hint */}
      <motion.p {...fadeUp(0.14)} className="mt-3 text-center text-[11px] text-[#3a3a3a]">
        {t('muscleMap.tapHint')}
      </motion.p>

      {/* Selected chips */}
      <motion.div {...fadeUp(0.18)} className="mt-5 px-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('muscleMap.selectMuscles')}
          </p>
          {selectedList.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#555555] hover:text-[#aaff00]"
            >
              <RotateCcw size={10} />
              {t('muscleMap.clearAll')}
            </button>
          )}
        </div>

        <div className="min-h-[40px] rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3 py-2">
          {selectedList.length === 0 ? (
            <p className="py-1 text-center text-[12px] text-[#333333]">
              {t('muscleMap.noneSelected')}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {selectedList.map(id => (
                  <MuscleChip
                    key={id}
                    label={muscleLabel(id)}
                    onRemove={() => toggleMuscle(id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <p className="mt-3 px-5 text-center text-[12px] text-red-400">{error}</p>
      )}

      {/* Generate CTA */}
      <motion.div {...fadeUp(0.22)} className="mt-6 px-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleGenerate}
          disabled={selectedList.length === 0}
          className={cn(
            'flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[16px] font-black transition-all',
            selectedList.length > 0
              ? 'bg-[#aaff00] text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.25)]'
              : 'border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] text-[#333333]'
          )}
        >
          <Zap
            size={18}
            className={selectedList.length > 0 ? 'text-[#0a0a0a]' : 'text-[#333333]'}
          />
          {t('muscleMap.generate')}
          {selectedList.length > 0 && (
            <span className="ml-1 rounded-full bg-[rgba(0,0,0,0.15)] px-2 py-0.5 text-[11px] font-black">
              {selectedList.length}
            </span>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
