'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Dumbbell, Plus, MoreVertical } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import type { Workout } from '@/types';
import { deleteWorkout } from '@/lib/actions/workouts';
import { Toast } from '@/components/ui/toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type WorkoutsClientProps = {
  workouts: Workout[];
};

type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

// ── Animation ─────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── Workout template card ─────────────────────────────────────────────────────

function WorkoutTemplateCard({
  workout,
  isActive,
  isDeleting,
  onCardClick,
  onToggleMenu,
  onCancel,
  onDelete,
}: {
  workout: Workout;
  isActive: boolean;
  isDeleting: boolean;
  onCardClick: () => void;
  onToggleMenu: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('workouts');
  const tc = useTranslations('common');

  const locationEmoji =
    workout.location === 'gym' ? '🏋️' : workout.location === 'home' ? '🏠' : '⚡';

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onCardClick}
        className="flex w-full cursor-pointer items-center gap-4 px-4 py-4 text-left"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.07)] text-[18px]">
          {locationEmoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-bold text-[#f5f5f5]">{workout.name}</p>
          {workout.estimated_duration_min != null && (
            <p className="mt-0.5 text-[11px] text-[#555555]">
              {workout.estimated_duration_min} min
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onToggleMenu();
          }}
          disabled={isDeleting}
          aria-label="More options"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-[#555555] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#888888] disabled:opacity-40"
        >
          <MoreVertical size={15} />
        </button>
      </motion.div>

      {/* Inline confirm row */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-[rgba(255,255,255,0.06)]"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-[13px] font-semibold text-[#aaaaaa]">
                {t('delete.confirm')}
              </span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-3.5 py-2 text-[12px] font-semibold text-[#666666] disabled:opacity-40"
                >
                  {tc('cancel')}
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/15 px-3.5 py-2 text-[12px] font-bold text-red-400 disabled:opacity-40"
                >
                  {isDeleting && (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                  )}
                  {tc('delete')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Empty workouts state ──────────────────────────────────────────────────────

function EmptyWorkoutsState({
  label,
  hint,
  cta,
  onCta,
}: {
  label: string;
  hint: string;
  cta: string;
  onCta: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-5 py-8 backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]">
        <Dumbbell size={22} color="#333333" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-bold text-[#555555]">{label}</p>
        <p className="mt-1 text-[12px] leading-relaxed text-[#333333]">{hint}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onCta}
        className="flex items-center gap-2 rounded-xl border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.06)] px-5 py-2.5 text-[13px] font-bold text-[#aaff00]"
      >
        <Plus size={14} />
        {cta}
      </motion.button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkoutsClient({ workouts: initialWorkouts }: WorkoutsClientProps) {
  const t = useTranslations('workouts');
  const router = useRouter();

  const [localWorkouts, setLocalWorkouts] = useState(initialWorkouts);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  async function handleDeleteWorkout(id: string) {
    setDeletingId(id);

    // Optimistic removal
    const prevWorkouts = localWorkouts;
    const nextWorkouts = localWorkouts.filter(w => w.id !== id);
    setLocalWorkouts(nextWorkouts);

    const { error } = await deleteWorkout(id);

    if (error) {
      setLocalWorkouts(prevWorkouts);
      setToast({ message: t('delete.error'), variant: 'error', id: Date.now() });
    } else {
      setToast({ message: t('delete.success'), variant: 'success', id: Date.now() });
    }

    setDeletingId(null);
    setActiveId(null);
  }

  return (
    <div className="pb-6">
      {/* My Workouts */}
      <motion.section {...fadeUp(0)} className="px-5 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('myWorkouts')}
          </p>
          {localWorkouts.length > 0 && (
            <button
              onClick={() => router.push('/workouts/generator')}
              className="flex items-center gap-1 text-[11px] font-semibold text-[#aaff00]/70"
            >
              <Plus size={11} />
              {t('create')}
            </button>
          )}
        </div>
        {localWorkouts.length === 0 ? (
          <EmptyWorkoutsState
            label={t('noWorkouts')}
            hint={t('createFirst')}
            cta={t('create')}
            onCta={() => router.push('/workouts/generator')}
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {localWorkouts.map(w => (
                <motion.div
                  key={w.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <WorkoutTemplateCard
                    workout={w}
                    isActive={activeId === w.id}
                    isDeleting={deletingId === w.id}
                    onCardClick={() => router.push('/workouts/generator')}
                    onToggleMenu={() =>
                      setActiveId(prev => (prev === w.id ? null : w.id))
                    }
                    onCancel={() => setActiveId(null)}
                    onDelete={() => handleDeleteWorkout(w.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast
            key={toast.id}
            message={toast.message}
            variant={toast.variant}
            onDismiss={() => setToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
