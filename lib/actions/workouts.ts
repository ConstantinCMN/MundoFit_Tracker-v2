'use server';

import { createClient } from '@/lib/supabase/server';
import type { Exercise } from '@/lib/actions/exercises';

export type WorkoutExercisePlan = {
  exercise: Exercise;
  sets: number;
  reps: number | null;
  duration_sec: number | null;
  rest_sec: number;
  position: number;
};

export type GeneratedWorkoutPlan = {
  name_ro: string;
  name_en: string;
  name_es: string;
  exercises: WorkoutExercisePlan[];
  estimated_duration_min: number;
  target_muscles: string[];
};

const MUSCLE_RO: Record<string, string> = {
  chest: 'Piept', shoulders: 'Umeri', biceps: 'Biceps', triceps: 'Triceps',
  forearms: 'Antebrațe', abs: 'Abdomen', quads: 'Cvadricepși', calves: 'Gambe',
  traps: 'Trapez', lats: 'Dorsali', lower_back: 'Lombari', glutes: 'Fesieri',
  hamstrings: 'Ischiogambieri',
};
const MUSCLE_EN: Record<string, string> = {
  chest: 'Chest', shoulders: 'Shoulders', biceps: 'Biceps', triceps: 'Triceps',
  forearms: 'Forearms', abs: 'Abs', quads: 'Quads', calves: 'Calves',
  traps: 'Traps', lats: 'Lats', lower_back: 'Lower Back', glutes: 'Glutes',
  hamstrings: 'Hamstrings',
};
const MUSCLE_ES: Record<string, string> = {
  chest: 'Pecho', shoulders: 'Hombros', biceps: 'Bíceps', triceps: 'Tríceps',
  forearms: 'Antebrazos', abs: 'Abdomen', quads: 'Cuádriceps', calves: 'Gemelos',
  traps: 'Trapecios', lats: 'Dorsales', lower_back: 'Lumbar', glutes: 'Glúteos',
  hamstrings: 'Isquiotibiales',
};

const DIFFICULTY_PRIORITY: Record<string, number> = {
  intermediate: 0,
  beginner: 1,
  advanced: 2,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getExercisesForMuscles(
  muscleIds: string[]
): Promise<{ data: GeneratedWorkoutPlan | null; error: string | null }> {
  if (muscleIds.length === 0) return { data: null, error: 'No muscles selected' };

  const supabase = await createClient();

  // Uses idx_exercises_muscle_groups GIN index via the && (overlap) operator
  const { data: relevant, error } = await supabase
    .from('exercises')
    .select('*')
    .overlaps('muscle_groups', muscleIds);

  if (error) return { data: null, error: error.message };
  if (!relevant?.length) return { data: null, error: 'No exercises found for selected muscles' };

  // Per-muscle limit: 3 if 1-2 muscles, 2 otherwise; hard cap 8 total
  const perMuscle = muscleIds.length <= 2 ? 3 : 2;
  const usedIds = new Set<string>();
  const selected: Exercise[] = [];

  for (const muscle of muscleIds) {
    const candidates = shuffle(
      relevant.filter(ex => ex.muscle_groups.includes(muscle) && !usedIds.has(ex.id))
    ).sort(
      (a, b) =>
        (DIFFICULTY_PRIORITY[a.difficulty ?? 'beginner'] ?? 1) -
        (DIFFICULTY_PRIORITY[b.difficulty ?? 'beginner'] ?? 1)
    );

    let taken = 0;
    for (const ex of candidates) {
      if (taken >= perMuscle || selected.length >= 8) break;
      selected.push(ex);
      usedIds.add(ex.id);
      taken++;
    }
  }

  const exercises: WorkoutExercisePlan[] = selected.map((ex, i) => ({
    exercise: ex,
    sets: ex.exercise_type === 'cardio' ? 1 : 3,
    reps: ex.exercise_type === 'cardio' ? null : 10,
    duration_sec: ex.exercise_type === 'cardio' ? 30 : null,
    rest_sec: ex.exercise_type === 'cardio' ? 30 : 60,
    position: i,
  }));

  const estimated_duration_min = Math.max(
    15,
    exercises.reduce(
      (sum, we) => sum + (we.exercise.exercise_type === 'cardio' ? 2 : 3),
      0
    )
  );

  const first3 = muscleIds.slice(0, 3);
  return {
    data: {
      name_ro: `Antrenament ${first3.map(m => MUSCLE_RO[m] ?? m).join(' + ')}`,
      name_en: `${first3.map(m => MUSCLE_EN[m] ?? m).join(' + ')} Workout`,
      name_es: `Entrenamiento ${first3.map(m => MUSCLE_ES[m] ?? m).join(' + ')}`,
      exercises,
      estimated_duration_min,
      target_muscles: muscleIds,
    },
    error: null,
  };
}

export async function saveGeneratedWorkout(
  plan: GeneratedWorkoutPlan,
  locale: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const name =
    locale === 'en' ? plan.name_en : locale === 'es' ? plan.name_es : plan.name_ro;

  // 1. Workout template
  const { data: workout, error: workoutErr } = await supabase
    .from('workouts')
    .insert({
      user_id: user.id,
      name,
      workout_type: 'generated',
      target_muscles: plan.target_muscles,
      estimated_duration_min: plan.estimated_duration_min,
    })
    .select('id')
    .single();

  if (workoutErr) return { error: workoutErr.message };

  // 2. Workout exercises
  const { error: weErr } = await supabase.from('workout_exercises').insert(
    plan.exercises.map(we => ({
      workout_id: workout.id,
      exercise_id: we.exercise.id,
      position: we.position,
      sets: we.sets,
      reps: we.reps,
      duration_sec: we.duration_sec,
      rest_sec: we.rest_sec,
    }))
  );

  if (weErr) return { error: weErr.message };

  // 3. Session — logged immediately as a planned/completed workout
  const now = new Date();
  const durationSec = plan.estimated_duration_min * 60;

  const { error: sessionErr } = await supabase.from('workout_sessions').insert({
    user_id: user.id,
    workout_id: workout.id,
    name,
    started_at: now.toISOString(),
    ended_at: new Date(now.getTime() + durationSec * 1000).toISOString(),
    duration_sec: durationSec,
  });

  if (sessionErr) return { error: sessionErr.message };

  return { error: null };
}

export async function deleteWorkoutSession(
  sessionId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', sessionId)
    .eq('user_id', user.id);

  return { error: error?.message ?? null };
}

export async function deleteWorkout(
  workoutId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('user_id', user.id);

  return { error: error?.message ?? null };
}
