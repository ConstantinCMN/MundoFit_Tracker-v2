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

  // Compute time-sensitive values server-side to avoid hydration mismatches
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
    />
  );
}
