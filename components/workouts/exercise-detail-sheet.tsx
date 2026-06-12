'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, MapPin, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Exercise } from '@/lib/actions/exercises';
import { cn } from '@/lib/utils/cn';

type Props = {
  exercise: Exercise | null;
  locale: string;
  onClose: () => void;
};

const DIFFICULTY_COLOR: Record<string, string> = {
  beginner:     'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-amber-500/15  text-amber-400  border-amber-500/20',
  advanced:     'bg-red-500/15    text-red-400    border-red-500/20',
};

export function ExerciseDetailSheet({ exercise, locale, onClose }: Props) {
  const t  = useTranslations('workouts.exerciseLibrary');
  const tm = useTranslations('workouts.muscles');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const name = exercise
    ? (locale === 'en' ? exercise.name_en : locale === 'es' ? exercise.name_es : exercise.name_ro)
    : '';

  const description = exercise
    ? (locale === 'en' ? exercise.description_en : locale === 'es' ? exercise.description_es : exercise.description_ro)
    : '';

  const muscleLabel = (id: string) => {
    try { return tm(id as Parameters<typeof tm>[0]); } catch { return id; }
  };

  return (
    <AnimatePresence>
      {exercise && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
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
            className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-3xl bg-[#111111] pb-safe"
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
                  {t('detail.title')}
                </p>
                <h2 className="text-[20px] font-black leading-tight text-[#f5f5f5]">{name}</h2>
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
            <div className="flex-1 overflow-y-auto px-5 pb-8 space-y-5">

              {/* Badges row */}
              <div className="flex flex-wrap gap-2">
                {exercise.difficulty && (
                  <span className={cn(
                    'rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider',
                    DIFFICULTY_COLOR[exercise.difficulty]
                  )}>
                    {t(`difficulty.${exercise.difficulty}` as Parameters<typeof t>[0])}
                  </span>
                )}
                {exercise.location && (
                  <span className="flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-3 py-1 text-[11px] font-semibold text-[#888]">
                    <MapPin size={10} />
                    {t(`location.${exercise.location}` as Parameters<typeof t>[0])}
                  </span>
                )}
                {exercise.is_custom && (
                  <span className="rounded-full border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.08)] px-3 py-1 text-[11px] font-bold text-[#aaff00]">
                    {t('customBadge')}
                  </span>
                )}
              </div>

              {/* Description */}
              {description && (
                <p className="text-[13px] leading-relaxed text-[#888888]">{description}</p>
              )}

              {/* Primary muscles */}
              {exercise.muscle_groups.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                    {t('primaryMuscles')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.muscle_groups.map(m => (
                      <span
                        key={m}
                        className="rounded-full bg-[rgba(170,255,0,0.1)] px-3 py-1 text-[12px] font-semibold text-[#aaff00]"
                      >
                        {muscleLabel(m)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Secondary muscles */}
              {exercise.secondary_muscles && exercise.secondary_muscles.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                    {t('secondaryMuscles')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.secondary_muscles.map(m => (
                      <span
                        key={m}
                        className="rounded-full bg-[rgba(255,255,255,0.05)] px-3 py-1 text-[12px] font-semibold text-[#888]"
                      >
                        {muscleLabel(m)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Equipment */}
              {exercise.equipment.length > 0 && (
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555]">
                    {t('equipmentLabel')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {exercise.equipment.map(eq => (
                      <span
                        key={eq}
                        className="flex items-center gap-1 rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] px-3 py-1 text-[12px] text-[#777]"
                      >
                        <Dumbbell size={10} className="shrink-0" />
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercise type */}
              {exercise.exercise_type && (
                <div className="flex items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)] px-4 py-3">
                  <Zap size={14} className="text-[#aaff00]/60" />
                  <span className="text-[12px] font-semibold capitalize text-[#666]">
                    {exercise.exercise_type}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
