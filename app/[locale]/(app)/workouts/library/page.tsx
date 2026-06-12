import { setRequestLocale } from 'next-intl/server';
import { getExercises } from '@/lib/actions/exercises';
import { ExerciseLibraryClient } from '@/components/workouts/exercise-library-client';

export const dynamic = 'force-dynamic';

export default async function ExerciseLibraryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ muscle?: string }>;
}) {
  const [{ locale }, { muscle }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);

  const exercises = await getExercises();

  return (
    <ExerciseLibraryClient
      exercises={exercises}
      locale={locale}
      initialMuscle={muscle ?? null}
    />
  );
}
