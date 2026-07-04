'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Zap, RotateCcw, Clock, Dumbbell, Trash2,
} from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { MuscleMap, type MuscleId, type BodyView } from './muscle-map';
import { useMuscleSelection } from './muscle-selection-context';
import {
  getExercisesForMuscles,
  getWorkoutPlanById,
  saveGeneratedWorkout,
  deleteWorkout,
  type GeneratedWorkoutPlan,
  type WorkoutExercisePlan,
} from '@/lib/actions/workouts';
import { attachWorkoutToScheduleDay } from '@/lib/actions/schedules';
import { cn } from '@/lib/utils/cn';
import { Toast } from '@/components/ui/toast';
import {
  GOALS, EXPERIENCE_LEVELS, DEFAULT_GOAL, DEFAULT_LEVEL,
  type Goal, type ExperienceLevel,
} from '@/lib/workouts/training-goals';
import type { SplitType } from '@/lib/workouts/split-types';

// ── Types ─────────────────────────────────────────────────────────────────────

type Phase      = 'select' | 'loading' | 'preview';
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

// Floor on exercises in a preview plan — guarantees `plan.exercises` is
// never empty when execution starts.
const MIN_EXERCISES = 1;

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

function SegmentedControl<T extends string>({
  options,
  active,
  onChange,
}: {
  options: { value: T; label: string }[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-1">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'relative flex-1 rounded-xl py-2.5 text-[12px] font-bold transition-colors',
            active === opt.value ? 'text-[#0a0a0a]' : 'text-[#555555]'
          )}
        >
          {active === opt.value && (
            <motion.div
              layoutId={`segmented-pill-${options.map(o => o.value).join('-')}`}
              className="absolute inset-0 rounded-xl bg-[#aaff00]"
              transition={{ type: 'spring', stiffness: 400, damping: 36 }}
            />
          )}
          <span className="relative">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

function ExercisePlanCard({
  we,
  locale,
  muscleLabel,
  onDelete,
  deleteDisabled,
}: {
  we: WorkoutExercisePlan;
  locale: string;
  muscleLabel: (id: string) => string;
  onDelete?: () => void;
  deleteDisabled?: boolean;
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
      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleteDisabled}
          aria-label="Remove exercise"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[#555555] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-red-400 disabled:pointer-events-none disabled:opacity-30"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function GeneratorClient({
  locale,
  initialMuscles,
  initialView,
  initialSplit,
  initialScheduleDayId,
  initialWorkoutId,
}: {
  locale: string;
  initialMuscles?: string[];
  initialView?: BodyView;
  initialSplit?: SplitType;
  initialScheduleDayId?: string;
  initialWorkoutId?: string;
}) {
  const t  = useTranslations('workouts');
  const tm = useTranslations('workouts.muscles');
  const router = useRouter();

  // ── Generator state ───────────────────────────────────────────────────────
  const [view,  setView]  = useState<BodyView>(initialView ?? 'front');
  const [goal,  setGoal]  = useState<Goal>(DEFAULT_GOAL);
  const [level, setLevel] = useState<ExperienceLevel>(DEFAULT_LEVEL);
  const [phase, setPhase] = useState<Phase>('select');
  const [plan,  setPlan]  = useState<GeneratedWorkoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const didAutoGenerateRef = useRef(false);
  // Id of the most recently generated-but-not-yet-started workout row, so a
  // regenerate can replace it instead of leaving an orphaned duplicate.
  const savedWorkoutIdRef = useRef<string | null>(null);

  const { selected, toggleMuscle, clearAll } = useMuscleSelection();

  // Pre-select muscles passed via URL (?muscles=chest,shoulders) from the Body Hub
  useEffect(() => {
    if (!initialMuscles?.length) return;
    clearAll();
    initialMuscles
      .filter((id): id is MuscleId => ALL_MUSCLE_IDS.includes(id as MuscleId))
      .forEach(toggleMuscle);
  // clearAll and toggleMuscle are stable useCallback refs; intentionally omitted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const muscleLabel = (id: string) => {
    try { return tm(id as Parameters<typeof tm>[0]); } catch { return id; }
  };

  const selectedList = ALL_MUSCLE_IDS.filter(id => selected.has(id));

  // Auto-generate once when arriving from Body Hub with pre-selected muscles
  useEffect(() => {
    if (initialWorkoutId) return;
    if (!initialMuscles?.length) return;
    if (didAutoGenerateRef.current) return;
    if (selectedList.length === 0) return;
    didAutoGenerateRef.current = true;
    handleGenerate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedList.length]);

  // Resume an already-saved workout (e.g. "Start Workout" from the Dashboard's
  // Today's Workout card) straight into Preview — reads existing rows only,
  // never re-runs generation.
  const didLoadWorkoutRef = useRef(false);
  useEffect(() => {
    if (!initialWorkoutId) return;
    if (didLoadWorkoutRef.current) return;
    didLoadWorkoutRef.current = true;
    setPhase('loading');
    getWorkoutPlanById(initialWorkoutId).then(({ data, error: err }) => {
      if (err || !data) {
        setError(err ?? t('plan.errorMsg'));
        setPhase('select');
        return;
      }
      savedWorkoutIdRef.current = initialWorkoutId;
      setPlan(data);
      setPhase('preview');
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Generator handlers ────────────────────────────────────────────────────

  async function handleGenerate() {
    setPhase('loading');
    setError(null);
    const { data, error: err } = await getExercisesForMuscles(
      selectedList,
      goal,
      level,
      initialSplit ?? null
    );
    if (err || !data) {
      setError(err ?? t('plan.errorMsg'));
      setPhase('select');
      return;
    }

    // Persist immediately so it shows up in My Workouts even if never started.
    const { data: saved, error: saveErr } = await saveGeneratedWorkout(
      data,
      locale,
      initialSplit ?? null
    );
    if (saveErr || !saved) {
      setError(saveErr ?? t('plan.errorMsg'));
      setPhase('select');
      return;
    }

    // Regenerating replaces the previous unstarted save — best-effort, doesn't
    // block the new plan from showing if the cleanup delete happens to fail.
    const previousWorkoutId = savedWorkoutIdRef.current;
    if (previousWorkoutId) {
      deleteWorkout(previousWorkoutId).catch(() => {});
    }
    savedWorkoutIdRef.current = saved.workoutId;

    // Schedule context (generated from a Program day): link this workout back
    // to that day so the planner reflects it, without blocking the preview.
    if (initialScheduleDayId) {
      const { error: attachErr } = await attachWorkoutToScheduleDay(
        initialScheduleDayId,
        saved.workoutId
      );
      if (attachErr) {
        setToast({ message: t('program.updateError'), variant: 'error', id: Date.now() });
      }
    }

    setPlan(data);
    setPhase('preview');
  }

  // Preview-only edit: drops one exercise from the in-memory plan and
  // recalculates the estimated duration. Never touches exercises,
  // workout_exercises, or the already-saved workout row — those keep
  // reflecting what was generated, not what's previewed.
  function handleDeleteExercise(exerciseId: string) {
    setPlan(prev => {
      if (!prev || prev.exercises.length <= MIN_EXERCISES) return prev;
      const exercises = prev.exercises.filter(we => we.exercise.id !== exerciseId);
      const estimated_duration_min = Math.max(
        15,
        exercises.reduce(
          (sum, we) => sum + (we.exercise.exercise_type === 'cardio' ? 2 : 3),
          0
        )
      );
      return { ...prev, exercises, estimated_duration_min };
    });
  }

  // Hands off to the Workout Session Engine. A workout row always exists by
  // this point — freshly generated via handleGenerate, or resumed via the
  // initialWorkoutId effect above — so this only needs to carry its id and
  // the schedule/split context forward.
  function handleStartWorkout() {
    if (!savedWorkoutIdRef.current) return;
    const params = new URLSearchParams({ workoutId: savedWorkoutIdRef.current });
    if (initialScheduleDayId) params.set('scheduleDay', initialScheduleDayId);
    if (initialSplit) params.set('split', initialSplit);
    router.push(`/workouts/session?${params.toString()}`);
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
              onDelete={() => handleDeleteExercise(we.exercise.id)}
              deleteDisabled={plan.exercises.length <= MIN_EXERCISES}
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

      {/* Goal */}
      <motion.div {...fadeUp(0.18)} className="mt-5 px-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          {t('goal.sectionLabel')}
        </p>
        <SegmentedControl
          options={GOALS.map(g => ({ value: g, label: t(`goal.${g}`) }))}
          active={goal}
          onChange={setGoal}
        />
      </motion.div>

      {/* Experience level */}
      <motion.div {...fadeUp(0.18)} className="mt-4 px-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          {t('level.sectionLabel')}
        </p>
        <SegmentedControl
          options={EXPERIENCE_LEVELS.map(l => ({ value: l, label: t(`exerciseLibrary.difficulty.${l}`) }))}
          active={level}
          onChange={setLevel}
        />
      </motion.div>

      {/* Error */}
      {error && (
        <p className="mt-3 px-5 text-center text-[12px] text-red-400">{error}</p>
      )}

      {/* Generate CTA */}
      <motion.div {...fadeUp(0.26)} className="mt-5 px-5">
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
