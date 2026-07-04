'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Scale } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { calculateTDEE } from '@/lib/utils/fitness';
import type { Profile, Goal, Gender, ActivityLevel } from '@/types';
import type { WeightEntry } from '@/components/dashboard/types';
import { fadeUp } from '@/components/dashboard/ui/animations';
import { SectionHeader } from '@/components/dashboard/ui/section-header';
import { DashboardCard } from '@/components/dashboard/ui/dashboard-card';

// ── getMacros ──────────────────────────────────────────────────────────────────

function getMacros(tdee: number, goal: Goal | null) {
  const ratios: Record<string, { p: number; c: number; f: number }> = {
    lose_weight:          { p: 0.30, c: 0.40, f: 0.30 },
    build_muscle:         { p: 0.35, c: 0.45, f: 0.20 },
    improve_endurance:    { p: 0.20, c: 0.55, f: 0.25 },
    stay_healthy:         { p: 0.25, c: 0.50, f: 0.25 },
    athletic_performance: { p: 0.30, c: 0.50, f: 0.20 },
  };
  const { p, c, f } = (goal ? ratios[goal] : null) ?? ratios.stay_healthy;
  return {
    proteinG:   Math.round((tdee * p) / 4),
    carbsG:     Math.round((tdee * c) / 4),
    fatG:       Math.round((tdee * f) / 9),
    proteinPct: Math.round(p * 100),
    carbsPct:   Math.round(c * 100),
    fatPct:     Math.round(f * 100),
  };
}

// ── MacroBar ───────────────────────────────────────────────────────────────────

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

// ── WeightSparkline ────────────────────────────────────────────────────────────

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
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)]">
          <Scale size={14} color="#333333" />
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-[#444444]">{noDataText}</p>
          <p className="mt-0.5 text-[11px] text-[#333333]">{logFirstText}</p>
        </div>
        <button
          type="button"
          onClick={onLogWeight}
          className="rounded-xl border border-[rgba(170,255,0,0.25)] bg-[rgba(170,255,0,0.06)] px-5 py-2 text-[12px] font-bold text-[#aaff00]"
        >
          + Log weight
        </button>
      </div>
    );
  }

  const W  = 300;
  const H  = 72;
  const PX = 2;
  const PY = 8;
  const weights = data.map(d => d.weight_kg);
  const minW    = Math.min(...weights) - 0.5;
  const maxW    = Math.max(...weights) + 0.5;
  const range   = maxW - minW || 1;

  const xOf = (i: number) => PX + (i / (data.length - 1)) * (W - PX * 2);
  const yOf = (w: number) => PY + ((maxW - w) / range) * (H - PY * 2);
  const pts  = data.map((d, i) => ({ x: xOf(i), y: yOf(d.weight_kg) }));

  const line = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    const prev = pts[i - 1];
    const cx   = ((prev.x + p.x) / 2).toFixed(1);
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
            <stop offset="0%"   stopColor="#aaff00" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#aaff00" stopOpacity="0"    />
          </linearGradient>
        </defs>
        <path d={fill} fill="url(#sparkGrad)" />
        <path d={line} fill="none" stroke="#aaff00" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx={last.x} cy={last.y} r={6} fill="rgba(170,255,0,0.15)" />
        <circle cx={last.x} cy={last.y} r={3} fill="#aaff00" />
      </svg>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-[#444444]">{fmt(data[0].logged_at)}</span>
        <span className="text-[12px] font-black tabular-nums text-[#aaff00]">
          {data[data.length - 1].weight_kg} kg
        </span>
        <span className="text-[10px] text-[#444444]">{fmt(data[data.length - 1].logged_at)}</span>
      </div>
    </div>
  );
}

// ── ProgressSection ────────────────────────────────────────────────────────────

type ProgressSectionProps = {
  profile: Profile;
  weightLogs: WeightEntry[];
};

export function ProgressSection({ profile, weightLogs }: ProgressSectionProps) {
  const t      = useTranslations('dashboard');
  const router = useRouter();

  const weight        = profile.weight_kg ?? 0;
  const height        = profile.height_cm ?? 0;
  const age           = profile.age ?? 0;
  const gender        = (profile.gender ?? 'male') as Gender;
  const activityLevel = (profile.activity_level ?? 'sedentary') as ActivityLevel;
  const goal          = profile.goal as Goal | null;

  const tdee = useMemo(
    () =>
      weight > 0 && height > 0 && age > 0
        ? calculateTDEE(weight, height, age, gender, activityLevel)
        : null,
    [weight, height, age, gender, activityLevel]
  );

  const macros = useMemo(() => (tdee ? getMacros(tdee, goal) : null), [tdee, goal]);

  return (
    <motion.section {...fadeUp(0.15)} className="space-y-6 px-5">
      {/* Calorie / Macro Card */}
      {tdee && macros && (
        <div>
          <SectionHeader label={t('calorie.title')} />
          <DashboardCard accent className="px-5 py-5">
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
          </DashboardCard>
        </div>
      )}

      {/* Weight Chart */}
      <div>
        <SectionHeader
          label={t('chart.title')}
          action={
            weightLogs.length > 0
              ? { label: 'View all', onClick: () => router.push('/weight') }
              : undefined
          }
        />
        <DashboardCard className={`px-4 ${weightLogs.length >= 2 ? 'py-4' : 'py-2'}`}>
          <WeightSparkline
            data={weightLogs}
            noDataText={t('chart.noData')}
            logFirstText={t('chart.logFirst')}
            onLogWeight={() => router.push('/weight')}
          />
        </DashboardCard>
      </div>
    </motion.section>
  );
}
