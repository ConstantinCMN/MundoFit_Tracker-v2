import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { getActiveSchedule } from '@/lib/actions/schedules';
import { ProgramClient } from '@/components/workouts/program-client';

export const dynamic = 'force-dynamic';

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { data, error } = await getActiveSchedule();
  if (error === 'Not authenticated') redirect(`/${locale}/login`);

  return <ProgramClient locale={locale} initial={data} />;
}
