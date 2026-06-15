'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import {
  Scale,
  Activity,
  Dumbbell,
  Flame,
  Droplets,
  BedDouble,
  MoreVertical,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import {
  calculateBMI,
  calculateTDEE,
  getBMICategory,
  type BMICategory,
} from '@/lib/utils/fitness';
import { deleteWorkoutSession } from '@/lib/actions/workouts';
import { Toast } from '@/components/ui/toast';
import type { Profile, Goal, ActivityLevel, Gender, WorkoutSession } from '@/types';

type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

type WeightEntry = { weight_kg: number; logged_at: string };

// ── Animation ─────────────────────────────────────────────────────────────────

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

// ── Macro ratios by goal ──────────────────────────────────────────────────────

function getMacros(tdee: number, goal: Goal | null) {
  const ratios: Record<string, { p: number; c: number; f: number }> = {
    lose_weight: { p: 0.30, c: 0.40, f: 0.30 },
    build_muscle: { p: 0.35, c: 0.45, f: 0.20 },
    improve_endurance: { p: 0.20, c: 0.55, f: 0.25 },
    stay_healthy: { p: 0.25, c: 0.50, f: 0.25 },
    athletic_performance: { p: 0.30, c: 0.50, f: 0.20 },
  };
  const { p, c, f } = (goal ? ratios[goal] : null) ?? ratios.stay_healthy;
  return {
    proteinG: Math.round((tdee * p) / 4),
    carbsG: Math.round((tdee * c) / 4),
    fatG: Math.round((tdee * f) / 9),
    proteinPct: Math.round(p * 100),
    carbsPct: Math.round(c * 100),
    fatPct: Math.round(f * 100),
  };
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  unitColor,
  accent = false,
  compact = false,
}: {
  label: string;
  value: string;
  unit?: string;
  unitColor?: string;
  accent?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-4 backdrop-blur-sm',
        accent
          ? 'border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.05)]'
          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]'
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
        {label}
      </p>
      <p
        className={cn(
          'font-bold tabular-nums leading-tight',
          compact ? 'text-[14px]' : 'text-[22px] leading-none',
          accent ? 'text-[#aaff00]' : 'text-[#f5f5f5]'
        )}
      >
        {value}
      </p>
      {unit && (
        <p className="mt-1.5 text-[11px]" style={{ color: unitColor ?? '#666666' }}>
          {unit}
        </p>
      )}
    </div>
  );
}

// ── Macro bar ─────────────────────────────────────────────────────────────────

function MacroBar({
  label,
  grams,
  pct,
  color,
  delay,
}: {
  label: string;
  grams: number;
  pct: number;
  color: string;
  delay: number;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1.5 flex items-baseline justify-between gap-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#555555]">
          {label}
        </span>
        <span className="shrink-0 text-[13px] font-bold tabular-nums" style={{ color }}>
          {grams}g
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[rgba(255,255,255,0.07)]">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, delay, ease: 'easeOut' }}
        />
      </div>
      <p className="mt-1 text-[10px] text-[#444444]">{pct}%</p>
    </div>
  );
}

// ── Weight sparkline (pure SVG) ───────────────────────────────────────────────

function WeightSparkline({
  data,
  noDataText,
  logFirstText,
  onLogWeight,
}: {
  data: WeightEntry[];
  noDataText: string;
  logFirstText: string;
  onLogWeight: () => void;
}) {
  if (data.length < 2) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
          <Scale size={20} color="#333333" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-[#444444]">{noDataText}</p>
          <p className="mt-0.5 text-[11px] text-[#333333]">{logFirstText}</p>
        </div>
        <button
          onClick={onLogWeight}
          className="mt-1 rounded-xl border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.06)] px-5 py-2 text-[12px] font-bold text-[#aaff00]"
        >
          + Log weight
        </button>
      </div>
    );
  }

  const W = 300;
  const H = 72;
  const PX = 2;
  const PY = 8;
  const weights = data.map((d) => d.weight_kg);
  const minW = Math.min(...weights) - 0.5;
  const maxW = Math.max(...weights) + 0.5;
  const range = maxW - minW || 1;

  const xOf = (i: number) => PX + (i / (data.length - 1)) * (W - PX * 2);
  const yOf = (w: number) => PY + ((maxW - w) / range) * (H - PY * 2);
  const pts = data.map((d, i) => ({ x: xOf(i), y: yOf(d.weight_kg) }));

  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx = ((prev.x + p.x) / 2).toFixed(1);
    return `${acc} C ${cx},${prev.y.toFixed(1)} ${cx},${p.y.toFixed(1)} ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }, '');

  const last = pts[pts.length - 1];
  const fill = `${line} L ${last.x.toFixed(1)},${H} L ${pts[0].x.toFixed(1)},${H} Z`;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" height={72} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#aaff00" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#aaff00" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#sparkGrad)" />
        <path
          d={line}
          fill="none"
          stroke="#aaff00"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx={last.x} cy={last.y} r={6} fill="rgba(170,255,0,0.15)" />
        <circle cx={last.x} cy={last.y} r={3} fill="#aaff00" />
      </svg>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-[#444444]">{fmt(data[0].logged_at)}</span>
        <span className="text-[12px] font-black tabular-nums text-[#aaff00]">
          {data[data.length - 1].weight_kg} kg
        </span>
        <span className="text-[10px] text-[#444444]">
          {fmt(data[data.length - 1].logged_at)}
        </span>
      </div>
    </div>
  );
}

// ── Circular goal ring ────────────────────────────────────────────────────────

function GoalRing({
  pct = 0,
  color,
  size = 52,
  strokeWidth = 4,
}: {
  pct?: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const clampedPct = Math.min(Math.max(pct, 0), 100);
  const offset = circ * (1 - clampedPct / 100);

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
      />
    </svg>
  );
}

// ── Daily goal card ───────────────────────────────────────────────────────────

function DailyGoalCard({
  icon: Icon,
  label,
  target,
  color,
  delay,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  target: string;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="flex flex-col items-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-2 py-4 backdrop-blur-sm"
    >
      <div className="relative">
        <GoalRing pct={0} color={color} size={52} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={16} color={color} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-bold text-[#bbbbbb]">{label}</p>
        <p className="text-[9px] leading-tight text-[#444444]">{target}</p>
      </div>
    </motion.div>
  );
}

// ── Session stat chip ─────────────────────────────────────────────────────────

function SessionStatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-3 backdrop-blur-sm">
      <span className="text-[20px] font-black tabular-nums leading-tight text-[#f5f5f5]">
        {value}
      </span>
      <span className="mt-0.5 text-center text-[10px] font-medium text-[#555555]">{label}</span>
    </div>
  );
}

// ── Dashboard session card ─────────────────────────────────────────────────────

function DashboardSessionCard({
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
  const tw = useTranslations('workouts');
  const tc = useTranslations('common');

  const durationMin = session.duration_sec ? Math.round(session.duration_sec / 60) : null;
  const date = new Date(session.started_at);
  const dateStr = date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

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
                {tw('delete.confirm')}
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

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardClient({
  profile,
  hour,
  dateStr,
  weightLogs,
  recentSessions: initialSessions,
  totalSessions: initialTotal,
  weekSessions: initialWeek,
}: {
  profile: Profile;
  hour: number;
  dateStr: string;
  weightLogs: WeightEntry[];
  recentSessions: WorkoutSession[];
  totalSessions: number;
  weekSessions: number;
}) {
  const t = useTranslations('dashboard');
  const tw = useTranslations('workouts');
  const router = useRouter();

  const [localSessions, setLocalSessions] = useState(initialSessions);
  const [localTotal, setLocalTotal] = useState(initialTotal);
  const [localWeek, setLocalWeek] = useState(initialWeek);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }, []);

  const avgDurationMin = useMemo(() => {
    if (!localSessions.length) return 0;
    const total = localSessions.reduce((s, sess) => s + (sess.duration_sec ?? 0), 0);
    return Math.round(total / localSessions.length / 60);
  }, [localSessions]);

  async function handleDeleteSession(session: WorkoutSession) {
    setDeletingId(session.id);

    const prevSessions = localSessions;
    const prevTotal = localTotal;
    const prevWeek = localWeek;
    const wasThisWeek = new Date(session.started_at) >= weekStart;

    setLocalSessions(localSessions.filter(s => s.id !== session.id));
    setLocalTotal(prevTotal - 1);
    if (wasThisWeek) setLocalWeek(prevWeek - 1);

    const { error } = await deleteWorkoutSession(session.id);

    if (error) {
      setLocalSessions(prevSessions);
      setLocalTotal(prevTotal);
      setLocalWeek(prevWeek);
      setToast({ message: tw('delete.error'), variant: 'error', id: Date.now() });
    } else {
      setToast({ message: tw('delete.success'), variant: 'success', id: Date.now() });
    }

    setDeletingId(null);
    setActiveId(null);
  }

  const greetingKey: 'morning' | 'afternoon' | 'evening' =
    hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';

  const greetings = {
    morning: t('greeting.morning'),
    afternoon: t('greeting.afternoon'),
    evening: t('greeting.evening'),
  };

  const weight = profile.weight_kg ?? 0;
  const height = profile.height_cm ?? 0;
  const age = profile.age ?? 0;
  const gender = (profile.gender ?? 'male') as Gender;
  const activityLevel = (profile.activity_level ?? 'sedentary') as ActivityLevel;
  const goal = profile.goal as Goal | null;

  const bmi = useMemo(
    () => (weight > 0 && height > 0 ? calculateBMI(weight, height) : null),
    [weight, height]
  );

  const tdee = useMemo(
    () =>
      weight > 0 && height > 0 && age > 0
        ? calculateTDEE(weight, height, age, gender, activityLevel)
        : null,
    [weight, height, age, gender, activityLevel]
  );

  const bmiCategory: BMICategory | null = bmi ? getBMICategory(bmi) : null;

  const macros = useMemo(() => (tdee ? getMacros(tdee, goal) : null), [tdee, goal]);

  const bmiColors: Record<BMICategory, string> = {
    underweight: '#60a5fa',
    normal: '#aaff00',
    overweight: '#fbbf24',
    obese: '#f87171',
  };

  const bmiCategoryLabels: Record<BMICategory, string> = {
    underweight: t('bmiLabel.underweight'),
    normal: t('bmiLabel.normal'),
    overweight: t('bmiLabel.overweight'),
    obese: t('bmiLabel.obese'),
  };

  const goalLabels: Record<Goal, string> = {
    lose_weight: t('goalLabel.loseWeight'),
    build_muscle: t('goalLabel.buildMuscle'),
    improve_endurance: t('goalLabel.improveEndurance'),
    stay_healthy: t('goalLabel.stayHealthy'),
    athletic_performance: t('goalLabel.athleticPerformance'),
  };

  const goalIcons: Record<Goal, string> = {
    lose_weight: '🔥',
    build_muscle: '💪',
    improve_endurance: '🫀',
    stay_healthy: '💚',
    athletic_performance: '🏆',
  };

  const motivationalMessages: Record<Goal, string> = {
    lose_weight: t('hero.motivational.loseWeight'),
    build_muscle: t('hero.motivational.buildMuscle'),
    improve_endurance: t('hero.motivational.improveEndurance'),
    stay_healthy: t('hero.motivational.stayHealthy'),
    athletic_performance: t('hero.motivational.athleticPerformance'),
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: 'Sedentary',
    lightly_active: 'Light',
    moderately_active: 'Moderate',
    very_active: 'Very Active',
    athlete: 'Athlete',
  };

  const quickActions = [
    { key: 'updateWeight', Icon: Scale, color: '#aaff00', path: '/weight' },
    { key: 'viewProgress', Icon: Activity, color: '#60a5fa', path: '/measurements' },
    { key: 'startWorkout', Icon: Dumbbell, color: '#c084fc', path: '/workouts' },
    { key: 'nutrition', Icon: Flame, color: '#fb923c', path: '/calories' },
  ] as const;

  const notSet = t('primaryStats.notSet');

  return (
    <div className="pb-24">
      {/* ── 1. Welcome Hero ──────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0)} className="mb-7 px-5 pt-5">
        <div className="mb-4 flex items-center gap-4">
          {/* Avatar with glow */}
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-full bg-[#aaff00] opacity-20 blur-lg" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full border-2 border-[rgba(170,255,0,0.4)] bg-[rgba(170,255,0,0.08)]">
              <span className="text-[22px] font-black text-[#aaff00]">
                {(profile.first_name ?? '?').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[#444444]">{dateStr}</p>
            <h1 className="text-[20px] font-black leading-snug text-[#f5f5f5]">
              {greetings[greetingKey]}, {profile.first_name ?? ''} 👋
            </h1>
          </div>
        </div>

        {goal && (
          <div className="rounded-2xl border border-[rgba(170,255,0,0.15)] bg-[rgba(170,255,0,0.04)] px-4 py-3">
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 text-[17px] leading-none">{goalIcons[goal]}</span>
              <p className="text-[13px] font-medium leading-relaxed text-[#aaff00]/80">
                {motivationalMessages[goal]}
              </p>
            </div>
          </div>
        )}
      </motion.section>

      {/* ── 2. Quick Stats 2×2 ───────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.06)} className="mb-7 px-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {t('primaryStats.title')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label={t('primaryStats.weight')}
            value={weight > 0 ? String(weight) : notSet}
            unit={weight > 0 ? 'kg' : undefined}
          />
          <StatCard
            label={t('primaryStats.bmi')}
            value={bmi ? String(bmi) : notSet}
            unit={bmiCategory ? bmiCategoryLabels[bmiCategory] : undefined}
            unitColor={bmiCategory ? bmiColors[bmiCategory] : undefined}
          />
          <StatCard
            label={t('primaryStats.goal')}
            value={goal ? goalLabels[goal] : notSet}
            compact
          />
          <StatCard
            label="Activity"
            value={activityLabels[activityLevel]}
            compact
          />
        </div>
      </motion.section>

      {/* ── 3. Daily Calorie Card ─────────────────────────────────────────────── */}
      {tdee && macros && (
        <motion.section {...fadeUp(0.12)} className="mb-7 px-5">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('calorie.title')}
          </p>
          <div className="rounded-2xl border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.04)] px-5 py-5 backdrop-blur-sm">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-[46px] font-black leading-none tabular-nums text-[#aaff00]">
                  {tdee}
                </p>
                <p className="mt-1 text-[12px] font-medium text-[#555555]">kcal / day</p>
              </div>
              <div className="rounded-xl border border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.08)] px-3 py-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#aaff00]/70">
                  Daily Target
                </p>
              </div>
            </div>
            <div className="flex gap-5">
              <MacroBar
                label={t('calorie.protein')}
                grams={macros.proteinG}
                pct={macros.proteinPct}
                color="#818cf8"
                delay={0.3}
              />
              <MacroBar
                label={t('calorie.carbs')}
                grams={macros.carbsG}
                pct={macros.carbsPct}
                color="#fb923c"
                delay={0.4}
              />
              <MacroBar
                label={t('calorie.fat')}
                grams={macros.fatG}
                pct={macros.fatPct}
                color="#fbbf24"
                delay={0.5}
              />
            </div>
          </div>
        </motion.section>
      )}

      {/* ── 4. Weight Progress Chart ──────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.18)} className="mb-7 px-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('chart.title')}
          </p>
          {weightLogs.length > 0 && (
            <button
              onClick={() => router.push('/weight')}
              className="text-[11px] font-semibold text-[#aaff00]/60"
            >
              View all →
            </button>
          )}
        </div>
        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-4 backdrop-blur-sm">
          <WeightSparkline
            data={weightLogs}
            noDataText={t('chart.noData')}
            logFirstText={t('chart.logFirst')}
            onLogWeight={() => router.push('/weight')}
          />
        </div>
      </motion.section>

      {/* ── 5. Daily Targets ──────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.24)} className="mb-7 px-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {t('dailyGoals.title')}
        </p>
        <div className="grid grid-cols-4 gap-2.5">
          <DailyGoalCard
            icon={Droplets}
            label={t('dailyGoals.water')}
            target={t('dailyGoals.waterTarget')}
            color="#60a5fa"
            delay={0.25}
          />
          <DailyGoalCard
            icon={Flame}
            label="Kcal"
            target={tdee ? `${tdee}` : '—'}
            color="#aaff00"
            delay={0.30}
          />
          <DailyGoalCard
            icon={Dumbbell}
            label={t('dailyGoals.workout')}
            target={t('dailyGoals.workoutTarget')}
            color="#c084fc"
            delay={0.35}
          />
          <DailyGoalCard
            icon={BedDouble}
            label={t('dailyGoals.sleep')}
            target={t('dailyGoals.sleepTarget')}
            color="#f472b6"
            delay={0.40}
          />
        </div>
      </motion.section>

      {/* ── 6. Recent Sessions ───────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.30)} className="mb-7 px-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
            {t('recentSessions.title')}
          </p>
          {localTotal > 0 && (
            <button
              onClick={() => router.push('/workouts/history')}
              className="text-[11px] font-semibold text-[#aaff00]/60"
            >
              View all →
            </button>
          )}
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2.5">
          <SessionStatChip label={tw('totalSessions')} value={String(localTotal)} />
          <SessionStatChip label={tw('thisWeek')} value={String(localWeek)} />
          <SessionStatChip
            label="Avg"
            value={avgDurationMin > 0 ? `${avgDurationMin}m` : '—'}
          />
        </div>

        {localSessions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-5 py-8 backdrop-blur-sm">
            <p className="text-[13px] font-semibold text-[#444444]">
              {t('recentSessions.noSessions')}
            </p>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push('/workouts')}
              className="rounded-xl border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.06)] px-5 py-2.5 text-[12px] font-bold text-[#aaff00]"
            >
              Start a workout
            </motion.button>
          </div>
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
                  <DashboardSessionCard
                    session={session}
                    isActive={activeId === session.id}
                    isDeleting={deletingId === session.id}
                    onToggleMenu={() =>
                      setActiveId(prev => (prev === session.id ? null : session.id))
                    }
                    onCancel={() => setActiveId(null)}
                    onDelete={() => handleDeleteSession(session)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.section>

      {/* ── 7. Quick Actions ──────────────────────────────────────────────────── */}
      <motion.section {...fadeUp(0.36)} className="px-5">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-[#3a3a3a]">
          {t('actions.title')}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(({ key, Icon, color, path }) => (
            <motion.button
              key={key}
              whileTap={{ scale: 0.96 }}
              onClick={() => router.push(path)}
              className="flex items-center gap-3 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-4 text-left backdrop-blur-sm transition-colors hover:border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)]"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${color}22` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <span className="text-[13px] font-semibold leading-tight text-[#cccccc]">
                {t(`actions.${key}`)}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.section>

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
