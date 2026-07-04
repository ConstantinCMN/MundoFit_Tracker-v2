import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

export default async function SessionLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-dvh bg-[#0a0a0a]">
      <div className="app-container min-h-dvh">
        {children}
      </div>
    </div>
  );
}
