'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { useWorkoutSession } from '../workout-session-provider';

// ── Format helpers ────────────────────────────────────────────────────────────

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${sec}s`;
}

function formatVolume(kg: number): string {
  const r = Math.round(kg);
  // Manual thousands separator — avoids locale ambiguity in toLocaleString()
  if (r >= 1000) {
    const thousands = Math.floor(r / 1000);
    const remainder = String(r % 1000).padStart(3, '0');
    return `${thousands},${remainder} kg`;
  }
  return `${r} kg`;
}

function formatWorkoutDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
  });
}

// ── Summary stat card ─────────────────────────────────────────────────────────

type StatCardProps = { label: string; value: string };

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] py-4 px-2">
      <span className="text-[18px] font-black leading-none text-[#f5f5f5]">{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555555]">
        {label}
      </span>
    </div>
  );
}

// ── View ──────────────────────────────────────────────────────────────────────

export function WorkoutSummaryView() {
  const {
    initialData,
    startedAt,
    totalSetsCompleted,
    totalVolumeKg,
    completedDurationSec,
  } = useWorkoutSession();

  const router = useRouter();

  const { workoutName, exercises } = initialData;

  const totalPlannedSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);

  const durationStr   = completedDurationSec != null
    ? formatDuration(completedDurationSec)
    : '--';
  const volumeStr     = formatVolume(totalVolumeKg);
  const setsStr       = `${totalSetsCompleted} / ${totalPlannedSets}`;
  const exercisesStr  = String(exercises.length);
  const dateStr       = startedAt ? formatWorkoutDate(startedAt) : '';

  return (
    <div className="flex min-h-dvh flex-col px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-1 flex-col items-center gap-6"
      >
        {/* ── Hero ── */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.1)]">
            <CheckCircle size={32} color="#aaff00" strokeWidth={1.5} />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#555555]">
              Workout Complete
            </p>
            <h2 className="mt-1 text-[22px] font-black leading-tight text-[#f5f5f5]">
              {workoutName}
            </h2>
            {dateStr && (
              <p className="mt-1 text-[12px] text-[#444444]">{dateStr}</p>
            )}
          </div>
        </div>

        {/* ── Stats grid (2 × 2) ── */}
        <div className="w-full grid grid-cols-2 gap-3">
          <StatCard label="Duration"  value={durationStr} />
          <StatCard label="Volume"    value={volumeStr} />
          <StatCard label="Exercises" value={exercisesStr} />
          <StatCard label="Sets"      value={setsStr} />
        </div>
      </motion.div>

      {/* ── Done CTA ── */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.97 }}
        onClick={() => router.push('/dashboard')}
        className="mt-6 w-full rounded-2xl bg-[#aaff00] py-4 text-[15px] font-black text-[#0a0a0a]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        Done
      </motion.button>
    </div>
  );
}
