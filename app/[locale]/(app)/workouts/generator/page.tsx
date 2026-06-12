import { setRequestLocale } from 'next-intl/server';
import { GeneratorClient } from '@/components/workouts/generator-client';

export const dynamic = 'force-dynamic';

export default async function WorkoutGeneratorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GeneratorClient locale={locale} />;
}
