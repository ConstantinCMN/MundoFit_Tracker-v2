import { setRequestLocale } from 'next-intl/server';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';

export const dynamic = 'force-dynamic';

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OnboardingWizard locale={locale} />;
}
