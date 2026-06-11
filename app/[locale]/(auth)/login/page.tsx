import { setRequestLocale } from 'next-intl/server';
import { LoginForm } from '@/components/auth/login-form';

export const dynamic = 'force-dynamic';

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LoginForm locale={locale} />;
}
