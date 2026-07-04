'use server';

import { createClient } from '@/lib/supabase/server';
import type { Exercise } from '@/lib/actions/exercises';
import {
  GOAL_SCHEME,
  DIFFICULTY_PRIORITY_BY_LEVEL,
  DEFAULT_GOAL,
  DEFAULT_LEVEL,
  type Goal,
  type ExperienceLevel,
} from '@/lib/workouts/training-goals';
import {
  type SplitType,
  prioritizeMusclesBySplit,
  reconcileSplitForSave,
} from '@/lib/workouts/split-types';

export type WorkoutExercisePlan = {
  exercise: Exercise;
  sets: number;
  reps: number | null;
  duration_sec: number | null;
  rest_sec: number;
  position: number;
  weight_kg: number | null;
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

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function getExercisesForMuscles(
  muscleIds: string[],
  goal: Goal = DEFAULT_GOAL,
  level: ExperienceLevel = DEFAULT_LEVEL,
  split: SplitType | null = null
): Promise<{ data: GeneratedWorkoutPlan | null; error: string | null }> {
  if (muscleIds.length === 0) return { data: null, error: 'No muscles selected' };

  // Split is a recommendation: it reorders candidate slots, it never drops a selected muscle.
  const orderedMuscleIds = prioritizeMusclesBySplit(muscleIds, split);

  const supabase = await createClient();

  // Uses idx_exercises_muscle_groups GIN index via the && (overlap) operator
  const { data: relevant, error } = await supabase
    .from('exercises')
    .select('*')
    .overlaps('muscle_groups', orderedMuscleIds);

  if (error) return { data: null, error: error.message };
  if (!relevant?.length) return { data: null, error: 'No exercises found for selected muscles' };

  const difficultyPriority = DIFFICULTY_PRIORITY_BY_LEVEL[level];

  // Per-muscle limit: 3 if 1-2 muscles, 2 otherwise; hard cap 8 total
  const perMuscle = orderedMuscleIds.length <= 2 ? 3 : 2;
  const usedIds = new Set<string>();
  const selected: Exercise[] = [];

  for (const muscle of orderedMuscleIds) {
    const candidates = shuffle(
      relevant.filter(ex => ex.muscle_groups.includes(muscle) && !usedIds.has(ex.id))
    ).sort(
      (a, b) =>
        (difficultyPriority[a.difficulty ?? 'beginner'] ?? 1) -
        (difficultyPriority[b.difficulty ?? 'beginner'] ?? 1)
    );

    let taken = 0;
    for (const ex of candidates) {
      if (taken >= perMuscle || selected.length >= 8) break;
      selected.push(ex);
      usedIds.add(ex.id);
      taken++;
    }
  }

  const scheme = GOAL_SCHEME[goal];

  const exercises: WorkoutExercisePlan[] = selected.map((ex, i) => ({
    exercise: ex,
    sets: ex.exercise_type === 'cardio' ? 1 : scheme.sets,
    reps: ex.exercise_type === 'cardio' ? null : scheme.reps,
    duration_sec: ex.exercise_type === 'cardio' ? 30 : null,
    rest_sec: ex.exercise_type === 'cardio' ? 30 : scheme.rest_sec,
    position: i,
    weight_kg: null,
  }));

  const estimated_duration_min = Math.max(
    15,
    exercises.reduce(
      (sum, we) => sum + (we.exercise.exercise_type === 'cardio' ? 2 : 3),
      0
    )
  );

  const first3 = orderedMuscleIds.slice(0, 3);
  return {
    data: {
      name_ro: `Antrenament ${first3.map(m => MUSCLE_RO[m] ?? m).join(' + ')}`,
      name_en: `${first3.map(m => MUSCLE_EN[m] ?? m).join(' + ')} Workout`,
      name_es: `Entrenamiento ${first3.map(m => MUSCLE_ES[m] ?? m).join(' + ')}`,
      exercises,
      estimated_duration_min,
      target_muscles: orderedMuscleIds,
    },
    error: null,
  };
}

// Persists the generated plan (workout + its exercises) immediately at generation time,
// before execution starts — so it shows up in My Workouts even if never started.
// Reconstructs a plan from an already-saved workout — used to resume a
// schedule day's workout straight into execution. Reads existing rows only;
// never calls getExercisesForMuscles, so no generation logic is duplicated.
export async function getWorkoutPlanById(
  workoutId: string
): Promise<{ data: GeneratedWorkoutPlan | null; error: string | null }> {
  const supabase = await createClient();

  const { data: workout, error: workoutErr } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', workoutId)
    .single();

  if (workoutErr || !workout) {
    return { data: null, error: workoutErr?.message ?? 'Workout not found' };
  }

  const { data: rows, error: rowsErr } = await supabase
    .from('workout_exercises')
    .select('*, exercise:exercises(*)')
    .eq('workout_id', workoutId)
    .order('position', { ascending: true });

  if (rowsErr) return { data: null, error: rowsErr.message };
  if (!rows?.length) return { data: null, error: 'No exercises found for this workout' };

  type RowWithExercise = {
    exercise: Exercise;
    sets: number | null;
    reps: number | null;
    duration_sec: number | null;
    rest_sec: number | null;
    position: number;
    weight_kg: number | null;
  };
  const typedRows = rows as unknown as RowWithExercise[];

  const exercises: WorkoutExercisePlan[] = typedRows.map(r => ({
    exercise: r.exercise,
    sets: r.sets ?? 0,
    reps: r.reps,
    duration_sec: r.duration_sec,
    rest_sec: r.rest_sec ?? 0,
    position: r.position,
    // Prefills with the weight last saved for this exercise (set in
    // saveWorkoutSession's batch update), so reopening a workout resumes
    // at the last lifted weight instead of blank.
    weight_kg: r.weight_kg,
  }));

  return {
    data: {
      // The saved workout only kept one resolved name (per the locale active
      // at generation time) — reuse it for all three to match the type shape.
      name_ro: workout.name,
      name_en: workout.name,
      name_es: workout.name,
      exercises,
      estimated_duration_min: workout.estimated_duration_min ?? 15,
      target_muscles: workout.target_muscles ?? [],
    },
    error: null,
  };
}

export async function saveGeneratedWorkout(
  plan: GeneratedWorkoutPlan,
  locale: string,
  split: SplitType | null = null
): Promise<{ data: { workoutId: string } | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

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
      split_type: reconcileSplitForSave(plan.target_muscles, split),
      estimated_duration_min: plan.estimated_duration_min,
    })
    .select('id')
    .single();

  if (workoutErr) return { data: null, error: workoutErr.message };

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
      weight_kg: we.weight_kg,
    }))
  );

  if (weErr) return { data: null, error: weErr.message };

  return { data: { workoutId: workout.id }, error: null };
}

export type ExecutedExercise = {
  exerciseId: string;
  position: number;
  sets: number;
  reps: number | null;
  duration_sec: number | null;
  rest_sec: number;
  weight_kg: number | null;
};

// Records a completed execution against an already-saved workout. History reads only
// from workout_sessions, so this is the sole point at which a session row is created.
//
// `executedExercises` is the plan exactly as it stood when the workout started —
// after any Preview deletions — not a re-read of workout_exercises. It's snapshotted
// into session_sets so History/Session Details keep reflecting what was actually
// done even if the original workout template is later edited, trimmed, or deleted.
export async function saveWorkoutSession(
  workoutId: string,
  name: string,
  startedAt: Date,
  durationSec: number,
  executedExercises: ExecutedExercise[] = []
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const endedAt = new Date(startedAt.getTime() + durationSec * 1000);

  // Volume only counts strength exercises with both reps and a logged weight —
  // cardio exercises have null reps and are excluded.
  const totalVolumeKg = executedExercises.reduce((sum, ex) => {
    if (ex.reps == null || ex.weight_kg == null) return sum;
    return sum + ex.sets * ex.reps * ex.weight_kg;
  }, 0);

  const { data: session, error: sessionErr } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      workout_id: workoutId,
      name,
      started_at: startedAt.toISOString(),
      ended_at: endedAt.toISOString(),
      duration_sec: durationSec,
      total_volume_kg: totalVolumeKg,
    })
    .select('id')
    .single();

  if (sessionErr || !session) return { error: sessionErr?.message ?? 'Failed to save session' };

  // One row per executed set, carrying the exercise's position so the executed
  // list can be reconstructed in order later (set_number alone only orders sets
  // within one exercise, not exercises within the session).
  const sessionSetRows = executedExercises.flatMap(ex =>
    Array.from({ length: Math.max(ex.sets, 1) }, (_, i) => ({
      session_id: session.id,
      exercise_id: ex.exerciseId,
      set_number: i + 1,
      position: ex.position,
      reps: ex.reps,
      weight_kg: ex.weight_kg,
      duration_sec: ex.duration_sec,
      rest_sec: ex.rest_sec,
      completed: true,
    }))
  );

  if (sessionSetRows.length > 0) {
    // Best-effort: the session row and its volume are already saved; a failed
    // snapshot write shouldn't surface as a failed workout save.
    await supabase.from('session_sets').insert(sessionSetRows);
  }

  // Persist the weight used this session onto workout_exercises so the next
  // time this workout is opened (getWorkoutPlanById), it prefills with the
  // last lifted weight instead of blank. Best-effort, same reasoning as above.
  const exerciseWeights = executedExercises.filter(ex => ex.weight_kg != null);
  if (exerciseWeights.length > 0) {
    await Promise.all(
      exerciseWeights.map(ex =>
        supabase
          .from('workout_exercises')
          .update({ weight_kg: ex.weight_kg })
          .eq('workout_id', workoutId)
          .eq('exercise_id', ex.exerciseId)
      )
    );
  }

  return { error: null };
}

// Reconstructs the exact exercise list executed in a completed session, from the
// session_sets snapshot taken at save time — independent of the live workout_exercises
// template, so it stays accurate even if that workout is later edited or deleted.
export async function getSessionExercises(
  sessionId: string
): Promise<{ data: WorkoutExercisePlan[] | null; error: string | null }> {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from('session_sets')
    .select('exercise_id, position, reps, duration_sec, rest_sec, weight_kg, exercise:exercises(*)')
    .eq('session_id', sessionId)
    .order('position', { ascending: true });

  if (error) return { data: null, error: error.message };
  if (!rows?.length) return { data: null, error: 'No exercises found for this session' };

  type RowWithExercise = {
    exercise: Exercise;
    exercise_id: string;
    position: number;
    reps: number | null;
    duration_sec: number | null;
    rest_sec: number | null;
    weight_kg: number | null;
  };
  const typedRows = rows as unknown as RowWithExercise[];

  // Each exercise has one row per executed set — collapse to one entry per
  // exercise, using the row count as the executed set total.
  const byExercise = new Map<string, { row: RowWithExercise; sets: number }>();
  for (const row of typedRows) {
    const existing = byExercise.get(row.exercise_id);
    if (existing) existing.sets += 1;
    else byExercise.set(row.exercise_id, { row, sets: 1 });
  }

  const exercises: WorkoutExercisePlan[] = Array.from(byExercise.values())
    .sort((a, b) => a.row.position - b.row.position)
    .map(({ row, sets }) => ({
      exercise: row.exercise,
      sets,
      reps: row.reps,
      duration_sec: row.duration_sec,
      rest_sec: row.rest_sec ?? 0,
      position: row.position,
      weight_kg: row.weight_kg,
    }));

  return { data: exercises, error: null };
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
