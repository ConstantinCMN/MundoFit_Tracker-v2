import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkoutsClient } from '@/components/workouts/workouts-client';
import type { Workout, WorkoutSession } from '@/types';

export const dynamic = 'force-dynamic';

export default async function WorkoutsPage({
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

  const [{ data: workouts }, { data: recentSessions }, { count: totalCount }] =
    await Promise.all([
      supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(3),
      supabase
        .from('workout_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ]);

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const { count: weekCount } = await supabase
    .from('workout_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('started_at', weekStart.toISOString());

  return (
    <WorkoutsClient
      recentSessions={(recentSessions ?? []) as WorkoutSession[]}
      totalSessions={totalCount ?? 0}
      weekSessions={weekCount ?? 0}
      workouts={(workouts ?? []) as Workout[]}
    />
  );
}
