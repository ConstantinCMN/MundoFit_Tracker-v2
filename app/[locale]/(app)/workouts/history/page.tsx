import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkoutHistoryClient, type SessionWithSplit } from '@/components/workouts/workout-history-client';
import type { WorkoutSession } from '@/types';

export const dynamic = 'force-dynamic';

// Shape of the raw embed row before split_type/exerciseCount are flattened out.
// exerciseCount comes from session_sets (the snapshot of what was actually
// executed), not from workouts.workout_exercises — that's the live template,
// which may have had exercises removed in Preview or edited since the session ran.
type RawSessionRow = WorkoutSession & {
  workouts: {
    split_type: string | null;
  } | null;
  session_sets: { exercise_id: string }[];
};

export default async function WorkoutHistoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  // No row cap — Overview Stats and filters need the complete session set,
  // not just a recent slice (that's what the Dashboard's capped list is for).
  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*, workouts(split_type), session_sets(exercise_id)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  const rawSessions = (sessions ?? []) as unknown as RawSessionRow[];

  const allSessions: SessionWithSplit[] = rawSessions.map(({ workouts, session_sets, ...session }) => ({
    ...session,
    split_type: workouts?.split_type ?? null,
    exerciseCount: new Set((session_sets ?? []).map(s => s.exercise_id)).size,
  }));

  const now = new Date();
  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  monthStart.setHours(0, 0, 0, 0);

  const stats = {
    total: allSessions.length,
    thisWeek: allSessions.filter(s => new Date(s.started_at) >= weekStart).length,
    thisMonth: allSessions.filter(s => new Date(s.started_at) >= monthStart).length,
    totalDurationSec: allSessions.reduce((sum, s) => sum + (s.duration_sec ?? 0), 0),
  };

  return <WorkoutHistoryClient sessions={allSessions} stats={stats} locale={locale} />;
}
