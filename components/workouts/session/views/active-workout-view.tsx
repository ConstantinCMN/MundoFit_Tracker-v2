'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Check, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { useWorkoutSession } from '../workout-session-provider';
import { logSet } from '@/lib/actions/sessions';
import { RestOverlay, type RestNextTarget } from '../overlays/rest-overlay';
import { ElapsedTimer } from '../elapsed-timer';

function formatWeight(w: number): string {
  return Number.isInteger(w) ? String(w) : w.toFixed(1);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, ' ');
}

function formatShortDate(isoStr: string): string {
  if (!isoStr) return '';
  return new Date(isoStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const inputBtn =
  'flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.12)]';

// ── Active Workout View ───────────────────────────────────────────────────────
// Rendered with key={currentExerciseIndex} so React fully remounts on exercise
// change, resetting all local state automatically. On re-mount, completedSets
// initialises from review mode (all done) or fresh (none done).

export function ActiveWorkoutView() {
  const {
    initialData, sessionId, setStatus,
    currentExerciseIndex, frontierExerciseIndex,
    beginTransition, goToPreviousExercise, goToNextExercise, returnToActive,
    incrementCompletedSets,
    addVolume,
  } = useWorkoutSession();

  const { workoutName, exercises } = initialData;

  const ex = exercises[currentExerciseIndex];
  const totalSets = ex?.sets ?? 3;
  const hasNextExercise = currentExerciseIndex < exercises.length - 1;

  // Review mode: user navigated backward to an already-completed exercise.
  // Sets show as done; completing them again is blocked to prevent DB duplicates.
  const isReviewMode = currentExerciseIndex < frontierExerciseIndex;

  const prevPerf = ex ? (initialData.previousPerformance[ex.exerciseId] ?? null) : null;

  // In review mode initialise all sets as completed (visual state only).
  const [selectedSetIdx, setSelectedSetIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Set<number>>(() =>
    isReviewMode
      ? new Set(Array.from({ length: totalSets }, (_, i) => i))
      : new Set()
  );
  const [weight, setWeight] = useState(prevPerf?.weightKg ?? ex?.weightKg ?? 0);
  const [reps, setReps] = useState(prevPerf?.reps ?? ex?.reps ?? 8);

  // ── Double-tap guards ────────────────────────────────────────────────────────
  const loggedSetsRef = useRef<Set<number>>(new Set());
  const hasAdvancedRef = useRef(false);

  // ── Rest timer state ─────────────────────────────────────────────────────────
  type RestState = { restSec: number; nextTarget: RestNextTarget };
  const [restState, setRestState] = useState<RestState | null>(null);

  if (!ex) return null;

  const allSetsForExDone = completedSets.size >= totalSets;
  const isSelectedDone = completedSets.has(selectedSetIdx);

  // Progress: frontier + 1 when all sets on the current active exercise are done
  // (before the user taps "Next Exercise →"). Gives immediate progress feedback.
  const progressPct =
    (frontierExerciseIndex + (!isReviewMode && allSetsForExDone ? 1 : 0)) /
    Math.max(exercises.length, 1) *
    100;

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleRowTap(i: number) {
    if (isReviewMode) return;
    setSelectedSetIdx(i);
  }

  function handleCompleteSet() {
    if (isReviewMode) return;
    if (loggedSetsRef.current.has(selectedSetIdx)) return;
    loggedSetsRef.current.add(selectedSetIdx);
    incrementCompletedSets();
    addVolume(weight * reps);

    const next = new Set(completedSets);
    next.add(selectedSetIdx);
    setCompletedSets(next);

    for (let i = selectedSetIdx + 1; i < totalSets; i++) {
      if (!next.has(i)) {
        setSelectedSetIdx(i);
        break;
      }
    }

    if (sessionId) {
      void logSet({
        sessionId,
        exerciseId:  ex.exerciseId,
        setNumber:   selectedSetIdx + 1,
        position:    ex.position,
        reps,
        weightKg:    weight,
        restSec:     ex.restSec,
      });
    }

    // Start rest timer after set completion.
    // Per UX spec §6.5: no rest timer after the last set of the last exercise.
    // Per UX spec §8.10: skip entirely when restSec === 0.
    const isAllSetsNowDone = next.size >= totalSets;
    const isLastExercise = !hasNextExercise;
    const shouldStartRest = ex.restSec > 0 && !(isAllSetsNowDone && isLastExercise);

    if (shouldStartRest) {
      const nextExercise = exercises[currentExerciseIndex + 1];
      const nextTarget: RestNextTarget = isAllSetsNowDone
        ? { kind: 'exercise', name: nextExercise!.name }
        : { kind: 'set', weight, reps };
      setRestState({ restSec: ex.restSec, nextTarget });
    }
  }

  function handleCta() {
    if (isReviewMode) {
      returnToActive();
      return;
    }
    if (allSetsForExDone) {
      if (hasNextExercise) {
        if (hasAdvancedRef.current) return;
        hasAdvancedRef.current = true;
        beginTransition();
      } else {
        setStatus('finishing');
      }
    } else if (!isSelectedDone) {
      handleCompleteSet();
    }
  }

  // CTA label -----------------------------------------------------------------
  const ctaLabel = isReviewMode
    ? 'Return to Workout →'
    : allSetsForExDone
      ? hasNextExercise
        ? 'Next Exercise →'
        : 'Finish Workout'
      : `Complete Set ${selectedSetIdx + 1}`;

  // Disabled only when the selected set is already done (not in review mode).
  const ctaDisabled = !isReviewMode && !allSetsForExDone && isSelectedDone;

  // Outline style for review CTA and "Next Exercise →"; filled for everything else.
  const ctaIsOutline = isReviewMode || (allSetsForExDone && hasNextExercise);

  // Nav bar -------------------------------------------------------------------
  const prevEx = exercises[currentExerciseIndex - 1];
  const nextEx = exercises[currentExerciseIndex + 1];

  // Show nav while sets are incomplete OR when browsing past exercises.
  const showNavBar = !allSetsForExDone || isReviewMode;

  // In review mode: next nav enabled up to (but not past) the frontier.
  // In active mode (sets incomplete): next nav always disabled.
  const prevNavDisabled = currentExerciseIndex === 0;
  const nextNavDisabled = isReviewMode
    ? currentExerciseIndex >= frontierExerciseIndex
    : true;

  // ── Layout ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative flex flex-col overflow-hidden bg-[#0a0a0a]"
      style={{ height: 'calc(100dvh - env(safe-area-inset-bottom, 0px))' }}
    >

      {/* ── ZONE A — Session header (never scrolls) ──────────────────────── */}
      <header className="flex-none bg-[rgba(10,10,10,0.96)] backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          <button
            type="button"
            onClick={() => setStatus('paused')}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.08)]"
            aria-label="Pause workout"
          >
            <Pause size={16} color="#f5f5f5" />
          </button>

          {/* Two-line center: workout name + exercise counter */}
          <div className="min-w-0 flex-1 flex flex-col items-center justify-center gap-0.5">
            <p className="truncate text-[13px] font-semibold leading-none text-[#f5f5f5]">
              {workoutName}
            </p>
            <p className="text-[10px] leading-none text-[#555555]">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
              {isReviewMode && (
                <span className="ml-1 text-[#3a3a3a]">· reviewing</span>
              )}
            </p>
          </div>

          <ElapsedTimer />
        </div>
      </header>

      {/* Progress bar — sibling of header, outside backdrop-filter stacking context */}
      <div className="flex-none h-1.5 bg-[#333333]">
        <div
          className="h-full bg-[#aaff00] transition-[width] duration-[250ms] ease-out"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* ── ZONE B — Scrollable content ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="space-y-4 px-5 pt-6 pb-6">

          {/* Exercise context */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#555555]">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
            </p>
            <h2 className="text-[26px] font-black leading-tight text-[#f5f5f5]">
              {ex.name}
            </h2>
            {ex.muscleGroups.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {ex.muscleGroups.map(m => (
                  <span
                    key={m}
                    className="rounded-full bg-[rgba(255,255,255,0.06)] px-2.5 py-0.5 text-[11px] font-medium text-[#888888]"
                  >
                    {capitalize(m)}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Previous Performance Card ─────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={[
              'rounded-2xl px-4 py-3.5',
              prevPerf
                ? 'border border-[rgba(170,255,0,0.15)] bg-[rgba(170,255,0,0.05)]'
                : 'border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]',
            ].join(' ')}
          >
            {prevPerf ? (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
                  Last session · {formatShortDate(prevPerf.sessionDate)}
                </p>
                <p className="mt-1 text-[20px] font-black leading-none text-[#f5f5f5]">
                  {prevPerf.weightKg != null ? `${formatWeight(prevPerf.weightKg)} kg` : '—'}{' '}
                  × {prevPerf.reps ?? '—'} reps
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                  No previous performance
                </p>
                <p className="mt-1 text-[13px] text-[#444444]">
                  Set your baseline today
                </p>
              </>
            )}
          </motion.div>

          {/* ── Target Card ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3.5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
              Today's target
            </p>
            <div className="mt-1 flex items-end justify-between">
              <p className="text-[18px] font-black leading-none text-[#f5f5f5]">
                {totalSets} sets × {ex.reps ?? '—'} reps
              </p>
              <p className="text-[12px] text-[#555555]">{ex.restSec}s rest</p>
            </div>
          </motion.div>

          {/* ── Sets Table ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.17, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="mb-2 flex items-center px-1">
              <span className="w-9 shrink-0 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
                Set
              </span>
              <span className="flex-1 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
                Previous
              </span>
              <span className="w-8 shrink-0" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)]">
              {Array.from({ length: totalSets }).map((_, i) => {
                const done = completedSets.has(i);
                const live = !isReviewMode && selectedSetIdx === i && !done;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRowTap(i)}
                    className={[
                      'relative flex h-[52px] w-full items-center px-4 transition-colors',
                      i < totalSets - 1 ? 'border-b border-[rgba(255,255,255,0.04)]' : '',
                      done
                        ? 'bg-[rgba(170,255,0,0.04)]'
                        : live
                        ? 'bg-[rgba(255,255,255,0.04)]'
                        : 'bg-transparent hover:bg-[rgba(255,255,255,0.02)]',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {live && (
                      <span className="absolute inset-y-0 left-0 w-[3px] bg-[#aaff00]" />
                    )}

                    <span
                      className={[
                        'w-9 shrink-0 text-[14px] font-bold',
                        done ? 'text-[#555555]' : live ? 'text-[#aaff00]' : 'text-[#444444]',
                      ].join(' ')}
                    >
                      {i + 1}
                    </span>

                    <span
                      className={[
                        'flex-1 text-[14px]',
                        done ? 'text-[#555555]' : live ? 'text-[#f5f5f5]' : 'text-[#444444]',
                      ].join(' ')}
                    >
                      {prevPerf
                        ? `${prevPerf.weightKg != null ? formatWeight(prevPerf.weightKg) + ' kg' : '—'} × ${prevPerf.reps ?? '—'}`
                        : '—'}
                    </span>

                    <span className="flex w-8 shrink-0 items-center justify-end">
                      {done ? (
                        <Check size={16} color="#aaff00" strokeWidth={2.5} />
                      ) : live ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-[#aaff00]" />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {!isReviewMode && (
              <p className="mt-2 text-center text-[11px] text-[#333333]">
                Tap a set to select it
              </p>
            )}
          </motion.div>

        </div>
      </div>

      {/* ── ZONE C — Sticky bottom bar (never scrolls) ───────────────────── */}
      <div className="flex-none border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 pt-4 pb-4">

        {/* Weight + Reps controls (hidden in review mode — no editing past exercises) */}
        {!isReviewMode && (
          <div className="mb-4 flex items-stretch">

            {/* Weight control */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                Weight
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWeight(w => Math.max(0, parseFloat((w - 2.5).toFixed(1))))}
                  className={inputBtn}
                  aria-label="Subtract 2.5 kg"
                >
                  <Minus size={20} color="#888888" strokeWidth={1.75} />
                </button>
                <span className="min-w-[60px] text-center text-[32px] font-black tabular-nums leading-none text-[#f5f5f5]">
                  {formatWeight(weight)}
                </span>
                <button
                  type="button"
                  onClick={() => setWeight(w => parseFloat((w + 2.5).toFixed(1)))}
                  className={inputBtn}
                  aria-label="Add 2.5 kg"
                >
                  <Plus size={20} color="#888888" strokeWidth={1.75} />
                </button>
              </div>
              <p className="text-[11px] font-medium text-[#444444]">kg</p>
            </div>

            <div className="mx-2 w-px self-stretch bg-[#1a1a1a]" />

            {/* Reps control */}
            <div className="flex flex-1 flex-col items-center gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
                Reps
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReps(r => Math.max(1, r - 1))}
                  className={inputBtn}
                  aria-label="Subtract 1 rep"
                >
                  <Minus size={20} color="#888888" strokeWidth={1.75} />
                </button>
                <span className="min-w-[44px] text-center text-[32px] font-black tabular-nums leading-none text-[#f5f5f5]">
                  {reps}
                </span>
                <button
                  type="button"
                  onClick={() => setReps(r => Math.min(50, r + 1))}
                  className={inputBtn}
                  aria-label="Add 1 rep"
                >
                  <Plus size={20} color="#888888" strokeWidth={1.75} />
                </button>
              </div>
              <p className="text-[11px] font-medium text-[#444444]">reps</p>
            </div>
          </div>
        )}

        {/* Review mode: show what was logged last time instead of inputs */}
        {isReviewMode && prevPerf && (
          <div className="mb-4 py-2 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555555]">
              Last logged
            </p>
            <p className="mt-1 text-[22px] font-black text-[#f5f5f5]">
              {prevPerf.weightKg != null ? `${formatWeight(prevPerf.weightKg)} kg` : '—'}
              {' '}×{' '}
              {prevPerf.reps ?? '—'} reps
            </p>
          </div>
        )}

        {/* Primary CTA */}
        <motion.button
          type="button"
          whileTap={ctaDisabled ? undefined : { scale: 0.97 }}
          onClick={handleCta}
          disabled={ctaDisabled}
          className={[
            'flex h-[52px] w-full items-center justify-center rounded-2xl text-[15px] font-black transition-colors disabled:opacity-40',
            ctaIsOutline
              ? 'border border-[#aaff00] bg-transparent text-[#aaff00]'
              : 'bg-[#aaff00] text-[#0a0a0a]',
          ].join(' ')}
        >
          {ctaLabel}
        </motion.button>

        {/* Exercise navigation */}
        {showNavBar && (
          <div className="mt-3 flex items-center justify-between">
            {prevEx ? (
              <button
                type="button"
                onClick={goToPreviousExercise}
                disabled={prevNavDisabled}
                className={[
                  'flex max-w-[44%] items-center gap-1 rounded-xl py-2 pr-2 text-[12px] font-semibold',
                  prevNavDisabled
                    ? 'pointer-events-none text-[#2a2a2a]'
                    : 'text-[#555555] active:text-[#888888]',
                ].join(' ')}
              >
                <ChevronLeft size={14} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{prevEx.name}</span>
              </button>
            ) : (
              <div />
            )}
            {nextEx ? (
              <button
                type="button"
                onClick={goToNextExercise}
                disabled={nextNavDisabled}
                className={[
                  'flex max-w-[44%] items-center gap-1 rounded-xl py-2 pl-2 text-[12px] font-semibold',
                  nextNavDisabled
                    ? 'pointer-events-none text-[#2a2a2a]'
                    : 'text-[#555555] active:text-[#888888]',
                ].join(' ')}
              >
                <span className="truncate">{nextEx.name}</span>
                <ChevronRight size={14} strokeWidth={2} className="shrink-0" />
              </button>
            ) : (
              <div />
            )}
          </div>
        )}

      </div>

      {/* ── Rest Overlay ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {restState && (
          <RestOverlay
            key="rest"
            initialSeconds={restState.restSec}
            nextTarget={restState.nextTarget}
            onDismiss={() => setRestState(null)}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
