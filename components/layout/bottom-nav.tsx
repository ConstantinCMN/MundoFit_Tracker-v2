'use client';

import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Home, Scale, PersonStanding, Flame, User } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

const NAV_ITEMS = [
  { key: 'dashboard', href: '/dashboard', Icon: Home },
  { key: 'weight', href: '/weight', Icon: Scale },
  { key: 'body', href: '/body', Icon: PersonStanding },
  { key: 'calories', href: '/calories', Icon: Flame },
  { key: 'profile', href: '/profile', Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-[#2a2a2a] bg-[#0a0a0a]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="app-container flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ key, href, Icon }) => {
          const fullHref = `/${locale}${href}`;
          const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
          const isActive = pathWithoutLocale.startsWith(href);

          return (
            <Link
              key={key}
              href={fullHref}
              prefetch={false}
              className={cn(
                'flex min-w-[60px] flex-col items-center gap-0.5 rounded-xl px-3 py-2',
                'transition-colors duration-150',
                isActive ? 'text-[#aaff00]' : 'text-[#555555] hover:text-[#888888]'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={isActive ? { y: -1, scale: 1.05 } : { y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.75}
                  className={
                    isActive
                      ? 'drop-shadow-[0_0_6px_rgba(170,255,0,0.7)]'
                      : ''
                  }
                />
              </motion.div>
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  isActive ? 'opacity-100' : 'opacity-50'
                )}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
