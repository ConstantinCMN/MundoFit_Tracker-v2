
Sprint 8 Release Notes

Tag: sprint-8 (efcaf5a)
Date: 2026-06-15
Branch: main

---
Problems Fixed

1. RangeError: Invalid language tag: favicon.ico

The browser's automatic /favicon.ico request was reaching the app/[locale] dynamic route because the middleware's matcher correctly excluded it but app/[locale] matched favicon.ico as a locale parameter. setRequestLocale("favicon.ico") internally called new Intl.Locale("favicon.ico") which throws a RangeError, crashing every page load on first visit.

Two-layer fix applied:
- Added app/favicon.ico so Next.js intercepts the request at the metadata route level before it reaches any App Router segment.
- Added a locale guard in app/[locale]/layout.tsx that calls notFound() for any value not in routing.locales — defense-in-depth against any other non-locale path that reaches the dynamic segment.

2. __webpack_modules__[moduleId] is not a function — blank page on load

Next.js writes a page_client-reference-manifest.js for each compiled page that lists all client components across the entire (app)/ route group, including sibling pages that may not have been compiled yet. Uncompiled siblings are written with "chunks": [] — a signal meaning "this module is already in a pre-loaded shared bundle."

When BottomNav's <Link> elements triggered automatic prefetch RSC payloads for sibling routes (e.g., /workouts while on /dashboard), the browser resolved those routes' client components against the current page's stale manifest. Seeing chunks: [], it assumed the module was pre-loaded, called __webpack_require__(moduleId), received undefined, and threw "not a function". React's error cascade caused the main content tree to unmount while the fixed-position BottomNav (already painted by CSS) remained visible — producing the blank-page symptom.

Fix: prefetch={false} on all BottomNav <Link> elements. This stops the prefetch from firing, so the stale chunks: [] entries are never acted upon by the browser.

---
Files Modified

┌──────────────────────────────────┬──────────────────────────────────────────────────────────────────────────────────────────────────────┐
│               File               │                                                Change                                                │
├──────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ app/favicon.ico                  │ New file — valid 16×16 32bpp ICO (purple pixel), served by Next.js metadata route handler at         │
│                                  │ /favicon.ico                                                                                         │
├──────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                  │ Added import { notFound } from 'next/navigation' and import type { Locale } from                     │
│ app/[locale]/layout.tsx          │ '@/lib/i18n/routing'; added guard if (!routing.locales.includes(locale as Locale)) notFound() before │
│                                  │  setRequestLocale()                                                                                  │
├──────────────────────────────────┼──────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ components/layout/bottom-nav.tsx │ Added prefetch={false} to the <Link> rendered inside the NAV_ITEMS.map() loop                        │
└──────────────────────────────────┴──────────────────────────────────────────────────────────────────────────────────────────────────────┘

---
Architecture Changes

Metadata route for favicon: app/favicon.ico activates Next.js's next-metadata-image-loader pipeline. This causes icon-mark.js (a Next.js internal client component that signals favicon presence) to appear in the RSC manifests for all pages under app/. It is correctly assigned to the app-pages-internals shared chunk and loads without issue.

BottomNav prefetch disabled: Navigation between the five main app sections (Dashboard, Weight, Workouts, Calories, Profile) is now always a fresh RSC fetch rather than a prefetch. In production after next build, all manifests are generated with correct chunk assignments, so prefetch would be safe — but disabling it removes a latency optimization (~100–200 ms on first nav click) in exchange for correctness in all environments including dev mode.

---
Known Limitations

chunks: [] for sibling client modules is structural, not fixed. Next.js dev mode writes every route group's client components into each page's manifest with chunks: [] when those pages haven't been compiled yet. The manifests are not retroactively updated when sibling pages compile later. This is an incremental compilation characteristic of Next.js dev mode; production builds are unaffected. The prefetch={false} fix prevents this from causing a runtime error but does not eliminate the stale entries from the manifest files.

Browser-console verification requires an authenticated session. Server-side compilation and HTTP status codes were verified programmatically (all five routes returned 200, zero server errors). The __webpack_modules__ error is a browser-console error that requires manual confirmation in DevTools with an authenticated user session.

public/anatomy/preview.html is untracked. This local development file is excluded from the repository and does not affect the build.