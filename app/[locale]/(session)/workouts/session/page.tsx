import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkoutSessionClient } from '@/components/workouts/session/workout-session-client';
import type {
  WorkoutSessionInitialData,
  FrozenExercise,
  ExercisePreviousPerformance,
} from '@/components/workouts/session/workout-session-provider';

export const dynamic = 'force-dynamic';

// Raw shape returned by the workout_exercises join.
type RawExerciseRow = {
  id: string;
  exercise_id: string;
  position: number;
  sets: number | null;
  reps: number | null;
  rest_sec: number | null;
  weight_kg: number | null;
  exercises: {
    name_ro: string;
    name_en: string;
    name_es: string;
    muscle_groups: string[];
  } | null;
};

// Raw shape returned by the session_sets + workout_sessions join.
type RawPrevSet = {
  exercise_id: string;
  reps: number | null;
  weight_kg: number | null;
  set_number: number;
  workout_sessions: { started_at: string } | null;
};

export default async function WorkoutSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    workoutId?: string;
    scheduleDay?: string;
    split?: string;
  }>;
}) {
  const { locale } = await params;
  const { workoutId, scheduleDay, split } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  if (!workoutId) redirect(`/${locale}/workouts`);

  const { data: workout } = await supabase
    .from('workouts')
    .select('id, name, split_type, estimated_duration_min')
    .eq('id', workoutId)
    .eq('user_id', user.id)
    .single();

  if (!workout) redirect(`/${locale}/workouts`);

  const { data: rawRows } = await supabase
    .from('workout_exercises')
    .select(
      'id, exercise_id, position, sets, reps, rest_sec, weight_kg, exercises(name_ro, name_en, name_es, muscle_groups)'
    )
    .eq('workout_id', workoutId)
    .order('position', { ascending: true });

  const rows = (rawRows ?? []) as unknown as RawExerciseRow[];

  const nameField: 'name_ro' | 'name_en' | 'name_es' =
    locale === 'ro' ? 'name_ro' : locale === 'es' ? 'name_es' : 'name_en';

  const exercises: FrozenExercise[] = rows.map(row => ({
    workoutExerciseId: row.id,
    exerciseId: row.exercise_id,
    name: row.exercises?.[nameField] ?? '',
    muscleGroups: row.exercises?.muscle_groups ?? [],
    sets: row.sets ?? 3,
    reps: row.reps,
    restSec: row.rest_sec ?? 60,
    position: row.position,
    weightKg: row.weight_kg ?? null,
  }));

  // ── Previous performance ────────────────────────────────────────────────────
  // Fetch the most recent completed set per exercise (across ALL past sessions).
  // RLS on session_sets automatically scopes to the current user's sessions,
  // so no explicit user_id filter is needed beyond authentication.
  const previousPerformance: Record<string, ExercisePreviousPerformance> = {};

  const exerciseIds = exercises.map(ex => ex.exerciseId);

  if (exerciseIds.length > 0) {
    const { data: prevRaw } = await supabase
      .from('session_sets')
      .select('exercise_id, reps, weight_kg, set_number, workout_sessions(started_at)')
      .in('exercise_id', exerciseIds)
      .eq('completed', true);

    if (prevRaw) {
      const prevSets = prevRaw as unknown as RawPrevSet[];

      // Sort: most recent session first, then highest set_number within that session.
      // The first occurrence per exercise_id is therefore the last set of the most
      // recent session — which matches the "latest completed set" requirement.
      prevSets.sort((a, b) => {
        const dateA = a.workout_sessions?.started_at ?? '';
        const dateB = b.workout_sessions?.started_at ?? '';
        if (dateB !== dateA) return dateB.localeCompare(dateA);
        return (b.set_number ?? 0) - (a.set_number ?? 0);
      });

      for (const row of prevSets) {
        if (!previousPerformance[row.exercise_id]) {
          previousPerformance[row.exercise_id] = {
            reps: row.reps,
            weightKg: row.weight_kg,
            sessionDate: row.workout_sessions?.started_at ?? '',
          };
        }
      }
    }
  }

  const initialData: WorkoutSessionInitialData = {
    workoutId: workout.id,
    workoutName: workout.name,
    splitType: split ?? workout.split_type,
    scheduleDayId: scheduleDay ?? null,
    estimatedDurationMin: workout.estimated_duration_min,
    exercises,
    previousPerformance,
  };

  return <WorkoutSessionClient initialData={initialData} />;
}
