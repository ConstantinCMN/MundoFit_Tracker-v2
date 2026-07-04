'use server';

import { createClient } from '@/lib/supabase/server';
import { addDays, isSameDay, parseDateOnly } from '@/lib/workouts/schedule-utils';
import type { ScheduleDayType, Workout, WorkoutSchedule, WorkoutScheduleDay } from '@/types';

export type ScheduleDayWithWorkout = WorkoutScheduleDay & {
  workout:
    | (Pick<Workout, 'id' | 'name' | 'estimated_duration_min' | 'split_type'> & {
        exerciseCount: number;
      })
    | null;
  // Derived from workout_sessions — true if this day's workout has a session
  // started on this day's calendar date. Not a stored column.
  completed: boolean;
};

// Shape of the raw embed row before exerciseCount is flattened out of the
// nested workout_exercises(count) aggregate.
type RawScheduleDay = WorkoutScheduleDay & {
  workout:
    | (Pick<Workout, 'id' | 'name' | 'estimated_duration_min' | 'split_type'> & {
        workout_exercises: { count: number }[];
      })
    | null;
};

export type ScheduleWithDays = {
  schedule: WorkoutSchedule;
  days: ScheduleDayWithWorkout[];
};

export async function getActiveSchedule(): Promise<{
  data: ScheduleWithDays | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data: schedule, error: scheduleErr } = await supabase
    .from('workout_schedules')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle();

  if (scheduleErr) return { data: null, error: scheduleErr.message };
  if (!schedule) return { data: null, error: null };

  const { data: days, error: daysErr } = await supabase
    .from('workout_schedule_days')
    .select(
      '*, workout:workouts(id, name, estimated_duration_min, split_type, workout_exercises(count))'
    )
    .eq('schedule_id', schedule.id)
    .order('day_index', { ascending: true });

  if (daysErr) return { data: null, error: daysErr.message };

  const rawDays = (days ?? []) as unknown as RawScheduleDay[];

  // Completion is derived from workout_sessions, not stored — a day counts as
  // done if its attached workout has a session started on that calendar date.
  const workoutIds = rawDays
    .map(d => d.workout_id)
    .filter((id): id is string => id != null);

  const sessionDatesByWorkout = new Map<string, Date[]>();
  if (workoutIds.length > 0) {
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('workout_id, started_at')
      .eq('user_id', user.id)
      .in('workout_id', workoutIds);

    for (const s of sessions ?? []) {
      if (!s.workout_id) continue;
      const list = sessionDatesByWorkout.get(s.workout_id) ?? [];
      list.push(new Date(s.started_at));
      sessionDatesByWorkout.set(s.workout_id, list);
    }
  }

  const scheduleDays: ScheduleDayWithWorkout[] = rawDays.map(d => {
    const dayDate = addDays(parseDateOnly(schedule.start_date), d.day_index);
    const sessionDates = d.workout_id ? sessionDatesByWorkout.get(d.workout_id) ?? [] : [];
    const completed = sessionDates.some(sd => isSameDay(sd, dayDate));
    const { workout_exercises, ...workoutFields } = d.workout ?? {};
    const workout = d.workout
      ? { ...workoutFields, exerciseCount: workout_exercises?.[0]?.count ?? 0 }
      : null;
    return { ...d, workout, completed } as ScheduleDayWithWorkout;
  });

  return {
    data: { schedule, days: scheduleDays },
    error: null,
  };
}

export async function createSchedule(
  startDate: string,
  days: { day_index: number; day_type: ScheduleDayType }[]
): Promise<{ data: { scheduleId: string } | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  // v1 scope: exactly one active schedule per user — retire the old one first.
  const { error: deactivateErr } = await supabase
    .from('workout_schedules')
    .update({ is_active: false })
    .eq('user_id', user.id)
    .eq('is_active', true);

  if (deactivateErr) return { data: null, error: deactivateErr.message };

  const { data: schedule, error: scheduleErr } = await supabase
    .from('workout_schedules')
    .insert({ user_id: user.id, name: 'Program', start_date: startDate, is_active: true })
    .select('id')
    .single();

  if (scheduleErr) return { data: null, error: scheduleErr.message };

  const { error: daysErr } = await supabase.from('workout_schedule_days').insert(
    days.map(d => ({
      schedule_id: schedule.id,
      day_index: d.day_index,
      day_type: d.day_type,
    }))
  );

  if (daysErr) return { data: null, error: daysErr.message };

  return { data: { scheduleId: schedule.id }, error: null };
}

export async function updateScheduleDayType(
  dayId: string,
  dayType: ScheduleDayType
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // Changing a day's type invalidates whatever workout was attached to the old one.
  const { error } = await supabase
    .from('workout_schedule_days')
    .update({ day_type: dayType, workout_id: null })
    .eq('id', dayId);

  return { error: error?.message ?? null };
}

export async function attachWorkoutToScheduleDay(
  dayId: string,
  workoutId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('workout_schedule_days')
    .update({ workout_id: workoutId })
    .eq('id', dayId);

  return { error: error?.message ?? null };
}

export async function deactivateSchedule(scheduleId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('workout_schedules')
    .update({ is_active: false })
    .eq('id', scheduleId)
    .eq('user_id', user.id);

  return { error: error?.message ?? null };
}
