'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronRight, Moon, Check, Loader2 } from 'lucide-react';
import { useRouter } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';
import { Toast } from '@/components/ui/toast';
import { SPLIT_TYPES, SPLIT_ICON, SPLIT_COLOR, type SplitType } from '@/lib/workouts/split-types';
import { SCHEDULE_LENGTH_DAYS, addDays, isSameDay, parseDateOnly } from '@/lib/workouts/schedule-utils';
import {
  createSchedule,
  updateScheduleDayType,
  deactivateSchedule,
  getActiveSchedule,
  type ScheduleWithDays,
  type ScheduleDayWithWorkout,
} from '@/lib/actions/schedules';
import type { ScheduleDayType } from '@/types';

const DAY_TYPES: ScheduleDayType[] = [...SPLIT_TYPES, 'rest'];
const REST_COLOR = '#666666';

type ToastState = { message: string; variant: 'success' | 'error'; id: number } | null;

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  };
}

function dayTypeIcon(type: ScheduleDayType) {
  return type === 'rest' ? Moon : SPLIT_ICON[type as SplitType];
}

function dayTypeColor(type: ScheduleDayType): string {
  return type === 'rest' ? REST_COLOR : SPLIT_COLOR[type as SplitType];
}

// ── Day type picker (push/pull/legs/upper/lower/full/custom/rest) ─────────────

function DayTypePicker({
  value,
  onChange,
}: {
  value: ScheduleDayType;
  onChange: (type: ScheduleDayType) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pl-12 pt-3">
      {DAY_TYPES.map(type => {
        const Icon = dayTypeIcon(type);
        const color = dayTypeColor(type);
        const active = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            aria-label={type}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-transparent transition-colors"
            style={active ? { background: color } : { background: `${color}14`, color }}
          >
            <Icon size={14} color={active ? '#0a0a0a' : color} />
          </button>
        );
      })}
    </div>
  );
}

// ── Single day row ─────────────────────────────────────────────────────────────

function DayRow({
  locale,
  dayNumber,
  date,
  isToday,
  dayType,
  workoutName,
  completed,
  showWorkoutStatus,
  expanded,
  onToggleExpand,
  onChangeType,
  onGenerate,
}: {
  locale: string;
  dayNumber: number;
  date: Date;
  isToday: boolean;
  dayType: ScheduleDayType;
  workoutName: string | null;
  completed: boolean;
  showWorkoutStatus: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onChangeType: (type: ScheduleDayType) => void;
  onGenerate: () => void;
}) {
  const t = useTranslations('workouts.program');
  const tt = useTranslations('workoutStart.types');
  const Icon = dayTypeIcon(dayType);
  const color = dayTypeColor(dayType);
  const dateStr = date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
  const typeLabel = tt(`${dayType}.label` as Parameters<typeof tt>[0]);

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <button type="button" onClick={onToggleExpand} className="flex w-full items-center gap-3 text-left">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${color}22` }}
        >
          <Icon size={16} color={color} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-[#f0f0f0]">{t('dayLabel', { n: dayNumber })}</p>
            {isToday && (
              <span className="rounded-full bg-[rgba(170,255,0,0.15)] px-2 py-0.5 text-[10px] font-bold text-[#aaff00]">
                {t('today')}
              </span>
            )}
            {completed && (
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#aaff00]">
                <Check size={10} color="#0a0a0a" strokeWidth={3} />
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] text-[#555]">{dateStr} · {typeLabel}</p>
        </div>
        <ChevronRight
          size={14}
          className={cn('shrink-0 text-[#444] transition-transform', expanded && 'rotate-90')}
        />
      </button>

      {showWorkoutStatus && dayType !== 'rest' && (
        workoutName ? (
          <p className="mt-2 truncate pl-12 text-[12px] font-semibold text-[#aaff00]">{workoutName}</p>
        ) : (
          <button
            type="button"
            onClick={onGenerate}
            className="mt-2 pl-12 text-[12px] font-semibold text-[#aaff00]/70"
          >
            {t('noWorkout')} · {t('generateCta')} →
          </button>
        )
      )}

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <DayTypePicker value={dayType} onChange={onChangeType} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProgramClient({
  locale,
  initial,
}: {
  locale: string;
  initial: ScheduleWithDays | null;
}) {
  const t = useTranslations('workouts.program');
  const router = useRouter();

  const [schedule, setSchedule] = useState(initial);
  const [draftDays, setDraftDays] = useState<ScheduleDayType[]>(() =>
    Array.from({ length: SCHEDULE_LENGTH_DAYS }, () => 'rest' as ScheduleDayType)
  );
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const today = new Date();

  async function handleCreate() {
    setSaving(true);
    const startDate = today.toISOString().slice(0, 10);
    const days = draftDays.map((day_type, day_index) => ({ day_index, day_type }));
    const { error } = await createSchedule(startDate, days);

    if (error) {
      setSaving(false);
      setToast({ message: t('createError'), variant: 'error', id: Date.now() });
      return;
    }

    const { data: refreshed } = await getActiveSchedule();
    setSchedule(refreshed);
    setSaving(false);
    setExpandedIndex(null);
  }

  function handleDraftChange(index: number, type: ScheduleDayType) {
    setDraftDays(prev => prev.map((d, i) => (i === index ? type : d)));
    setExpandedIndex(null);
  }

  async function handleChangeDayType(day: ScheduleDayWithWorkout, newType: ScheduleDayType) {
    if (!schedule) return;
    const prevDays = schedule.days;
    const nextDays = schedule.days.map(d =>
      d.id === day.id
        ? { ...d, day_type: newType, workout_id: null, workout: null, completed: false }
        : d
    );
    setSchedule({ ...schedule, days: nextDays });
    setExpandedIndex(null);

    const { error } = await updateScheduleDayType(day.id, newType);
    if (error) {
      setSchedule({ ...schedule, days: prevDays });
      setToast({ message: t('updateError'), variant: 'error', id: Date.now() });
    }
  }

  async function handleReset() {
    if (!schedule) return;
    setSaving(true);
    const { error } = await deactivateSchedule(schedule.schedule.id);
    setSaving(false);

    if (error) {
      setToast({ message: t('createError'), variant: 'error', id: Date.now() });
      return;
    }
    setSchedule(null);
    setDraftDays(Array.from({ length: SCHEDULE_LENGTH_DAYS }, () => 'rest' as ScheduleDayType));
  }

  function handleGenerate(dayType: ScheduleDayType, dayId: string) {
    if (dayType === 'rest') return;
    router.push(`/body?split=${dayType}&scheduleDay=${dayId}`);
  }

  return (
    <div className="px-5 pb-10 pt-5">
      <motion.div {...fadeUp(0)}>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#aaff00]/60">
          MundoFit
        </p>
        <h2 className="text-[22px] font-black leading-tight text-[#f5f5f5]">{t('title')}</h2>
        <p className="mt-1 text-[13px] text-[#555]">{t('subtitle')}</p>
      </motion.div>

      {!schedule ? (
        <motion.div {...fadeUp(0.05)} className="mt-5">
          <p className="mb-3 text-[12px] font-semibold text-[#888]">{t('createIntro')}</p>
          <div className="space-y-2">
            {draftDays.map((dayType, index) => (
              <DayRow
                key={index}
                locale={locale}
                dayNumber={index + 1}
                date={addDays(today, index)}
                isToday={index === 0}
                dayType={dayType}
                workoutName={null}
                completed={false}
                showWorkoutStatus={false}
                expanded={expandedIndex === index}
                onToggleExpand={() => setExpandedIndex(expandedIndex === index ? null : index)}
                onChangeType={type => handleDraftChange(index, type)}
                onGenerate={() => {}}
              />
            ))}
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={saving}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#aaff00] py-4 text-[16px] font-black text-[#0a0a0a] shadow-[0_0_24px_rgba(170,255,0,0.2)] disabled:opacity-50"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Check size={17} />}
            {t('createCta')}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div {...fadeUp(0.05)} className="mt-5">
          <div className="space-y-2">
            {schedule.days.map(day => {
              const date = addDays(parseDateOnly(schedule.schedule.start_date), day.day_index);
              return (
                <DayRow
                  key={day.id}
                  locale={locale}
                  dayNumber={day.day_index + 1}
                  date={date}
                  isToday={isSameDay(date, today)}
                  dayType={day.day_type}
                  workoutName={day.workout?.name ?? null}
                  completed={day.completed}
                  showWorkoutStatus
                  expanded={expandedIndex === day.day_index}
                  onToggleExpand={() =>
                    setExpandedIndex(expandedIndex === day.day_index ? null : day.day_index)
                  }
                  onChangeType={type => handleChangeDayType(day, type)}
                  onGenerate={() => handleGenerate(day.day_type, day.id)}
                />
              );
            })}
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={saving}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] py-3.5 text-[14px] font-semibold text-[#555] disabled:opacity-50"
          >
            {t('resetCta')}
          </button>
        </motion.div>
      )}

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
