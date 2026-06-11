'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Dumbbell, Clock, TrendingUp, Calendar } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import type { WorkoutSession } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

type HistoryStats = {
  total: number;
  totalVolumeKg: number;
  avgDurationMin: number;
  thisWeek: number;
};

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
      <span className="mt-0.5 text-center text-[10px] font-medium text-[#555555]">
        {label}
      </span>
    </div>
  );
}

// ── Session card ──────────────────────────────────────────────────────────────

function SessionCard({ session }: { session: WorkoutSession }) {
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
    <motion.div
      whileTap={{ scale: 0.99 }}
      className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] p-4 backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold text-[#f5f5f5]">
            {session.name}
          </p>
          <p className="mt-0.5 text-[11px] text-[#555555]">
            {dateStr} · {timeStr}
          </p>
        </div>
        <div className="shrink-0 rounded-lg border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.08)] px-2.5 py-1">
          <p className="text-[10px] font-bold text-[#aaff00]">Done</p>
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
    </motion.div>
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
  sessions,
  stats,
}: {
  sessions: WorkoutSession[];
  stats: HistoryStats;
}) {
  const t = useTranslations('workouts');
  const router = useRouter();

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
        {sessions.length === 0 ? (
          <EmptyHistory onStart={() => router.push('/workouts')} />
        ) : (
          <div className="space-y-3">
            {sessions.map((session, i) => (
              <motion.div key={session.id} {...fadeUp(0.06 + i * 0.04)}>
                <SessionCard session={session} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
