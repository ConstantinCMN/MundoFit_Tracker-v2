import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfileAction } from '@/lib/actions/profile';
import { LogFormClient } from '@/components/measurements/log-form-client';

export const dynamic = 'force-dynamic';

export default async function NewMeasurementPage({
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

  const profileResult = await getProfileAction();
  const unitSystem =
    profileResult.success && profileResult.data.unit_system
      ? profileResult.data.unit_system
      : 'metric';

  return <LogFormClient locale={locale} unitSystem={unitSystem} />;
}
