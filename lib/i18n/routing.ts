import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ro', 'en', 'es'],
  defaultLocale: 'ro',
  localeDetection: true,
});

export type Locale = (typeof routing.locales)[number];
