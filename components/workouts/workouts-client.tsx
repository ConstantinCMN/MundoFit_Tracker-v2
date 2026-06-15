'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Dumbbell,
  Clock,
  Zap,
  BookOpen,
  ChevronRight,
  Plus,
  TrendingUp,
  Scan,
  MoreVertical,
} from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import type { Workout, WorkoutSession } from '@/types';
import { deleteWorkout } from '@/lib/actions/workouts';
import { Toast } from '@/components/ui/toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type CatKey =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'legs'
  | 'core'
  | 'cardio'
  | 'fullBody';

const CATEGORY_MUSCLE: Record<CatKey, string | null> = {
  chest:     'chest',
  back:      'lats',
  shoulders: 'shoulders',
  arms:      'biceps',
  legs:      'quads',
  core:      'abs',
  cardio:    null,
  fullBody:  null,
};

type WorkoutsClientProps = {
  recentSessions: WorkoutSession[];
  totalSessions: number;
  weekSessions: number;
  workouts: Workout[];
};

type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

// ── Exercise categories ───────────────────────────────────────────────────────

const CATEGORIES: ReadonlyArray<{ key: CatKey; icon: string; color: string }> = [
  { key: 'chest',    icon: '🫁', color: '#aaff00' },
  { key: 'back',     icon: '🏹', color: '#60a5fa' },
  { key: 'shoulders',icon: '🔺', color: '#c084fc' },
  { key: 'arms',     icon: '💪', color: '#fb923c' },
  { key: 'legs',     icon: '🦵', color: '#f87171' },
  { key: 'core',     icon: '⚡', color: '#fbbf24' },
  { key: 'cardio',   icon: '❤️', color: '#f472b6' },
  { key: 'fullBody', icon: '🏆', color: '#34d399' },
];

// ── Animation ─────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-2xl border px-3 py-3 backdrop-blur-sm',
        accent
          ? 'border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.05)]'
          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]'
      )}
    >
      <span
        className={cn(
          'text-[22px] font-black tabular-nums leading-tight',
          accent ? 'text-[#aaff00]' : 'text-[#f5f5f5]'
        )}
      >
        {value}
      </span>
      <span className="mt-0.5 text-center text-[10px] font-medium text-[#555555]">{label}</span>
    </div>
  );
}

// ── Category card ─────────────────────────────────────────────────────────────

function CategoryCard({
  label,
  icon,
  color,
  onClick,
}: {
  label: string;
  icon: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-left backdrop-blur-sm"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[20px]"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <span className="flex-1 text-[13px] font-bold text-[#f5f5f5]">{label}</span>
      <ChevronRight size={14} color="#444444" />
    </motion.button>
  );
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

// ── Recent session mini-card ──────────────────────────────────────────────────

function RecentSessionCard({ session }: { session: WorkoutSession }) {
  const durationMin = session.duration_sec
    ? Math.round(session.duration_sec / 60)
    : null;
  const dateStr = new Date(session.started_at).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex items-center justify-between rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3 backdrop-blur-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-bold text-[#f5f5f5]">{session.name}</p>
        <p className="mt-0.5 text-[11px] text-[#555555]">{dateStr}</p>
      </div>
      <div className="flex items-center gap-2.5">
        {durationMin != null && (
          <span className="text-[12px] font-semibold text-[#666666]">{durationMin}m</span>
        )}
        <div className="h-2 w-2 rounded-full bg-[#aaff00]" />
      </div>
    </div>
  );
}

// ── Quick link card ───────────────────────────────────────────────────────────

function QuickLinkCard({
  icon: Icon,
  label,
  color,
  onClick,
  badge,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  color: string;
  onClick: () => void;
  badge?: string;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-left backdrop-blur-sm transition-colors hover:bg-[rgba(255,255,255,0.05)]"
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}22` }}
      >
        <Icon size={18} color={color} />
      </div>
      <span className="flex-1 text-[13px] font-semibold leading-tight text-[#cccccc]">
        {label}
      </span>
      {badge && (
        <span className="rounded-full bg-[rgba(170,255,0,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#aaff00]">
          {badge}
        </span>
      )}
      <ChevronRight size={14} color="#444444" />
    </motion.button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkoutsClient({
  recentSessions,
  totalSessions,
  weekSessions,
  workouts: initialWorkouts,
}: WorkoutsClientProps) {
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
      {/* ── 1. Quick Start Hero ──────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0)} className="mb-7 px-5 pt-5">
        <div className="rounded-2xl border border-[rgba(170,255,0,0.2)] bg-gradient-to-br from-[rgba(170,255,0,0.07)] to-transparent p-5">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
            MundoFit
          </p>
          <h2 className="mb-4 text-[22px] font-black leading-tight text-[#f5f5f5]">
            {t('start')}
          </h2>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/workouts/generator')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#aaff00] py-3.5 text-[15px] font-black text-[#0a0a0a]"
          >
            <Dumbbell size={18} />
            {t('startQuick')}
          </motion.button>
        </div>
      </motion.section>

      {/* ── 2. Stats row ─────────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.06)} className="mb-7 px-5">
        <div className="grid grid-cols-3 gap-3">
          <StatChip
            label={t('totalSessions')}
            value={String(totalSessions)}
            accent={totalSessions > 0}
          />
          <StatChip label={t('thisWeek')} value={String(weekSessions)} />
          <StatChip label={t('myWorkouts')} value={String(localWorkouts.length)} />
        </div>
      </motion.section>

      {/* ── 3. Exercise Categories ────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.12)} className="mb-7">
        <p className="mb-3 px-5 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {t('categories.title')}
        </p>
        <div className="grid grid-cols-2 gap-3 px-5">
          {CATEGORIES.map(({ key, icon, color }, i) => (
            <motion.div key={key} {...fadeUp(0.12 + i * 0.025)}>
              <CategoryCard
                label={t(`categories.${key}`)}
                icon={icon}
                color={color}
                onClick={() => {
                  const m = CATEGORY_MUSCLE[key];
                  router.push(m ? `/workouts/library?muscle=${m}` : '/workouts/library');
                }}
              />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── 4. My Workouts ───────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.24)} className="mb-7 px-5">
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
              {localWorkouts.slice(0, 5).map(w => (
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

      {/* ── 5. Recent Sessions ───────────────────────────────────────────────── */}
      {recentSessions.length > 0 && (
        <motion.section {...fadeUp(0.30)} className="mb-7 px-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
              {t('recentSessions')}
            </p>
            <button
              onClick={() => router.push('/workouts/history')}
              className="text-[11px] font-semibold text-[#aaff00]/60"
            >
              View all →
            </button>
          </div>
          <div className="space-y-2.5">
            {recentSessions.map(s => (
              <RecentSessionCard key={s.id} session={s} />
            ))}
          </div>
        </motion.section>
      )}

      {/* ── 6. Quick Links ───────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.36)} className="px-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {t('exploreTitle')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <QuickLinkCard
            icon={Clock}
            label={t('history')}
            color="#60a5fa"
            onClick={() => router.push('/workouts/history')}
            badge={totalSessions > 0 ? String(totalSessions) : undefined}
          />
          <QuickLinkCard
            icon={Zap}
            label={t('generator')}
            color="#c084fc"
            onClick={() => router.push('/workouts/generator')}
          />
          <QuickLinkCard
            icon={BookOpen}
            label={t('library')}
            color="#fb923c"
            onClick={() => router.push('/workouts/library')}
          />
          <QuickLinkCard
            icon={Scan}
            label={t('anatomyMap.navLabel')}
            color="#f472b6"
            onClick={() => router.push('/workouts/anatomy')}
          />
        </div>
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
