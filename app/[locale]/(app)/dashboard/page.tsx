import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DashboardClient } from '@/components/dashboard/dashboard-client';
import type { Profile } from '@/types';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (!profile) redirect(`/${locale}/onboarding`);

  const { data: rawWeightLogs } = await supabase
    .from('weight_logs')
    .select('weight_kg, logged_at')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(7);

  // Reverse to chronological order (oldest → newest) for the sparkline
  const weightLogs = [...(rawWeightLogs ?? [])].reverse() as Array<{
    weight_kg: number;
    logged_at: string;
  }>;

  const now = new Date();
  const hour = now.getHours();
  const dateStr = now.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <DashboardClient
      profile={profile as Profile}
      hour={hour}
      dateStr={dateStr}
      weightLogs={weightLogs}
    />
  );
}
