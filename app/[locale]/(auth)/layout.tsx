import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen min-h-dvh bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-[430px]">{children}</div>
    </div>
  );
}
