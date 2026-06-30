'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useWorkoutSession } from '../workout-session-provider';
import { ElapsedTimer } from '../elapsed-timer';

export function ExerciseTransitionView() {
  const {
    initialData,
    currentExerciseIndex,
    frontierExerciseIndex,
    confirmAdvance,
  } = useWorkoutSession();

  const { workoutName, exercises } = initialData;
  const completedEx = exercises[currentExerciseIndex];
  const nextEx = exercises[currentExerciseIndex + 1];
  const progressPct = (frontierExerciseIndex / Math.max(exercises.length, 1)) * 100;

  return (
    <div
      className="flex flex-col overflow-hidden bg-[#0a0a0a]"
      style={{ height: 'calc(100dvh - env(safe-area-inset-bottom, 0px))' }}
    >
      {/* ── Zone A — Header (matches ActiveWorkoutView) ───────────────────── */}
      <header className="flex-none bg-[rgba(10,10,10,0.96)] backdrop-blur-xl">
        <div className="flex h-14 items-center gap-3 px-4">
          {/* Placeholder — pause button space kept for visual alignment */}
          <div className="h-11 w-11 flex-none" />

          <div className="min-w-0 flex-1 flex flex-col items-center justify-center gap-0.5">
            <p className="truncate text-[13px] font-semibold leading-none text-[#f5f5f5]">
              {workoutName}
            </p>
            <p className="text-[10px] leading-none text-[#555555]">
              Exercise {currentExerciseIndex + 1} of {exercises.length}
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

      {/* ── Transition content — centered ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {/* Check circle */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.1)]"
        >
          <Check size={36} color="#aaff00" strokeWidth={2.5} />
        </motion.div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
          className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#aaff00]/60"
        >
          Exercise Complete
        </motion.p>

        {/* Completed exercise name */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className="mb-6 text-center text-[26px] font-black leading-tight text-[#f5f5f5]"
        >
          {completedEx?.name}
        </motion.h2>

        {/* Next exercise */}
        {nextEx && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, delay: 0.2 }}
            className="mb-10 text-[13px] text-[#555555]"
          >
            Next:{' '}
            <span className="font-semibold text-[#888888]">{nextEx.name}</span>
          </motion.p>
        )}

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={confirmAdvance}
          className="h-[52px] w-full max-w-xs rounded-2xl bg-[#aaff00] text-[15px] font-black text-[#0a0a0a]"
        >
          Continue →
        </motion.button>
      </div>
    </div>
  );
}
