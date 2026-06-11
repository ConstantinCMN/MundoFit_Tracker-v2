import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

export default async function OnboardingLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen min-h-dvh bg-[#0a0a0a] flex flex-col">
      <div className="w-full max-w-[430px] mx-auto flex flex-col flex-1">
        {children}
      </div>
    </div>
  );
}
