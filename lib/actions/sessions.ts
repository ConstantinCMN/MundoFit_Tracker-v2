'use server';

import { createClient } from '@/lib/supabase/server';

export type CreateSessionResult =
  | { sessionId: string }
  | { error: string };

export async function createSession(
  workoutId: string,
  workoutName: string,
  startedAt: string
): Promise<CreateSessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      workout_id: workoutId,
      name: workoutName,
      started_at: startedAt,
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Failed to create session' };
  return { sessionId: data.id };
}

// ── logSet ────────────────────────────────────────────────────────────────────

export type LogSetParams = {
  sessionId: string;
  exerciseId: string;
  setNumber: number;   // 1-indexed within the exercise
  position: number;    // exercise order within the session (from FrozenExercise.position)
  reps: number;
  weightKg: number;
  restSec: number;
};

export type LogSetResult =
  | { id: string }
  | { error: string };

export async function logSet(params: LogSetParams): Promise<LogSetResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('session_sets')
    .insert({
      session_id:  params.sessionId,
      exercise_id: params.exerciseId,
      set_number:  params.setNumber,
      position:    params.position,
      reps:        params.reps,
      weight_kg:   params.weightKg,
      rest_sec:    params.restSec,
      completed:   true,
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Failed to log set' };
  return { id: data.id };
}

// ── completeSession ───────────────────────────────────────────────────────────

export type CompleteSessionResult =
  | { success: true }
  | { error: string };

export async function completeSession(
  sessionId: string,
  endedAt: string,
  durationSec: number,
  totalVolumeKg: number
): Promise<CompleteSessionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Single atomic UPDATE — ended_at, duration_sec, and total_volume_kg together.
  // The .eq('user_id', user.id) is belt-and-suspenders; RLS also enforces ownership.
  const { error } = await supabase
    .from('workout_sessions')
    .update({ ended_at: endedAt, duration_sec: durationSec, total_volume_kg: totalVolumeKg })
    .eq('id', sessionId)
    .eq('user_id', user.id);

  if (error) return { error: error.message };
  return { success: true };
}
