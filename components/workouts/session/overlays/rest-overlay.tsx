'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

// Discriminated union describing what comes after the completed set.
export type RestNextTarget =
  | { kind: 'set';      weight: number; reps: number }
  | { kind: 'exercise'; name: string }
  | { kind: 'none' };

type RestOverlayProps = {
  initialSeconds: number;
  nextTarget: RestNextTarget;
  onDismiss: () => void;
};

function formatWeight(w: number): string {
  return Number.isInteger(w) ? String(w) : w.toFixed(1);
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : String(s);
}

export function RestOverlay({ initialSeconds, nextTarget, onDismiss }: RestOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  // Keep onDismiss in a ref so the timer effect never has to re-run due to
  // function identity changes between parent re-renders.
  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  // setTimeout chain (not setInterval): each tick schedules only the next tick.
  // The cleanup function cancels any pending tick on unmount — no leaks.
  // Calling onDismiss at secondsLeft === 0 happens outside the state updater
  // to avoid side effects inside a state update.
  useEffect(() => {
    if (secondsLeft <= 0) {
      onDismissRef.current();
      return;
    }
    const id = setTimeout(() => {
      setSecondsLeft(s => s - 1);
    }, 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const elapsed = initialSeconds - secondsLeft;
  const remainingPct = 1 - elapsed / Math.max(initialSeconds, 1);
  const isLow = secondsLeft > 0 && secondsLeft <= 10;

  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute inset-0 z-30 flex flex-col bg-[#0a0a0a]"
    >
      <div className="flex flex-1 flex-col items-center justify-center px-6">

        {/* State label */}
        <p className="mb-6 text-[12px] font-semibold uppercase tracking-widest text-[#555555]">
          Resting
        </p>

        {/* Countdown — turns accent at ≤ 10 s */}
        <p
          className={[
            'mb-6 font-black tabular-nums leading-none transition-colors duration-500',
            isLow ? 'text-[#aaff00]' : 'text-[#f5f5f5]',
          ].join(' ')}
          style={{ fontSize: '72px' }}
        >
          {formatTime(secondsLeft)}
        </p>

        {/* Depleting progress bar — fills the remaining time, empties to the right */}
        <div className="mb-8 h-1 w-full max-w-xs overflow-hidden rounded-full bg-[#1a1a1a]">
          <motion.div
            className="h-full rounded-full bg-[#aaff00]"
            animate={{ width: `${remainingPct * 100}%` }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </div>

        {/* Next target */}
        {nextTarget.kind !== 'none' && (
          <p className="mb-10 text-center text-[14px] text-[#555555]">
            {nextTarget.kind === 'set' ? (
              <>
                Next:{' '}
                <span className="font-semibold text-[#888888]">
                  {formatWeight(nextTarget.weight)} kg × {nextTarget.reps} reps
                </span>
              </>
            ) : (
              <>
                Next exercise:{' '}
                <span className="font-semibold text-[#888888]">{nextTarget.name}</span>
              </>
            )}
          </p>
        )}

        {/* Skip Rest */}
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-6 py-3.5 text-[14px] font-semibold text-[#555555] active:bg-[rgba(255,255,255,0.08)]"
        >
          <X size={14} strokeWidth={2} />
          Skip Rest
        </button>

      </div>
    </motion.div>
  );
}
