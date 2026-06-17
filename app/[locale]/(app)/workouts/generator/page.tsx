import { setRequestLocale } from 'next-intl/server';
import { GeneratorClient } from '@/components/workouts/generator-client';

export const dynamic = 'force-dynamic';

export default async function WorkoutGeneratorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ muscles?: string }>;
}) {
  const { locale } = await params;
  const { muscles } = await searchParams;
  setRequestLocale(locale);

  const initialMuscles = muscles ? muscles.split(',').filter(Boolean) : undefined;

  return <GeneratorClient locale={locale} initialMuscles={initialMuscles} />;
}
