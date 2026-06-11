import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkoutHistoryClient } from '@/components/workouts/workout-history-client';
import type { WorkoutSession } from '@/types';

export const dynamic = 'force-dynamic';

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

  const { data: sessions } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(20);

  const allSessions = (sessions ?? []) as WorkoutSession[];

  const totalVolumeKg = allSessions.reduce(
    (sum, s) => sum + (s.total_volume_kg ?? 0),
    0
  );
  const totalDurationSec = allSessions.reduce(
    (sum, s) => sum + (s.duration_sec ?? 0),
    0
  );
  const avgDurationMin =
    allSessions.length > 0
      ? Math.round(totalDurationSec / allSessions.length / 60)
      : 0;

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const thisWeek = allSessions.filter(
    (s) => new Date(s.started_at) >= weekStart
  ).length;

  return (
    <WorkoutHistoryClient
      sessions={allSessions}
      stats={{
        total: allSessions.length,
        totalVolumeKg: Math.round(totalVolumeKg),
        avgDurationMin,
        thisWeek,
      }}
    />
  );
}
