'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const ROUTE_TITLE_KEYS: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/weight': 'weight',
  '/workouts': 'workouts',
  '/calories': 'calories',
  '/profile': 'profile',
  '/measurements': 'measurements',
  '/photos': 'photos',
  '/goals': 'goals',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('nav');

  const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';

  const titleKey = Object.entries(ROUTE_TITLE_KEYS).find(([path]) =>
    pathWithoutLocale.startsWith(path)
  )?.[1];

  const title = titleKey ? t(titleKey as Parameters<typeof t>[0]) : '';

  // Show back button on nested routes (more than 1 segment after locale)
  const segments = pathWithoutLocale.split('/').filter(Boolean);
  const isNested = segments.length > 1;

  return (
    <motion.header
      className="fixed left-0 right-0 top-0 z-40 h-12 border-b border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-md"
      initial={false}
    >
      <div className="app-container flex h-full items-center justify-between px-4">
        {/* Left slot — back button */}
        <div className="w-8">
          {isNested && (
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#1a1a1a] active:bg-[#222222]"
              aria-label="Go back"
            >
              <ChevronLeft size={20} className="text-[#f5f5f5]" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Centre — page title */}
        <h1 className="text-[15px] font-semibold text-[#f5f5f5]">{title}</h1>

        {/* Right slot — reserved for contextual actions */}
        <div className="w-8" />
      </div>
    </motion.header>
  );
}
