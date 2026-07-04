'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useRouter } from '@/lib/i18n/navigation';
import { createSession, completeSession } from '@/lib/actions/sessions';

// ── Status ────────────────────────────────────────────────────────────────────

export type SessionStatus =
  | 'idle'
  | 'initialising'
  | 'active'
  | 'resting'
  | 'transitioning'
  | 'paused'
  | 'finishing'
  | 'completing'
  | 'completed'
  | 'cancelled'
  | 'recovering'
  | 'error';

// ── Data shapes ───────────────────────────────────────────────────────────────

export type FrozenExercise = {
  workoutExerciseId: string;
  exerciseId: string;
  name: string;
  muscleGroups: string[];
  sets: number;
  reps: number | null;
  restSec: number;
  position: number;
  weightKg: number | null;
};

// Most recent completed set for a given exercise, fetched at session start.
export type ExercisePreviousPerformance = {
  reps: number | null;
  weightKg: number | null;
  sessionDate: string; // ISO 8601 — workout_sessions.started_at of that session
};

export type WorkoutSessionInitialData = {
  workoutId: string;
  workoutName: string;
  splitType: string | null;
  scheduleDayId: string | null;
  estimatedDurationMin: number | null;
  exercises: FrozenExercise[];
  // Keyed by exerciseId. Missing key = no history for that exercise.
  previousPerformance: Record<string, ExercisePreviousPerformance>;
};

// ── localStorage ───────────────────────────────────────────────────────────────

export const SESSION_STORAGE_KEY = 'wf_active_session';

export type SessionStorageBlob = {
  sessionId: string;
  workoutId: string;
  workoutName: string;
  scheduleDayId: string | null;
  splitType: string | null;
  startedAt: string;
  status: 'active';
  frozenExercises: FrozenExercise[];
  // Progress fields — updated on every meaningful state change.
  currentExerciseIndex: number;
  frontierExerciseIndex: number;
  totalSetsCompleted: number;
  totalVolumeKg: number;
};

function writeSessionToStorage(blob: SessionStorageBlob): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(blob));
  } catch {
    // localStorage unavailable (incognito / quota) — session continues without local persistence
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

type WorkoutSessionContextValue = {
  status: SessionStatus;
  setStatus: (status: SessionStatus) => void;
  initialData: WorkoutSessionInitialData;
  sessionId: string | null;
  startedAt: string | null;
  error: string | null;
  startSession: () => Promise<void>;
  // currentExerciseIndex: which exercise the user is viewing (can go backward for review)
  currentExerciseIndex: number;
  // frontierExerciseIndex: how many exercises have been completed (never decrements)
  frontierExerciseIndex: number;
  // Called when user taps "Next Exercise →" on a completed exercise. Marks exercise
  // complete (frontier++) and switches to 'transitioning' to show the transition screen.
  beginTransition: () => void;
  // Called from the transition screen "Continue" button. Advances currentExerciseIndex
  // and returns status to 'active'.
  confirmAdvance: () => void;
  goToPreviousExercise: () => void;
  // Move forward through already-completed exercises (review mode navigation only).
  goToNextExercise: () => void;
  // Jump directly back to the frontier exercise from review mode.
  returnToActive: () => void;
  // Total sets successfully logged this session (incremented by ActiveWorkoutView).
  totalSetsCompleted: number;
  incrementCompletedSets: () => void;
  // Total volume (kg) = sum of weight_kg × reps for each completed set.
  totalVolumeKg: number;
  addVolume: (vol: number) => void;
  // Duration in seconds, captured at the moment finishWorkout() fires (null before completion).
  completedDurationSec: number | null;
  // Finalises the session: writes ended_at + duration_sec + total_volume_kg, clears localStorage, sets status 'completed'.
  finishWorkout: () => Promise<void>;
  // Cancels the session: clears localStorage and navigates to dashboard.
  cancelWorkout: () => void;
};

const WorkoutSessionContext = createContext<WorkoutSessionContextValue | null>(null);

export function useWorkoutSession(): WorkoutSessionContextValue {
  const ctx = useContext(WorkoutSessionContext);
  if (!ctx) throw new Error('useWorkoutSession must be used within WorkoutSessionProvider');
  return ctx;
}

// ── Provider ──────────────────────────────────────────────────────────────────

type WorkoutSessionProviderProps = {
  initialData: WorkoutSessionInitialData;
  children: ReactNode;
};

export function WorkoutSessionProvider({ initialData, children }: WorkoutSessionProviderProps) {
  const router = useRouter();
  const [status, setStatus]                       = useState<SessionStatus>('idle');
  const [sessionId, setSessionId]                 = useState<string | null>(null);
  const [startedAt, setStartedAt]                 = useState<string | null>(null);
  const [error, setError]                         = useState<string | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [frontierExerciseIndex, setFrontierExerciseIndex] = useState(0);
  const [totalSetsCompleted, setTotalSetsCompleted] = useState(0);
  const [totalVolumeKg, setTotalVolumeKg] = useState(0);
  const [completedDurationSec, setCompletedDurationSec] = useState<number | null>(null);

  const beginTransition = useCallback(() => {
    setFrontierExerciseIndex(prev => prev + 1);
    setStatus('transitioning');
  }, []);

  const confirmAdvance = useCallback(() => {
    setCurrentExerciseIndex(prev => prev + 1);
    setStatus('active');
  }, []);

  const goToPreviousExercise = useCallback(() => {
    setCurrentExerciseIndex(prev => Math.max(0, prev - 1));
  }, []);

  const goToNextExercise = useCallback(() => {
    setCurrentExerciseIndex(prev =>
      prev < frontierExerciseIndex ? prev + 1 : prev
    );
  }, [frontierExerciseIndex]);

  const returnToActive = useCallback(() => {
    setCurrentExerciseIndex(frontierExerciseIndex);
  }, [frontierExerciseIndex]);

  const incrementCompletedSets = useCallback(() => {
    setTotalSetsCompleted(prev => prev + 1);
  }, []);

  const addVolume = useCallback((vol: number) => {
    setTotalVolumeKg(prev => parseFloat((prev + vol).toFixed(2)));
  }, []);

  const finishWorkout = useCallback(async () => {
    if (!sessionId || !startedAt) return;
    const endedAt = new Date().toISOString();
    const dur = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
    setCompletedDurationSec(dur);
    setStatus('completing');
    // totalVolumeKg read from the closure — same value shown on the summary screen.
    await completeSession(sessionId, endedAt, dur, totalVolumeKg);
    try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* quota / incognito */ }
    setStatus('completed');
  }, [sessionId, startedAt, totalVolumeKg]);

  const cancelWorkout = useCallback(() => {
    try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* quota / incognito */ }
    router.push('/dashboard');
  }, [router]);

  const startSession = useCallback(async () => {
    setError(null);
    setStatus('initialising');

    const now = new Date().toISOString();

    const result = await createSession(
      initialData.workoutId,
      initialData.workoutName,
      now
    );

    if ('error' in result) {
      setError(result.error);
      setStatus('idle');
      return;
    }

    setSessionId(result.sessionId);
    setStartedAt(now);
    setStatus('active');
    // localStorage write is handled by the autosave effect below.
  }, [initialData]);

  // ── Autosave ─────────────────────────────────────────────────────────────────
  // Writes the full progress blob to localStorage after every meaningful state
  // change. React 18 batches multiple setState calls from the same event into a
  // single render, so one set completion (incrementCompletedSets + addVolume)
  // produces exactly one localStorage write.
  //
  // Guards:
  //   - !sessionId / !startedAt  → session not started yet
  //   - completing / completed   → finishWorkout() owns the cleanup write
  //   - cancelled                → cancelWorkout() already cleared storage
  useEffect(() => {
    if (!sessionId || !startedAt) return;
    if (status === 'completing' || status === 'completed' || status === 'cancelled') return;

    writeSessionToStorage({
      sessionId,
      workoutId:           initialData.workoutId,
      workoutName:         initialData.workoutName,
      scheduleDayId:       initialData.scheduleDayId,
      splitType:           initialData.splitType,
      startedAt,
      status:              'active',
      frozenExercises:     initialData.exercises,
      currentExerciseIndex,
      frontierExerciseIndex,
      totalSetsCompleted,
      totalVolumeKg,
    });
  }, [
    sessionId, startedAt, status,
    currentExerciseIndex, frontierExerciseIndex,
    totalSetsCompleted, totalVolumeKg,
    initialData,
  ]);

  const value = useMemo<WorkoutSessionContextValue>(
    () => ({
      status, setStatus, initialData, sessionId, startedAt, error, startSession,
      currentExerciseIndex, frontierExerciseIndex,
      beginTransition, confirmAdvance, goToPreviousExercise, goToNextExercise, returnToActive,
      totalSetsCompleted, incrementCompletedSets,
      totalVolumeKg, addVolume,
      completedDurationSec,
      finishWorkout,
      cancelWorkout,
    }),
    [
      status, initialData, sessionId, startedAt, error, startSession,
      currentExerciseIndex, frontierExerciseIndex,
      beginTransition, confirmAdvance, goToPreviousExercise, goToNextExercise, returnToActive,
      totalSetsCompleted, incrementCompletedSets,
      totalVolumeKg, addVolume,
      completedDurationSec,
      finishWorkout,
      cancelWorkout,
    ]
  );

  return (
    <WorkoutSessionContext.Provider value={value}>
      {children}
    </WorkoutSessionContext.Provider>
  );
}
