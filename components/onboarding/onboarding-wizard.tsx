'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { ChevronLeft, Check } from 'lucide-react';

type Translator = ReturnType<typeof useTranslations>;
import { useRouter } from '@/lib/i18n/navigation';
import { completeOnboardingAction } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import type { ActivityLevel, TrainingLocation, Goal, PreferredWorkoutStyle } from '@/types/database';
import type { OnboardingData } from '@/lib/validations/onboarding';

const TOTAL_STEPS = 9;

interface WizardData {
  first_name: string;
  gender?: 'male' | 'female';
  age?: number;
  height_cm?: number;
  weight_kg?: number;
  activity_level?: ActivityLevel;
  training_location?: TrainingLocation;
  goal?: Goal;
  preferred_workout_style?: PreferredWorkoutStyle;
}

function isStepValid(step: number, data: WizardData): boolean {
  switch (step) {
    case 0: return data.first_name.trim().length > 0;
    case 1: return !!data.gender;
    case 2: return !!data.age && data.age >= 10 && data.age <= 120;
    case 3: return !!data.height_cm && data.height_cm >= 50 && data.height_cm <= 300;
    case 4: return !!data.weight_kg && data.weight_kg >= 20 && data.weight_kg <= 500;
    case 5: return !!data.activity_level;
    case 6: return !!data.training_location;
    case 7: return !!data.goal;
    case 8: return !!data.preferred_workout_style;
    default: return false;
  }
}

// ─── Shared SelectionCard ─────────────────────────────────────────────────────

function SelectionCard({
  selected,
  onClick,
  title,
  description,
  icon,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  description?: string;
  icon?: string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl border p-4 text-left transition-all duration-150',
        selected
          ? 'border-[rgba(170,255,0,0.6)] bg-[rgba(170,255,0,0.07)] shadow-[0_0_18px_rgba(170,255,0,0.1)]'
          : 'border-[#2a2a2a] bg-[#111111] hover:border-[#3a3a3a] hover:bg-[#141414]'
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          {icon && (
            <span className="text-xl w-8 flex-shrink-0 text-center">{icon}</span>
          )}
          <div className="min-w-0">
            <p className={cn('text-[15px] font-medium', selected ? 'text-[#f5f5f5]' : 'text-[#d0d0d0]')}>
              {title}
            </p>
            {description && (
              <p className="mt-0.5 text-[13px] text-[#666666] truncate">{description}</p>
            )}
          </div>
        </div>
        <div
          className={cn(
            'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150',
            selected
              ? 'bg-[#aaff00] border-[#aaff00]'
              : 'border-[#3a3a3a] bg-transparent'
          )}
        >
          {selected && <Check size={11} className="text-[#0a0a0a]" strokeWidth={3} />}
        </div>
      </div>
    </motion.button>
  );
}

// ─── NumberInput ──────────────────────────────────────────────────────────────

function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  decimal = false,
  startValue,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  decimal?: boolean;
  startValue?: number;
}) {
  const toStr = (v: number | undefined) =>
    v === undefined ? '' : decimal ? v.toFixed(1) : String(v);

  const [inputStr, setInputStr] = useState(() => toStr(value));

  const clamp = (n: number) =>
    Math.min(max, Math.max(min, decimal ? parseFloat(n.toFixed(1)) : Math.round(n)));

  const base = () => value ?? startValue ?? min;

  const dec = () => {
    const next = clamp(base() - step);
    onChange(next);
    setInputStr(toStr(next));
  };

  const inc = () => {
    const next = clamp(base() + step);
    onChange(next);
    setInputStr(toStr(next));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputStr(raw);
    const parsed = decimal ? parseFloat(raw) : parseInt(raw, 10);
    if (!isNaN(parsed)) onChange(parsed);
  };

  const handleBlur = () => {
    const parsed = decimal ? parseFloat(inputStr) : parseInt(inputStr, 10);
    if (!isNaN(parsed)) {
      const clamped = clamp(parsed);
      onChange(clamped);
      setInputStr(toStr(clamped));
    } else {
      setInputStr(toStr(value));
    }
  };

  return (
    <div className="flex flex-col items-center gap-5 py-4">
      <div className="flex items-center gap-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={dec}
          disabled={(value ?? 0) <= min}
          className="w-16 h-16 rounded-2xl border border-[#2a2a2a] bg-[#111111] flex items-center justify-center text-[28px] text-[#888888] hover:border-[#3a3a3a] hover:text-[#f5f5f5] transition-all disabled:opacity-30 select-none"
          aria-label="Decrease"
        >
          −
        </motion.button>

        <input
          type="text"
          inputMode={decimal ? 'decimal' : 'numeric'}
          value={inputStr}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-36 text-center text-[56px] font-bold text-[#f5f5f5] bg-transparent outline-none tabular-nums leading-none"
        />

        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={inc}
          disabled={(value ?? 0) >= max}
          className="w-16 h-16 rounded-2xl border border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.05)] flex items-center justify-center text-[28px] text-[#aaff00] hover:border-[rgba(170,255,0,0.6)] hover:bg-[rgba(170,255,0,0.1)] transition-all disabled:opacity-30 select-none"
          aria-label="Increase"
        >
          +
        </motion.button>
      </div>

      <span className="text-[15px] font-medium text-[#888888]">{unit}</span>
    </div>
  );
}

// ─── Step content components ──────────────────────────────────────────────────

function StepHeading({ question, hint }: { question: string; hint: string }) {
  return (
    <div className="mb-7">
      <h2 className="text-[26px] font-bold text-[#f5f5f5] leading-tight">{question}</h2>
      <p className="mt-2 text-[15px] text-[#888888]">{hint}</p>
    </div>
  );
}

// Step 0 — Name
function NameStep({
  value,
  onChange,
  t,
}: {
  value: string;
  onChange: (v: string) => void;
  t: Translator;
}) {
  return (
    <div>
      <StepHeading question={t('firstName.question')} hint={t('firstName.hint')} />
      <Input
        label={t('firstName.placeholder')}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
        autoCapitalize="words"
        autoCorrect="off"
        autoComplete="given-name"
      />
    </div>
  );
}

// Step 1 — Gender
function GenderStep({
  value,
  onChange,
  t,
}: {
  value: 'male' | 'female' | undefined;
  onChange: (v: 'male' | 'female') => void;
  t: Translator;
}) {
  return (
    <div>
      <StepHeading question={t('gender.question')} hint={t('gender.hint')} />
      <div className="flex flex-col gap-3">
        <SelectionCard
          selected={value === 'male'}
          onClick={() => onChange('male')}
          title={t('gender.male')}
          icon="♂"
        />
        <SelectionCard
          selected={value === 'female'}
          onClick={() => onChange('female')}
          title={t('gender.female')}
          icon="♀"
        />
      </div>
    </div>
  );
}

// Step 2 — Age
function AgeStep({
  value,
  onChange,
  t,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  t: Translator;
}) {
  return (
    <div>
      <StepHeading question={t('age.question')} hint={t('age.hint')} />
      <NumberInput
        value={value}
        onChange={onChange}
        min={10}
        max={120}
        step={1}
        unit={t('age.unit')}
        startValue={25}
      />
    </div>
  );
}

// Step 3 — Height
function HeightStep({
  value,
  onChange,
  t,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  t: Translator;
}) {
  return (
    <div>
      <StepHeading question={t('height.question')} hint={t('height.hint')} />
      <NumberInput
        value={value}
        onChange={onChange}
        min={100}
        max={250}
        step={1}
        unit={t('height.unitCm')}
        startValue={170}
      />
    </div>
  );
}

// Step 4 — Weight
function WeightStep({
  value,
  onChange,
  t,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  t: Translator;
}) {
  return (
    <div>
      <StepHeading question={t('weight.question')} hint={t('weight.hint')} />
      <NumberInput
        value={value}
        onChange={onChange}
        min={30}
        max={300}
        step={0.5}
        unit={t('weight.unitKg')}
        decimal
        startValue={75}
      />
    </div>
  );
}

// Step 5 — Activity Level
function ActivityStep({
  value,
  onChange,
  t,
}: {
  value: ActivityLevel | undefined;
  onChange: (v: ActivityLevel) => void;
  t: Translator;
}) {
  const options: { value: ActivityLevel; icon: string; label: string; desc: string }[] = [
    { value: 'sedentary', icon: '🪑', label: t('activityLevel.sedentary'), desc: t('activityLevel.sedentaryDesc') },
    { value: 'lightly_active', icon: '🚶', label: t('activityLevel.lightlyActive'), desc: t('activityLevel.lightlyActiveDesc') },
    { value: 'moderately_active', icon: '🏃', label: t('activityLevel.moderatelyActive'), desc: t('activityLevel.moderatelyActiveDesc') },
    { value: 'very_active', icon: '🏋️', label: t('activityLevel.veryActive'), desc: t('activityLevel.veryActiveDesc') },
    { value: 'athlete', icon: '🏅', label: t('activityLevel.athlete'), desc: t('activityLevel.athleteDesc') },
  ];
  return (
    <div>
      <StepHeading question={t('activityLevel.question')} hint={t('activityLevel.hint')} />
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <SelectionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onChange(o.value)}
            title={o.label}
            description={o.desc}
            icon={o.icon}
          />
        ))}
      </div>
    </div>
  );
}

// Step 6 — Training Location
function LocationStep({
  value,
  onChange,
  t,
}: {
  value: TrainingLocation | undefined;
  onChange: (v: TrainingLocation) => void;
  t: Translator;
}) {
  const options: { value: TrainingLocation; icon: string; label: string; desc: string }[] = [
    { value: 'gym', icon: '🏋️', label: t('trainingLocation.gym'), desc: t('trainingLocation.gymDesc') },
    { value: 'home', icon: '🏠', label: t('trainingLocation.home'), desc: t('trainingLocation.homeDesc') },
    { value: 'both', icon: '✨', label: t('trainingLocation.both'), desc: t('trainingLocation.bothDesc') },
  ];
  return (
    <div>
      <StepHeading question={t('trainingLocation.question')} hint={t('trainingLocation.hint')} />
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <SelectionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onChange(o.value)}
            title={o.label}
            description={o.desc}
            icon={o.icon}
          />
        ))}
      </div>
    </div>
  );
}

// Step 7 — Goal
function GoalStep({
  value,
  onChange,
  t,
}: {
  value: Goal | undefined;
  onChange: (v: Goal) => void;
  t: Translator;
}) {
  const options: { value: Goal; icon: string; label: string; desc: string }[] = [
    { value: 'lose_weight', icon: '🔥', label: t('goal.loseWeight'), desc: t('goal.loseWeightDesc') },
    { value: 'build_muscle', icon: '💪', label: t('goal.buildMuscle'), desc: t('goal.buildMuscleDesc') },
    { value: 'improve_endurance', icon: '🫀', label: t('goal.improveEndurance'), desc: t('goal.improveEnduranceDesc') },
    { value: 'stay_healthy', icon: '💚', label: t('goal.stayHealthy'), desc: t('goal.stayHealthyDesc') },
    { value: 'athletic_performance', icon: '🏆', label: t('goal.athleticPerformance'), desc: t('goal.athleticPerformanceDesc') },
  ];
  return (
    <div>
      <StepHeading question={t('goal.question')} hint={t('goal.hint')} />
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <SelectionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onChange(o.value)}
            title={o.label}
            description={o.desc}
            icon={o.icon}
          />
        ))}
      </div>
    </div>
  );
}

// Step 8 — Workout Style
function WorkoutStyleStep({
  value,
  onChange,
  t,
}: {
  value: PreferredWorkoutStyle | undefined;
  onChange: (v: PreferredWorkoutStyle) => void;
  t: Translator;
}) {
  const options: { value: PreferredWorkoutStyle; icon: string; label: string; desc: string }[] = [
    { value: 'strength', icon: '🏋️', label: t('workoutStyle.strength'), desc: t('workoutStyle.strengthDesc') },
    { value: 'cardio', icon: '🏃', label: t('workoutStyle.cardio'), desc: t('workoutStyle.cardioDesc') },
    { value: 'hiit', icon: '⚡', label: t('workoutStyle.hiit'), desc: t('workoutStyle.hiitDesc') },
    { value: 'flexibility', icon: '🧘', label: t('workoutStyle.flexibility'), desc: t('workoutStyle.flexibilityDesc') },
    { value: 'mixed', icon: '⚖️', label: t('workoutStyle.mixed'), desc: t('workoutStyle.mixedDesc') },
  ];
  return (
    <div>
      <StepHeading question={t('workoutStyle.question')} hint={t('workoutStyle.hint')} />
      <div className="flex flex-col gap-2.5">
        {options.map((o) => (
          <SelectionCard
            key={o.value}
            selected={value === o.value}
            onClick={() => onChange(o.value)}
            title={o.label}
            description={o.desc}
            icon={o.icon}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Wizard orchestrator ──────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
};

export function OnboardingWizard({ locale }: { locale: string }) {
  const t = useTranslations('onboarding');
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [data, setData] = useState<WizardData>({ first_name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = (partial: Partial<WizardData>) =>
    setData((prev) => ({ ...prev, ...partial }));

  const canProceed = isStepValid(step, data);

  const handleNext = async () => {
    if (!canProceed) return;

    if (step < TOTAL_STEPS - 1) {
      setDirection(1);
      setStep((s) => s + 1);
      return;
    }

    // Final step — submit
    setIsSubmitting(true);
    setSubmitError(null);
    const result = await completeOnboardingAction(data as OnboardingData, locale);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setSubmitError(result.error);
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <NameStep value={data.first_name} onChange={(v) => update({ first_name: v })} t={t} />;
      case 1:
        return <GenderStep value={data.gender} onChange={(v) => update({ gender: v })} t={t} />;
      case 2:
        return <AgeStep value={data.age} onChange={(v) => update({ age: v })} t={t} />;
      case 3:
        return <HeightStep value={data.height_cm} onChange={(v) => update({ height_cm: v })} t={t} />;
      case 4:
        return <WeightStep value={data.weight_kg} onChange={(v) => update({ weight_kg: v })} t={t} />;
      case 5:
        return <ActivityStep value={data.activity_level} onChange={(v) => update({ activity_level: v })} t={t} />;
      case 6:
        return <LocationStep value={data.training_location} onChange={(v) => update({ training_location: v })} t={t} />;
      case 7:
        return <GoalStep value={data.goal} onChange={(v) => update({ goal: v })} t={t} />;
      case 8:
        return <WorkoutStyleStep value={data.preferred_workout_style} onChange={(v) => update({ preferred_workout_style: v })} t={t} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-dvh bg-[#0a0a0a]">
      {/* Top bar */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              step === 0
                ? 'pointer-events-none opacity-0'
                : 'text-[#888888] hover:text-[#f5f5f5] hover:bg-[#1a1a1a]'
            )}
            aria-label="Back"
          >
            <ChevronLeft size={20} />
          </motion.button>

          <span className="text-sm text-[#666666]">
            {t('stepIndicator', { current: step + 1, total: TOTAL_STEPS })}
          </span>

          <div className="w-9" />
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-[#1a1a1a] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#aaff00]"
            initial={false}
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Scrollable step content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="px-5 pt-4 pb-36"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA — fixed over content */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none">
        <div className="max-w-[430px] mx-auto px-5 pb-8 pointer-events-auto">
          <div className="pt-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent">
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 rounded-xl bg-[rgba(255,68,68,0.08)] border border-[rgba(255,68,68,0.25)] px-4 py-3"
              >
                <p className="text-[13px] text-[#ff4444]">{submitError}</p>
              </motion.div>
            )}

            <Button
              onClick={handleNext}
              disabled={!canProceed}
              isLoading={isSubmitting}
              size="lg"
              className="w-full"
            >
              {step < TOTAL_STEPS - 1 ? t('continue') : t('finish')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
