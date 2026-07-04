'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Clock, ChevronRight, Loader2 } from 'lucide-react';
import { useWorkoutSession } from '../workout-session-provider';

export function WorkoutConfirmView() {
  const { initialData, status, error, startSession } = useWorkoutSession();
  const { workoutName, exercises, estimatedDurationMin } = initialData;

  const isStarting = status === 'initialising';

  return (
    <div className="flex min-h-dvh flex-col px-5 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-1 flex-col gap-6"
      >
        {/* Workout header */}
        <div className="flex flex-col gap-2">
          <p className="text-[12px] font-semibold uppercase tracking-widest text-[#555555]">
            Ready to start
          </p>
          <h2 className="text-[22px] font-black leading-tight text-[#f5f5f5]">
            {workoutName}
          </h2>
          {estimatedDurationMin && (
            <div className="flex items-center gap-1.5">
              <Clock size={13} color="#555555" />
              <span className="text-[12px] text-[#555555]">
                ~{estimatedDurationMin} min
              </span>
            </div>
          )}
        </div>

        {/* Exercise preview */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
          </p>
          <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
            {exercises.map((ex, i) => (
              <div
                key={ex.workoutExerciseId}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < exercises.length - 1
                    ? 'border-b border-[rgba(255,255,255,0.04)]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.04)]">
                    <Dumbbell size={13} color="#555555" strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-medium text-[#f5f5f5]">
                    {ex.name}
                  </span>
                </div>
                <span className="text-[11px] text-[#555555]">
                  {ex.sets} × {ex.reps ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1" />

        {/* Error message */}
        {error && (
          <p className="text-center text-[12px] font-medium text-[#ef4444]">
            {error}. Please try again.
          </p>
        )}

        {/* CTA */}
        <motion.button
          type="button"
          whileTap={isStarting ? undefined : { scale: 0.97 }}
          disabled={isStarting}
          onClick={startSession}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#aaff00] py-4 text-[15px] font-black text-[#0a0a0a] disabled:opacity-60"
        >
          {isStarting ? (
            <Loader2 size={20} color="#0a0a0a" className="animate-spin" />
          ) : (
            <>
              Start Workout
              <ChevronRight size={18} color="#0a0a0a" strokeWidth={2.5} />
            </>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}
