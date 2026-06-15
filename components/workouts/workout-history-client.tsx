'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Dumbbell, Clock, TrendingUp, Calendar, MoreVertical } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import type { WorkoutSession } from '@/types';
import { deleteWorkoutSession } from '@/lib/actions/workouts';
import { Toast } from '@/components/ui/toast';

// ── Types ─────────────────────────────────────────────────────────────────────

type HistoryStats = {
  total: number;
  totalVolumeKg: number;
  avgDurationMin: number;
  thisWeek: number;
};

type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function computeStats(sessions: WorkoutSession[]): HistoryStats {
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const totalDurationSec = sessions.reduce((s, sess) => s + (sess.duration_sec ?? 0), 0);
  return {
    total: sessions.length,
    totalVolumeKg: Math.round(sessions.reduce((s, sess) => s + (sess.total_volume_kg ?? 0), 0)),
    avgDurationMin:
      sessions.length > 0 ? Math.round(totalDurationSec / sessions.length / 60) : 0,
    thisWeek: sessions.filter(s => new Date(s.started_at) >= weekStart).length,
  };
}

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

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({
  session,
  isActive,
  isDeleting,
  onToggleMenu,
  onCancel,
  onDelete,
}: {
  session: WorkoutSession;
  isActive: boolean;
  isDeleting: boolean;
  onToggleMenu: () => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('workouts');
  const tc = useTranslations('common');

  const durationMin = session.duration_sec
    ? Math.round(session.duration_sec / 60)
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
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-bold text-[#f5f5f5]">{session.name}</p>
            <p className="mt-0.5 text-[11px] text-[#555555]">
              {dateStr} · {timeStr}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-lg border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.08)] px-2.5 py-1">
              <p className="text-[10px] font-bold text-[#aaff00]">Done</p>
            </div>
            <button
              type="button"
              onClick={onToggleMenu}
              disabled={isDeleting}
              aria-label="More options"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#555555] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[#888888] disabled:opacity-40"
            >
              <MoreVertical size={15} />
            </button>
          </div>
        </div>

        {(durationMin != null || (session.total_volume_kg ?? 0) > 0) && (
          <div className="mt-3 flex items-center gap-4">
            {durationMin != null && (
              <div className="flex items-center gap-1.5">
                <Clock size={12} color="#555555" />
                <span className="text-[12px] text-[#666666]">{durationMin} min</span>
              </div>
            )}
            {(session.total_volume_kg ?? 0) > 0 && (
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} color="#555555" />
                <span className="text-[12px] text-[#666666]">
                  {Math.round(session.total_volume_kg!)} kg
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

// ── Empty state ───────────────────────────────────────────────────────────────

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

// ── Main component ────────────────────────────────────────────────────────────

export function WorkoutHistoryClient({
  sessions: initialSessions,
  stats: initialStats,
}: {
  sessions: WorkoutSession[];
  stats: HistoryStats;
}) {
  const t = useTranslations('workouts');
  const router = useRouter();

  const [localSessions, setLocalSessions] = useState(initialSessions);
  const [stats, setStats] = useState(initialStats);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);

    // Optimistic removal
    const prevSessions = localSessions;
    const nextSessions = localSessions.filter(s => s.id !== id);
    setLocalSessions(nextSessions);
    setStats(computeStats(nextSessions));

    const { error } = await deleteWorkoutSession(id);

    if (error) {
      // Revert
      setLocalSessions(prevSessions);
      setStats(computeStats(prevSessions));
      setToast({ message: t('delete.error'), variant: 'error', id: Date.now() });
    } else {
      setToast({ message: t('delete.success'), variant: 'success', id: Date.now() });
    }

    setDeletingId(null);
    setActiveId(null);
  }

  return (
    <div className="pb-6">
      {/* Stats */}
      <motion.section {...fadeUp(0)} className="mb-7 px-5 pt-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {t('session.historyTitle')}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <StatChip
            label={t('totalSessions')}
            value={String(stats.total)}
            accent={stats.total > 0}
          />
          <StatChip label={t('thisWeek')} value={String(stats.thisWeek)} />
          <StatChip
            label="Avg"
            value={stats.avgDurationMin > 0 ? `${stats.avgDurationMin}m` : '—'}
          />
        </div>
      </motion.section>

      {/* Session list */}
      <motion.section {...fadeUp(0.06)} className="px-5">
        {localSessions.length === 0 ? (
          <EmptyHistory onStart={() => router.push('/workouts')} />
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {localSessions.map(session => (
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
