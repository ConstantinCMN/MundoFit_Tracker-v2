'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getSessionExercises, type WorkoutExercisePlan } from '@/lib/actions/workouts';
import { SplitBadge } from '@/components/workouts/split-badge';
import type { SessionWithSplit } from '@/components/workouts/workout-history-client';

type Props = {
  session: SessionWithSplit | null;
  locale: string;
  onClose: () => void;
};

type LoadState = 'idle' | 'loading' | 'loaded' | 'unavailable';

export function SessionDetailSheet({ session, locale, onClose }: Props) {
  const t = useTranslations('workouts.historyPage');
  const [exercises, setExercises] = useState<WorkoutExercisePlan[] | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('idle');

  // Reload whenever a different session is opened. Reads the session_sets
  // snapshot taken when this session was saved — exactly what was executed —
  // rather than the live (possibly since-edited or trimmed) workout template.
  useEffect(() => {
    if (!session) {
      setLoadState('idle');
      return;
    }
    if (!session.workout_id) {
      setExercises(null);
      setLoadState('unavailable');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    getSessionExercises(session.id).then(({ data }) => {
      if (cancelled) return;
      setExercises(data);
      setLoadState(data ? 'loaded' : 'unavailable');
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const date = session ? new Date(session.started_at) : null;
  const dateStr = date?.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const durationMin = session?.duration_sec
    ? session.duration_sec < 60
      ? '<1'
      : Math.round(session.duration_sec / 60)
    : null;

  return (
    <AnimatePresence>
      {session && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-[#111111] pb-safe-bottom"
            style={{ maxHeight: '85dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[#333333]" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-2 pb-4">
              <div className="flex-1 pr-3">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
                  MundoFit
                </p>
                <h2 className="text-[20px] font-black leading-tight text-[#f5f5f5]">
                  {session.workout_id ? session.name : t('deletedWorkout')}
                </h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] text-[#555]">
                  <span>{dateStr}</span>
                  {durationMin != null && (
                    <>
                      <span className="text-[#333]">·</span>
                      <span>{durationMin} min</span>
                    </>
                  )}
                  {session.split_type && (
                    <>
                      <span className="text-[#333]">·</span>
                      <SplitBadge split={session.split_type} />
                    </>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#1e1e1e] text-[#888]"
              >
                <X size={15} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {loadState === 'loading' && (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#aaff00] border-t-transparent" />
                </div>
              )}

              {loadState === 'unavailable' && (
                <p className="py-6 text-center text-[13px] text-[#555]">{t('details.unavailable')}</p>
              )}

              {loadState === 'loaded' && exercises && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                    {t('details.exercises')}
                  </p>
                  <div className="space-y-2">
                    {exercises.map(we => (
                      <div
                        key={we.exercise.id}
                        className="flex items-center gap-3 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-3.5 py-3"
                      >
                        <Dumbbell size={13} className="shrink-0 text-[#444]" />
                        <span className="truncate text-[13px] font-semibold text-[#e5e5e5]">
                          {locale === 'en'
                            ? we.exercise.name_en
                            : locale === 'es'
                              ? we.exercise.name_es
                              : we.exercise.name_ro}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
