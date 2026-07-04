import { setRequestLocale } from 'next-intl/server';
import { GeneratorClient } from '@/components/workouts/generator-client';
import type { BodyView } from '@/components/workouts/muscle-map';
import { isSplitType } from '@/lib/workouts/split-types';

export const dynamic = 'force-dynamic';

const VALID_VIEWS: BodyView[] = ['front', 'back'];

export default async function WorkoutGeneratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    muscles?: string;
    view?: string;
    split?: string;
    scheduleDay?: string;
    workoutId?: string;
  }>;
}) {
  const { locale } = await params;
  const { muscles, view, split, scheduleDay, workoutId } = await searchParams;
  setRequestLocale(locale);

  const initialMuscles = muscles ? muscles.split(',').filter(Boolean) : undefined;
  const initialView = VALID_VIEWS.includes(view as BodyView) ? (view as BodyView) : undefined;
  const splitValue = split ?? null;
  const initialSplit = isSplitType(splitValue) ? splitValue : undefined;

  return (
    <GeneratorClient
      locale={locale}
      initialMuscles={initialMuscles}
      initialView={initialView}
      initialSplit={initialSplit}
      initialScheduleDayId={scheduleDay}
      initialWorkoutId={workoutId}
    />
  );
}
