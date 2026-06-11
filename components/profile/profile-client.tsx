'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Check, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { updateProfileAction } from '@/lib/actions/profile';
import { signOutAction } from '@/lib/actions/auth';
import { useRouter } from '@/lib/i18n/navigation';
import {
  calculateBMI,
  calculateTDEE,
  getBMICategory,
  type BMICategory,
} from '@/lib/utils/fitness';
import type {
  Profile,
  ActivityLevel,
  Goal,
  PreferredWorkoutStyle,
  Gender,
} from '@/types';

// ─── Local form state ─────────────────────────────────────────────────────────

interface FormState {
  first_name: string;
  gender: Gender | null;
  age: string;
  height_cm: string;
  weight_kg: string;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
  preferred_workout_style: PreferredWorkoutStyle | null;
}

function profileToForm(p: Profile): FormState {
  return {
    first_name: p.first_name ?? '',
    gender: p.gender,
    age: p.age != null ? String(p.age) : '',
    height_cm: p.height_cm != null ? String(p.height_cm) : '',
    weight_kg: p.weight_kg != null ? String(p.weight_kg) : '',
    activity_level: p.activity_level,
    goal: p.goal,
    preferred_workout_style: p.preferred_workout_style,
  };
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  accent = false,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        accent
          ? 'border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.07)]'
          : 'border-[#1e1e1e] bg-[#111111]',
        className
      )}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
        {label}
      </p>
      <p
        className={cn(
          'text-[22px] font-bold leading-none tabular-nums',
          accent ? 'text-[#aaff00]' : 'text-[#f5f5f5]'
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[12px] text-[#666666]">{sub}</p>}
    </div>
  );
}

// ─── Chip selector ────────────────────────────────────────────────────────────

function ChipSelector<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T | null | undefined;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'rounded-xl border px-3.5 py-2 text-[13px] font-medium transition-all duration-150',
            value === opt.value
              ? 'border-[rgba(170,255,0,0.5)] bg-[rgba(170,255,0,0.1)] text-[#aaff00]'
              : 'border-[#252525] bg-[#111111] text-[#888888] hover:border-[#363636] hover:text-[#c0c0c0]'
          )}
        >
          {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Numeric field ────────────────────────────────────────────────────────────

function NumericField({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  decimal = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  min: number;
  max: number;
  decimal?: boolean;
}) {
  const handleBlur = () => {
    const parsed = decimal ? parseFloat(value) : parseInt(value, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange(decimal ? clamped.toFixed(1) : String(clamped));
    }
  };

  return (
    <div className="flex flex-col">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
        {label}
      </p>
      <div className="relative">
        <input
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          className="w-full rounded-xl border border-[#252525] bg-[#111111] px-3 py-3.5 text-center text-[18px] font-bold text-[#f5f5f5] outline-none transition-all duration-150 tabular-nums focus:border-[rgba(170,255,0,0.4)] focus:shadow-[0_0_0_3px_rgba(170,255,0,0.06)]"
          style={{ paddingRight: `${unit.length * 10 + 12}px` }}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-medium text-[#555555]">
          {unit}
        </span>
      </div>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="mb-4 px-1 text-[10px] font-semibold uppercase tracking-widest text-[#444444]">
        {title}
      </p>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

// ─── Field label ──────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#555555]">
      {children}
    </p>
  );
}

// ─── ProfileClient ────────────────────────────────────────────────────────────

export function ProfileClient({ profile: initialProfile }: { profile: Profile }) {
  const t = useTranslations('profile');
  const router = useRouter();

  const [savedProfile, setSavedProfile] = useState(initialProfile);
  const [form, setForm] = useState<FormState>(() => profileToForm(initialProfile));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const update = (partial: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...partial }));

  const isDirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(profileToForm(savedProfile)),
    [form, savedProfile]
  );

  const isBarVisible = isDirty || showSuccess;

  // Live calculations
  const parsedWeight = parseFloat(form.weight_kg);
  const parsedHeight = parseFloat(form.height_cm);
  const parsedAge = parseInt(form.age, 10);

  const bmi = useMemo(() => {
    if (!parsedWeight || !parsedHeight || isNaN(parsedWeight) || isNaN(parsedHeight)) return null;
    return calculateBMI(parsedWeight, parsedHeight);
  }, [parsedWeight, parsedHeight]);

  const tdee = useMemo(() => {
    if (
      !parsedWeight ||
      !parsedHeight ||
      !parsedAge ||
      isNaN(parsedWeight) ||
      isNaN(parsedHeight) ||
      isNaN(parsedAge) ||
      !form.gender ||
      !form.activity_level
    )
      return null;
    return calculateTDEE(parsedWeight, parsedHeight, parsedAge, form.gender, form.activity_level);
  }, [parsedWeight, parsedHeight, parsedAge, form.gender, form.activity_level]);

  const bmiCategory: BMICategory | null = bmi ? getBMICategory(bmi) : null;

  const bmiCategoryLabels: Record<BMICategory, string> = {
    underweight: t('summary.bmiUnderweight'),
    normal: t('summary.bmiNormal'),
    overweight: t('summary.bmiOverweight'),
    obese: t('summary.bmiObese'),
  };

  const goalLabels: Record<Goal, string> = {
    lose_weight: t('goal.loseWeight'),
    build_muscle: t('goal.buildMuscle'),
    improve_endurance: t('goal.improveEndurance'),
    stay_healthy: t('goal.stayHealthy'),
    athletic_performance: t('goal.athleticPerformance'),
  };

  const activityLabels: Record<ActivityLevel, string> = {
    sedentary: t('activityLevel.sedentary'),
    lightly_active: t('activityLevel.lightlyActive'),
    moderately_active: t('activityLevel.moderatelyActive'),
    very_active: t('activityLevel.veryActive'),
    athlete: t('activityLevel.athlete'),
  };

  // Save handler
  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);

    const age = parseInt(form.age, 10);
    const height = parseFloat(form.height_cm);
    const weight = parseFloat(form.weight_kg);

    if (
      !form.gender ||
      !form.activity_level ||
      !form.goal ||
      !form.preferred_workout_style ||
      isNaN(age) ||
      isNaN(height) ||
      isNaN(weight)
    ) {
      setSaveError('Please fill in all required fields');
      setIsSaving(false);
      return;
    }

    const result = await updateProfileAction({
      first_name: form.first_name,
      gender: form.gender,
      age,
      height_cm: height,
      weight_kg: weight,
      activity_level: form.activity_level,
      goal: form.goal,
      preferred_workout_style: form.preferred_workout_style,
    });

    if (result.success) {
      setSavedProfile(result.data);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } else {
      setSaveError(result.error);
    }

    setIsSaving(false);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOutAction();
    router.push('/login');
  };

  // Option arrays
  const activityOptions: { value: ActivityLevel; label: string; icon: string }[] = [
    { value: 'sedentary', label: t('activityLevel.sedentary'), icon: '🪑' },
    { value: 'lightly_active', label: t('activityLevel.lightlyActive'), icon: '🚶' },
    { value: 'moderately_active', label: t('activityLevel.moderatelyActive'), icon: '🏃' },
    { value: 'very_active', label: t('activityLevel.veryActive'), icon: '🏋️' },
    { value: 'athlete', label: t('activityLevel.athlete'), icon: '🏅' },
  ];

  const goalOptions: { value: Goal; label: string; icon: string }[] = [
    { value: 'lose_weight', label: t('goal.loseWeight'), icon: '🔥' },
    { value: 'build_muscle', label: t('goal.buildMuscle'), icon: '💪' },
    { value: 'improve_endurance', label: t('goal.improveEndurance'), icon: '🫀' },
    { value: 'stay_healthy', label: t('goal.stayHealthy'), icon: '💚' },
    { value: 'athletic_performance', label: t('goal.athleticPerformance'), icon: '🏆' },
  ];

  const workoutStyleOptions: { value: PreferredWorkoutStyle; label: string; icon: string }[] = [
    { value: 'strength', label: t('workoutStyle.strength'), icon: '🏋️' },
    { value: 'cardio', label: t('workoutStyle.cardio'), icon: '🏃' },
    { value: 'hiit', label: t('workoutStyle.hiit'), icon: '⚡' },
    { value: 'flexibility', label: t('workoutStyle.flexibility'), icon: '🧘' },
    { value: 'mixed', label: t('workoutStyle.mixed'), icon: '⚖️' },
  ];

  const initials = (form.first_name || '?').charAt(0).toUpperCase();

  return (
    <div className="pb-44 pt-2">
      {/* ── Avatar + Name ────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center gap-3 px-5 pb-7 pt-5">
        <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border-2 border-[rgba(170,255,0,0.35)] bg-[rgba(170,255,0,0.1)] shadow-[0_0_24px_rgba(170,255,0,0.12)]">
          <span className="text-[30px] font-bold text-[#aaff00]">{initials}</span>
        </div>
        <h2 className="text-[20px] font-bold text-[#f5f5f5]">
          {form.first_name || t('title')}
        </h2>
      </div>

      {/* ── Summary cards ────────────────────────────────────────────────── */}
      <div className="px-5 mb-9">
        {/* TDEE — hero metric, full width */}
        <SummaryCard
          label={t('summary.tdee')}
          value={tdee ? String(tdee) : t('summary.notSet')}
          sub={tdee ? 'kcal' : undefined}
          accent
          className="mb-3"
        />
        {/* 2-column grid */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            label={t('summary.currentWeight')}
            value={parsedWeight > 0 && !isNaN(parsedWeight) ? String(parsedWeight) : t('summary.notSet')}
            sub={parsedWeight > 0 && !isNaN(parsedWeight) ? 'kg' : undefined}
          />
          <SummaryCard
            label={t('summary.bmi')}
            value={bmi ? String(bmi) : t('summary.notSet')}
            sub={bmiCategory ? bmiCategoryLabels[bmiCategory] : undefined}
          />
          <SummaryCard
            label={t('summary.goal')}
            value={form.goal ? goalLabels[form.goal] : t('summary.notSet')}
          />
          <SummaryCard
            label={t('summary.activity')}
            value={form.activity_level ? activityLabels[form.activity_level] : t('summary.notSet')}
          />
        </div>
      </div>

      {/* ── Form ─────────────────────────────────────────────────────────── */}
      <div className="px-5">
        {/* Personal */}
        <Section title={t('sections.identity')}>
          <Input
            label={t('fields.firstName')}
            type="text"
            value={form.first_name}
            onChange={(e) => update({ first_name: e.target.value })}
            autoCapitalize="words"
            autoCorrect="off"
            autoComplete="given-name"
          />
        </Section>

        {/* Physical */}
        <Section title={t('sections.physicalStats')}>
          {/* Gender */}
          <div>
            <FieldLabel>{t('fields.gender')}</FieldLabel>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { value: 'male' as Gender, label: t('gender.male'), icon: '♂' },
                  { value: 'female' as Gender, label: t('gender.female'), icon: '♀' },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => update({ gender: opt.value })}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-2xl border py-3.5 text-[14px] font-semibold transition-all duration-150',
                    form.gender === opt.value
                      ? 'border-[rgba(170,255,0,0.5)] bg-[rgba(170,255,0,0.1)] text-[#aaff00] shadow-[0_0_16px_rgba(170,255,0,0.08)]'
                      : 'border-[#252525] bg-[#111111] text-[#888888] hover:border-[#363636] hover:text-[#c0c0c0]'
                  )}
                >
                  <span className="text-[16px]">{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Age / Height / Weight */}
          <div className="grid grid-cols-3 gap-3">
            <NumericField
              label={t('fields.age')}
              value={form.age}
              onChange={(v) => update({ age: v })}
              unit={t('units.years')}
              min={10}
              max={120}
            />
            <NumericField
              label={t('fields.height')}
              value={form.height_cm}
              onChange={(v) => update({ height_cm: v })}
              unit="cm"
              min={100}
              max={250}
            />
            <NumericField
              label={t('fields.weight')}
              value={form.weight_kg}
              onChange={(v) => update({ weight_kg: v })}
              unit="kg"
              min={30}
              max={300}
              decimal
            />
          </div>
        </Section>

        {/* Training preferences */}
        <Section title={t('sections.preferences')}>
          <div>
            <FieldLabel>{t('fields.activityLevel')}</FieldLabel>
            <ChipSelector
              value={form.activity_level}
              onChange={(v) => update({ activity_level: v })}
              options={activityOptions}
            />
          </div>

          <div>
            <FieldLabel>{t('fields.goal')}</FieldLabel>
            <ChipSelector
              value={form.goal}
              onChange={(v) => update({ goal: v })}
              options={goalOptions}
            />
          </div>

          <div>
            <FieldLabel>{t('fields.workoutStyle')}</FieldLabel>
            <ChipSelector
              value={form.preferred_workout_style}
              onChange={(v) => update({ preferred_workout_style: v })}
              options={workoutStyleOptions}
            />
          </div>
        </Section>

        {/* Account */}
        <Section title={t('sections.account')}>
          <Button
            variant="danger"
            size="md"
            onClick={handleSignOut}
            isLoading={isSigningOut}
            className="w-full"
          >
            <LogOut size={16} />
            {t('actions.signOut')}
          </Button>
        </Section>
      </div>

      {/* ── Save bar (fixed above bottom nav) ─────────────────────────────── */}
      <AnimatePresence>
        {isBarVisible && (
          <motion.div
            key="save-bar"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-none fixed bottom-0 left-0 right-0 z-30"
          >
            <div
              className="pointer-events-auto mx-auto max-w-[430px] px-5"
              style={{
                paddingBottom: 'calc(64px + env(safe-area-inset-bottom, 0px) + 12px)',
              }}
            >
              <div className="bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-8">
                {saveError && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 rounded-xl border border-[rgba(255,68,68,0.25)] bg-[rgba(255,68,68,0.08)] px-4 py-3"
                  >
                    <p className="text-[13px] text-[#ff4444]">{saveError}</p>
                  </motion.div>
                )}

                {showSuccess && !isDirty ? (
                  <div className="flex h-14 items-center justify-center gap-2.5 rounded-2xl border border-[rgba(170,255,0,0.35)] bg-[rgba(170,255,0,0.1)]">
                    <Check size={18} className="text-[#aaff00]" strokeWidth={2.5} />
                    <span className="text-[15px] font-semibold text-[#aaff00]">
                      {t('saved')}
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    size="lg"
                    className="w-full"
                  >
                    {t('saveChanges')}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
