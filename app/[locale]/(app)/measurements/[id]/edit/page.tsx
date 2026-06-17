import { setRequestLocale } from 'next-intl/server';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMeasurementById } from '@/lib/actions/measurements';
import { getProfileAction } from '@/lib/actions/profile';
import { LogFormClient } from '@/components/measurements/log-form-client';

export const dynamic = 'force-dynamic';

export default async function EditMeasurementPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const [profileResult, { data: entry }] = await Promise.all([
    getProfileAction(),
    getMeasurementById(id),
  ]);

  if (!entry) notFound();

  const unitSystem =
    profileResult.success && profileResult.data.unit_system
      ? profileResult.data.unit_system
      : 'metric';

  return (
    <LogFormClient
      locale={locale}
      unitSystem={unitSystem}
      initialValues={entry}
      entryId={id}
    />
  );
}
