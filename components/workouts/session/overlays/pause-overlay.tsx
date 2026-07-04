'use client';

import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useWorkoutSession } from '../workout-session-provider';

export function PauseOverlay() {
  const { setStatus, cancelWorkout } = useWorkoutSession();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[rgba(10,10,10,0.92)] px-5 backdrop-blur-sm"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555555]">
            Workout paused
          </p>
          <h2 className="mt-1 text-[22px] font-black text-[#f5f5f5]">Take a break</h2>
        </div>

        <div className="flex w-full flex-col gap-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={() => setStatus('active')}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#aaff00] py-4 text-[15px] font-black text-[#0a0a0a]"
          >
            <Play size={18} color="#0a0a0a" fill="#0a0a0a" />
            Resume
          </motion.button>

          <button
            type="button"
            onClick={cancelWorkout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] py-4 text-[14px] font-semibold text-[#555555]"
          >
            <X size={16} color="#555555" />
            Cancel Workout
          </button>
        </div>
      </div>
    </motion.div>
  );
}
