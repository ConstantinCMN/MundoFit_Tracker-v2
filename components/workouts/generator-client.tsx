'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  X, Zap, RotateCcw, ChevronLeft, Clock, Dumbbell,
  Pause, Play, SkipForward, CheckCircle,
} from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { MuscleMap, type MuscleId, type BodyView } from './muscle-map';
import { useMuscleSelection } from './muscle-selection-context';
import {
  getExercisesForMuscles,
  saveGeneratedWorkout,
  type GeneratedWorkoutPlan,
  type WorkoutExercisePlan,
} from '@/lib/actions/workouts';
import { cn } from '@/lib/utils/cn';
import { Toast } from '@/components/ui/toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase      = 'select' | 'loading' | 'preview' | 'executing';
type ExecMode   = 'active' | 'rest' | 'complete';
type SaveStatus = 'idle' | 'saving' | 'error';
type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

// ── Constants ─────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

function exerciseName(we: WorkoutExercisePlan, locale: string): string {
  return locale === 'en' ? we.exercise.name_en
       : locale === 'es' ? we.exercise.name_es
       : we.exercise.name_ro;
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
  const name = exerciseName(we, locale);
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

  // ── Generator state ───────────────────────────────────────────────────────
  const [view,  setView]  = useState<BodyView>('front');
  const [phase, setPhase] = useState<Phase>('select');
  const [plan,  setPlan]  = useState<GeneratedWorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  // ── Execution state ───────────────────────────────────────────────────────
  const [exIdx,      setExIdx]      = useState(0);
  const [setNum,     setSetNum]     = useState(1);
  const [mode,       setMode]       = useState<ExecMode>('active');
  const [seconds,    setSeconds]    = useState(0);
  const [paused,     setPaused]     = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError,  setSaveError]  = useState<string | null>(null);

  // ── Timing refs — read only at save time, never drive renders ─────────────
  const startedAtRef     = useRef<Date | null>(null);
  const pauseStartRef    = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);

  const { selected, toggleMuscle, clearAll } = useMuscleSelection();

  const muscleLabel = (id: string) => {
    try { return tm(id as Parameters<typeof tm>[0]); } catch { return id; }
  };

  const selectedList = ALL_MUSCLE_IDS.filter(id => selected.has(id));

  // ── Effects ───────────────────────────────────────────────────────────────

  // Rest countdown: one setTimeout per tick — self-cancels on every dep change
  useEffect(() => {
    if (phase !== 'executing' || mode !== 'rest' || paused || seconds <= 0) return;
    const id = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, mode, seconds, paused]);

  // Auto-advance when rest countdown reaches zero
  useEffect(() => {
    if (phase !== 'executing' || mode !== 'rest' || seconds !== 0 || paused || !plan) return;
    const ex = plan.exercises[exIdx];
    if (setNum < ex.sets) {
      setSetNum(s => s + 1);
      setMode('active');
    } else if (exIdx < plan.exercises.length - 1) {
      setExIdx(i => i + 1);
      setSetNum(1);
      setMode('active');
    } else {
      setMode('complete');
    }
  }, [phase, mode, seconds, paused, plan, exIdx, setNum]);

  // Auto-save on completion — Retry resets saveStatus to 'idle' to re-trigger
  useEffect(() => {
    if (phase !== 'executing' || mode !== 'complete' || saveStatus !== 'idle') return;
    if (!plan || !startedAtRef.current) {
      setSaveStatus('error');
      setSaveError('No workout data');
      return;
    }

    setSaveStatus('saving');
    setSaveError(null);

    const endedAt = new Date();
    const durationSec = Math.max(
      1,
      Math.round(
        (endedAt.getTime() - startedAtRef.current.getTime() - totalPausedMsRef.current) / 1000
      )
    );

    saveGeneratedWorkout(plan, locale, startedAtRef.current, durationSec).then(({ error: err }) => {
      if (err) {
        setSaveStatus('error');
        setSaveError(err);
      } else {
        setToast({ message: t('timer.saved'), variant: 'success', id: Date.now() });
        router.push('/workouts/history');
      }
    });
  // plan and locale are stable during execution; t and router are stable references
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, mode, saveStatus]);

  // ── Generator handlers ────────────────────────────────────────────────────

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

  // ── Execution handlers ────────────────────────────────────────────────────

  function handleStartWorkout() {
    startedAtRef.current = new Date();
    pauseStartRef.current = null;
    totalPausedMsRef.current = 0;
    setExIdx(0);
    setSetNum(1);
    setMode('active');
    setSeconds(0);
    setPaused(false);
    setSaveStatus('idle');
    setSaveError(null);
    setPhase('executing');
  }

  function completeSet() {
    if (!plan) return;
    setSeconds(plan.exercises[exIdx].rest_sec);
    setMode('rest');
  }

  // Shared advance logic — also the pattern Sprint 10.2 Skip Exercise will use
  function advanceNow(currentExIdx: number, currentSetNum: number) {
    if (!plan) return;
    const ex = plan.exercises[currentExIdx];
    setSeconds(0);
    if (currentSetNum < ex.sets) {
      setSetNum(currentSetNum + 1);
      setMode('active');
    } else if (currentExIdx < plan.exercises.length - 1) {
      setExIdx(currentExIdx + 1);
      setSetNum(1);
      setMode('active');
    } else {
      setMode('complete');
    }
  }

  function skipRest() {
    advanceNow(exIdx, setNum);
  }

  function handlePause() {
    pauseStartRef.current = Date.now();
    setPaused(true);
  }

  function handleResume() {
    if (pauseStartRef.current !== null) {
      totalPausedMsRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = null;
    }
    setPaused(false);
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const workoutName =
    locale === 'en' ? plan?.name_en
    : locale === 'es' ? plan?.name_es
    : plan?.name_ro;

  // ── Loading phase ─────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#aaff00] border-t-transparent" />
        <p className="text-[13px] text-[#555]">{t('plan.generating')}</p>
      </div>
    );
  }

  // ── Executing phase ───────────────────────────────────────────────────────

  if (phase === 'executing' && plan) {
    const ex       = plan.exercises[exIdx];
    const exName   = exerciseName(ex, locale);
    const nextEx   = exIdx < plan.exercises.length - 1 ? plan.exercises[exIdx + 1] : null;
    const nextName = nextEx ? exerciseName(nextEx, locale) : null;
    const setInfo  = ex.reps != null
      ? `${ex.sets} × ${ex.reps}`
      : `${ex.sets} × ${ex.duration_sec}s`;

    return (
      <div className="flex min-h-[calc(100vh-140px)] flex-col px-5 pb-8 pt-5">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setPhase('preview')}
            disabled={mode === 'complete'}
            className="flex items-center gap-1 text-[#555] disabled:pointer-events-none disabled:opacity-0"
          >
            <ChevronLeft size={14} />
            <span className="text-[12px] font-semibold">{t('plan.regenerate')}</span>
          </button>

          {mode !== 'complete' && (
            paused ? (
              <motion.button
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={handleResume}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.1)] text-[#aaff00]"
              >
                <Play size={15} />
              </motion.button>
            ) : (
              <button
                type="button"
                onClick={handlePause}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] text-[#555]"
              >
                <Pause size={15} />
              </button>
            )
          )}
        </div>

        {/* ── Complete state ───────────────────────────────────────────────── */}
        {mode === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-1 flex-col items-center justify-center gap-6 text-center"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.08)]">
              <CheckCircle size={38} className="text-[#aaff00]" />
            </div>

            <div>
              <h2 className="text-[24px] font-black text-[#f5f5f5]">{t('timer.complete')}</h2>
              <p className="mt-1.5 text-[13px] text-[#555]">{workoutName}</p>
            </div>

            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-[#555]">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#555] border-t-transparent" />
                <span className="text-[13px]">{t('timer.saving')}</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-[13px] text-red-400">{saveError ?? t('timer.saveError')}</p>
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSaveStatus('idle')}
                  className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-[13px] font-bold text-red-400"
                >
                  <RotateCcw size={13} />
                  {t('timer.retry')}
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── Active / Rest state ──────────────────────────────────────────── */}
        {mode !== 'complete' && (
          <>
            {/* Progress label */}
            <p className="mb-5 text-center text-[11px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
              {t('timer.exerciseOf', { current: exIdx + 1, total: plan.exercises.length })}
            </p>

            {/* Exercise card */}
            <div className="mb-5 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.04)]">
                  {ex.exercise.difficulty ? (
                    <span className={cn('h-2.5 w-2.5 rounded-full', DIFFICULTY_DOT[ex.exercise.difficulty])} />
                  ) : (
                    <Dumbbell size={14} className="text-[#444]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[16px] font-black text-[#f5f5f5]">{exName}</p>
                  <div className="mt-0.5 flex gap-2">
                    {ex.exercise.muscle_groups.slice(0, 2).map(m => (
                      <span key={m} className="text-[10px] font-semibold text-[#aaff00]/70">
                        {muscleLabel(m)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active body */}
            <AnimatePresence mode="wait">
              {mode === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-1 flex-col"
                >
                  <p className="mb-3 text-center text-[12px] font-semibold text-[#555]">
                    {t('timer.setOf', { current: setNum, total: ex.sets })}
                  </p>
                  <div className="mb-6 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] py-5 text-center">
                    <span className="text-[32px] font-black tabular-nums text-[#aaff00]">{setInfo}</span>
                  </div>

                  <div className="mt-auto">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={completeSet}
                      disabled={paused}
                      className="flex w-full items-center justify-center rounded-2xl bg-[#aaff00] py-4 text-[16px] font-black text-[#0a0a0a] shadow-[0_0_20px_rgba(170,255,0,0.18)] disabled:opacity-50"
                    >
                      {t('timer.doneSet')}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Rest body */}
              {mode === 'rest' && (
                <motion.div
                  key="rest"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-1 flex-col items-center"
                >
                  <p className="mb-5 text-[12px] font-semibold uppercase tracking-widest text-[#555]">
                    {t('timer.rest')}
                  </p>
                  <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.05)]">
                    <span className="text-[44px] font-black tabular-nums leading-none text-[#aaff00]">
                      {paused ? '—' : seconds}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={skipRest}
                    className="flex items-center gap-1.5 rounded-xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] px-4 py-2.5 text-[12px] font-semibold text-[#555]"
                  >
                    <SkipForward size={12} />
                    {t('timer.skip')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Up next hint */}
            {nextName && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
                  {t('timer.upNext')}
                </span>
                <span className="truncate text-[12px] font-semibold text-[#555]">{nextName}</span>
              </div>
            )}
          </>
        )}

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <Toast
              key={toast.id}
              message={toast.message}
              variant={toast.variant}
              onDismiss={() => setToast(null)}
            />
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ── Preview phase ─────────────────────────────────────────────────────────

  if (phase === 'preview' && plan) {
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
            onClick={() => { setPhase('select'); setPlan(null); }}
            className="mb-3 flex items-center gap-1 text-[#555]"
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
        <div className="mt-4 space-y-2 px-5">
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
        <div className="mt-6 space-y-3 px-5">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleStartWorkout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#aaff00] py-4 text-[16px] font-black text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.2)]"
          >
            <Zap size={17} />
            {t('timer.startWorkout')}
          </motion.button>

          <button
            type="button"
            onClick={() => { setPhase('select'); setPlan(null); }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-3.5 text-[14px] font-semibold text-[#555]"
          >
            <RotateCcw size={13} />
            {t('plan.regenerate')}
          </button>
        </div>
      </motion.div>
    );
  }

  // ── Select phase ──────────────────────────────────────────────────────────

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

      {/* Body map */}
      <motion.div {...fadeUp(0.1)} className="mt-3 flex justify-center px-5">
        <div className="w-full max-w-[345px]">
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
