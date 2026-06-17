import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { MuscleDetailClient } from '@/components/body/muscle-detail-client';
import type { MuscleId } from '@/components/workouts/muscle-map';

export const dynamic = 'force-dynamic';

const VALID_MUSCLE_IDS: readonly MuscleId[] = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'quads', 'calves',
  'traps', 'lats', 'lower_back', 'glutes', 'hamstrings',
] as const;

export default async function MuscleDetailPage({
  params,
}: {
  params: Promise<{ locale: string; muscle: string }>;
}) {
  const { locale, muscle } = await params;
  setRequestLocale(locale);

  if (!VALID_MUSCLE_IDS.includes(muscle as MuscleId)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return <MuscleDetailClient muscle={muscle as MuscleId} />;
}
