'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useWorkoutSession } from '../workout-session-provider';

function formatDuration(startedAt: string): string {
  const sec = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
  const min = Math.floor(sec / 60);
  return min < 1 ? `${sec}s` : `${min} min`;
}

export function FinishConfirmDialog() {
  const {
    setStatus,
    startedAt,
    totalSetsCompleted,
    initialData,
    finishWorkout,
  } = useWorkoutSession();

  // Guard against double-taps racing before the status change unmounts the dialog.
  const hasFinishedRef = useRef(false);

  function handleFinish() {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    void finishWorkout();
  }

  const { exercises } = initialData;
  const durationStr = startedAt ? formatDuration(startedAt) : '--';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(10,10,10,0.85)] px-5 pb-8 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm rounded-3xl border border-[rgba(255,255,255,0.08)] bg-[#111111] p-6"
      >
        <div className="mb-5 text-center">
          <h3 className="text-[17px] font-black text-[#f5f5f5]">Finish Workout?</h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#555555]">
            Your logged sets will be saved.
          </p>
        </div>

        {/* Session stats */}
        <div className="mb-5 grid grid-cols-3 gap-0 overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
          <div className="flex flex-col items-center gap-1 px-2 py-4">
            <span className="text-[20px] font-black tabular-nums leading-none text-[#f5f5f5]">
              {durationStr}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
              Duration
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-[rgba(255,255,255,0.06)] px-2 py-4">
            <span className="text-[20px] font-black tabular-nums leading-none text-[#f5f5f5]">
              {exercises.length}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
              Exercises
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 px-2 py-4">
            <span className="text-[20px] font-black tabular-nums leading-none text-[#f5f5f5]">
              {totalSetsCompleted}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
              Sets
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleFinish}
            className="w-full rounded-2xl bg-[#aaff00] py-3.5 text-[14px] font-black text-[#0a0a0a]"
          >
            Finish Workout
          </motion.button>

          <button
            type="button"
            onClick={() => setStatus('active')}
            className="w-full rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] py-3.5 text-[14px] font-semibold text-[#555555]"
          >
            Keep Going
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
