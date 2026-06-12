import { setRequestLocale } from 'next-intl/server';
import { getExercises } from '@/lib/actions/exercises';
import { ExerciseLibraryClient } from '@/components/workouts/exercise-library-client';

export const dynamic = 'force-dynamic';

export default async function ExerciseLibraryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const exercises = await getExercises();

  return <ExerciseLibraryClient exercises={exercises} locale={locale} />;
}
