'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Dumbbell, Clock, Calendar, MoreVertical } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import type { WorkoutSession } from '@/types';
import { deleteWorkoutSession } from '@/lib/actions/workouts';
import { Toast } from '@/components/ui/toast';
import { SplitBadge } from '@/components/workouts/split-badge';
import { SessionDetailSheet } from '@/components/workouts/session-detail-sheet';
import { SPLIT_TYPES, SPLIT_ICON, SPLIT_COLOR, type SplitType } from '@/lib/workouts/split-types';

// ── Types ─────────────────────────────────────────────────────────────────────

export type SessionWithSplit = WorkoutSession & {
  split_type: string | null;
  exerciseCount: number;
};

type HistoryStats = {
  total: number;
  thisWeek: number;
  thisMonth: number;
  totalDurationSec: number;
};

type DateFilter = 'all' | 'week' | 'month';
type HistoryFilter = DateFilter | SplitType;

type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

const DATE_FILTERS: DateFilter[] = ['all', 'week', 'month'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTotalTime(totalSec: number): string {
  const totalMin = Math.round(totalSec / 60);
  if (totalMin < 60) return `${totalMin}m`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

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

// ── Filter chip ───────────────────────────────────────────────────────────────

function FilterChip({
  active,
  label,
  icon: Icon,
  color,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: typeof Dumbbell;
  color?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-[12px] font-bold transition-colors',
        active
          ? 'border-transparent bg-[#aaff00] text-[#0a0a0a]'
          : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)] text-[#888888]'
      )}
    >
      {Icon && <Icon size={12} color={active ? '#0a0a0a' : color} />}
      {label}
    </button>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  isActive,
  isDeleting,
  onOpenDetails,
  onToggleMenu,
  onCancel,
  onDelete,
}: {
  session: SessionWithSplit;
  isActive: boolean;
  isDeleting: boolean;
  onOpenDetails: () => void;
  onToggleMenu: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('workouts');
  const th = useTranslations('workouts.historyPage');
  const tc = useTranslations('common');

  const isDeletedWorkout = session.workout_id == null;
  const durationMin = session.duration_sec
    ? session.duration_sec < 60
      ? '<1'
      : Math.round(session.duration_sec / 60)
    : null;
  const date = new Date(session.started_at);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm">
      <div onClick={onOpenDetails} className="cursor-pointer p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-[#f5f5f5]">{session.name}</p>
            <div className="mt-0.5 flex items-center gap-1.5">
              {isDeletedWorkout ? (
                <span className="rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-0.5 text-[10px] font-bold text-[#666666]">
                  {th('deletedWorkout')}
                </span>
              ) : (
                <SplitBadge split={session.split_type} />
              )}
              <p className="text-[11px] text-[#555555]">
                {dateStr} · {timeStr}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-lg border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.08)] px-2.5 py-1">
              <p className="text-[10px] font-bold text-[#aaff00]">Done</p>
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
          </div>
        </div>

        {(durationMin != null || !isDeletedWorkout) && (
          <div className="mt-3 flex items-center gap-4">
            {durationMin != null && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} color="#555555" />
                <span className="text-[12px] text-[#666666]">{durationMin} min</span>
              </div>
            )}
            {!isDeletedWorkout && session.exerciseCount > 0 && (
              <div className="flex items-center gap-1.5">
                <Dumbbell size={12} color="#555555" />
                <span className="text-[12px] text-[#666666]">
                  {t('plan.exercises', { count: session.exerciseCount })}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

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

// ── Empty states ──────────────────────────────────────────────────────────────

function EmptyHistory({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-5 py-10 backdrop-blur-sm">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.03)]">
        <Calendar size={26} color="#333333" />
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold text-[#555555]">No workouts logged yet</p>
        <p className="mt-1.5 max-w-[220px] text-[12px] leading-relaxed text-[#333333]">
          Start your first session to begin tracking your training history
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onStart}
        className="flex items-center gap-2 rounded-xl bg-[#aaff00] px-6 py-3 text-[13px] font-black text-[#0a0a0a]"
      >
        <Dumbbell size={14} />
        Start first workout
      </motion.button>
    </div>
  );
}

function EmptyFilterResult({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-5 py-8 backdrop-blur-sm">
      <Calendar size={22} color="#333333" />
      <p className="text-[13px] font-semibold text-[#555555]">{label}</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function WorkoutHistoryClient({
  sessions: initialSessions,
  stats,
  locale,
}: {
  sessions: SessionWithSplit[];
  stats: HistoryStats;
  locale: string;
}) {
  const t = useTranslations('workouts');
  const th = useTranslations('workouts.historyPage');
  const tt = useTranslations('workoutStart.types');
  const router = useRouter();

  const [localSessions, setLocalSessions] = useState(initialSessions);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [selectedSession, setSelectedSession] = useState<SessionWithSplit | null>(null);

  const { weekStart, monthStart } = useMemo(() => {
    const now = new Date();
    const week = new Date();
    week.setHours(0, 0, 0, 0);
    week.setDate(week.getDate() - week.getDay());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    month.setHours(0, 0, 0, 0);
    return { weekStart: week, monthStart: month };
  }, []);

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return localSessions;
    if (filter === 'week') {
      return localSessions.filter(s => new Date(s.started_at) >= weekStart);
    }
    if (filter === 'month') {
      return localSessions.filter(s => new Date(s.started_at) >= monthStart);
    }
    return localSessions.filter(s => s.split_type === filter);
  }, [localSessions, filter, weekStart, monthStart]);

  async function handleDelete(id: string) {
    setDeletingId(id);

    // Optimistic removal
    const prevSessions = localSessions;
    setLocalSessions(localSessions.filter(s => s.id !== id));

    const { error } = await deleteWorkoutSession(id);

    if (error) {
      setLocalSessions(prevSessions);
      setToast({ message: t('delete.error'), variant: 'error', id: Date.now() });
    } else {
      setToast({ message: t('delete.success'), variant: 'success', id: Date.now() });
    }

    setDeletingId(null);
    setActiveId(null);
  }

  return (
    <div className="pb-6">
      {/* Overview stats */}
      <motion.section {...fadeUp(0)} className="mb-6 px-5 pt-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {th('title')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatChip label={th('overview.total')} value={String(stats.total)} accent={stats.total > 0} />
          <StatChip label={th('overview.thisWeek')} value={String(stats.thisWeek)} />
          <StatChip label={th('overview.thisMonth')} value={String(stats.thisMonth)} />
          <StatChip label={th('overview.totalTime')} value={formatTotalTime(stats.totalDurationSec)} />
        </div>
      </motion.section>

      {/* Filters */}
      <motion.section {...fadeUp(0.04)} className="mb-5">
        <div className="flex gap-2 overflow-x-auto px-5 pb-1">
          {DATE_FILTERS.map(value => (
            <FilterChip
              key={value}
              active={filter === value}
              label={th(`filters.${value}`)}
              onClick={() => setFilter(value)}
            />
          ))}
          {SPLIT_TYPES.map(value => (
            <FilterChip
              key={value}
              active={filter === value}
              label={tt(`${value}.label` as Parameters<typeof tt>[0])}
              icon={SPLIT_ICON[value]}
              color={SPLIT_COLOR[value]}
              onClick={() => setFilter(value)}
            />
          ))}
        </div>
      </motion.section>

      {/* Session list */}
      <motion.section {...fadeUp(0.08)} className="px-5">
        {localSessions.length === 0 ? (
          <EmptyHistory onStart={() => router.push('/body')} />
        ) : filteredSessions.length === 0 ? (
          <EmptyFilterResult label={th('noFilterResults')} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map(session => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.98 }}
                  transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <SessionCard
                    session={session}
                    isActive={activeId === session.id}
                    isDeleting={deletingId === session.id}
                    onOpenDetails={() => setSelectedSession(session)}
                    onToggleMenu={() =>
                      setActiveId(prev => (prev === session.id ? null : session.id))
                    }
                    onCancel={() => setActiveId(null)}
                    onDelete={() => handleDelete(session.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* Session details */}
      <SessionDetailSheet
        session={selectedSession}
        locale={locale}
        onClose={() => setSelectedSession(null)}
      />

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
