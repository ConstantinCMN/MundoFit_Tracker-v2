'use client';

import { AnimatePresence } from 'framer-motion';
import {
  WorkoutSessionProvider,
  useWorkoutSession,
  type WorkoutSessionInitialData,
} from './workout-session-provider';
import { WorkoutConfirmView } from './views/workout-confirm-view';
import { ActiveWorkoutView } from './views/active-workout-view';
import { ExerciseTransitionView } from './views/exercise-transition-view';
import { WorkoutSummaryView } from './views/workout-summary-view';
import { PauseOverlay } from './overlays/pause-overlay';
import { FinishConfirmDialog } from './overlays/finish-confirm-dialog';

// ── Router ────────────────────────────────────────────────────────────────────
// Rendered as a child of WorkoutSessionProvider so it can read context.

function WorkoutSessionRouter() {
  const { status, currentExerciseIndex } = useWorkoutSession();

  const showActive =
    status === 'active' ||
    status === 'resting' ||
    status === 'paused' ||
    status === 'finishing';

  return (
    <>
      {(status === 'idle' || status === 'initialising' || status === 'recovering') && (
        <WorkoutConfirmView />
      )}

      {showActive && <ActiveWorkoutView key={currentExerciseIndex} />}

      {status === 'transitioning' && <ExerciseTransitionView />}

      <AnimatePresence>
        {status === 'paused' && <PauseOverlay key="pause" />}
        {status === 'finishing' && <FinishConfirmDialog key="finish" />}
      </AnimatePresence>

      {(status === 'completing' || status === 'completed') && <WorkoutSummaryView />}
    </>
  );
}

// ── Client root ───────────────────────────────────────────────────────────────

type WorkoutSessionClientProps = {
  initialData: WorkoutSessionInitialData;
};

export function WorkoutSessionClient({ initialData }: WorkoutSessionClientProps) {
  return (
    <WorkoutSessionProvider initialData={initialData}>
      <WorkoutSessionRouter />
    </WorkoutSessionProvider>
  );
}
