# MundoFit Tracker V2 — Architecture

## Overview

MundoFit Tracker V2 is a mobile-first fitness tracking application built with Next.js. The application serves Romanian, English, and Spanish speakers and covers the full fitness lifecycle: goal-setting, workout planning, body tracking, and progress photography.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend / DB | Supabase (Postgres + Auth + Storage + Realtime) |
| i18n | next-intl |
| Deployment | Vercel |

---

## Project Structure

```
mundofit-tracker-v2/
├── app/
│   ├── [locale]/                        # Locale-wrapped routes
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (onboarding)/
│   │   │   └── onboarding/
│   │   └── (app)/                       # Protected app shell
│   │       ├── dashboard/
│   │       ├── weight/
│   │       ├── measurements/
│   │       ├── photos/
│   │       ├── calories/
│   │       ├── goals/
│   │       ├── workouts/
│   │       │   ├── library/
│   │       │   ├── generator/
│   │       │   ├── history/
│   │       │   └── [id]/
│   │       └── profile/
│   └── api/
│       └── [...]/                       # Route handlers (server-side only)
├── components/
│   ├── ui/                              # Base design-system components
│   ├── layout/                          # Shell, navigation, header
│   ├── modules/                         # Feature-specific components
│   │   ├── body-map/
│   │   ├── workout/
│   │   ├── weight/
│   │   ├── measurements/
│   │   ├── photos/
│   │   ├── calories/
│   │   ├── goals/
│   │   └── dashboard/
│   └── shared/                          # Cross-module shared components
├── lib/
│   ├── supabase/
│   │   ├── client.ts                    # Browser client
│   │   ├── server.ts                    # Server component client
│   │   └── middleware.ts
│   ├── hooks/                           # Custom React hooks
│   ├── utils/                           # Pure utility functions
│   └── validations/                     # Zod schemas
├── messages/
│   ├── ro.json
│   ├── en.json
│   └── es.json
├── public/
│   ├── body-map/                        # SVG body map assets
│   └── icons/
├── types/                               # Shared TypeScript types
├── middleware.ts                        # Auth + locale routing
├── i18n.ts
└── next.config.ts
```

---

## Routing Strategy

The App Router uses a `[locale]` segment at the top level. `next-intl` middleware intercepts every request, detects or reads the user's locale, and rewrites the path.

```
/              → redirect to /{detected-locale}/dashboard (if authed)
/ro/login      → Romanian login page
/en/dashboard  → English dashboard
/es/workouts   → Spanish workouts
```

Route groups keep the file tree clean:
- `(auth)` — public pages, no app shell
- `(onboarding)` — protected but no app shell (onboarding must be completed first)
- `(app)` — protected pages with full app shell (bottom nav, header)

---

## Authentication Flow

```
User visits app
      │
      ▼
middleware.ts
  ├─ No session → redirect to /{locale}/login
  ├─ Session + onboarding incomplete → redirect to /{locale}/onboarding
  └─ Session + onboarding complete → allow through to (app)
```

### Registration
1. User fills first name, email, and password form.
2. `supabase.auth.signUp()` is called from a server action.
3. Confirmation email sent (optional — can be disabled in Supabase dashboard for frictionless flow).
4. On first sign-in, `profiles.onboarding_completed = false` → middleware redirects to `/onboarding`.

### Onboarding
Multi-step form (one question per screen, progress bar at top):

1. Gender
2. Age
3. Height (cm or ft/in toggle)
4. Current Weight (kg or lb toggle)
5. Activity Level (Sedentary / Lightly Active / Moderately Active / Very Active / Athlete)
6. Training Location (Gym / Home / Both)
7. Goal (Lose Weight / Build Muscle / Improve Endurance / Stay Healthy / Athletic Performance)

On completion, all values are written to the `profiles` table and `onboarding_completed` is set to `true`.

### Session Persistence
Supabase handles JWT refresh automatically. The middleware client (`@supabase/ssr`) reads cookies server-side for SSR correctness.

---

## Internationalization

`next-intl` is configured with three locales: `ro`, `en`, `es`.

### Locale Detection Priority
1. `locale` column in `profiles` table (authenticated users).
2. `Accept-Language` browser header (unauthenticated users / first visit).
3. Fallback: `ro` (primary market).

### Locale Switching
- Available in Profile settings.
- On change: update `profiles.locale`, call `next-intl`'s router to navigate to the same path under the new locale segment.
- All translation keys live in `messages/{locale}.json` files. No translation is ever hardcoded in components.

### Units Localisation
- Weight: kg (default) / lb — stored always in kg, displayed per preference.
- Height: cm (default) / ft+in — stored always in cm.
- Unit preference stored in `profiles.unit_system` (`metric` | `imperial`).

---

## Data Flow

### Server Components (default)
- Fetch data directly via the Supabase server client (no API round-trip).
- Used for: page-level data, initial renders, SEO-relevant content.

### Client Components
- Used only when interactivity is required (forms, animations, real-time updates).
- Access Supabase via the browser client inside custom hooks.

### Server Actions
- All mutations (create, update, delete) go through Next.js Server Actions.
- Server Actions validate input with Zod, call Supabase, return typed results.
- Client components call server actions directly — no manual fetch to `/api`.

### Optimistic Updates
For all CRUD operations, the UI updates optimistically (React `useOptimistic`) and rolls back on error. This is mandatory for the "undo after delete" feature.

---

## Supabase Configuration

### Row Level Security (RLS)
Every table has RLS enabled. The universal policy pattern:

```sql
-- Users can only access their own rows
CREATE POLICY "owner_access" ON {table}
  USING (user_id = auth.uid());
```

### Storage Buckets
| Bucket | Purpose | Access |
|---|---|---|
| `progress-photos` | User progress photos | Private, owner only |
| `avatars` | Profile pictures | Private, owner only |

### Realtime
- Not used in V1 of V2. Reserved for future features (social/coaching layer).

---

## Module Summary

| Module | Path | Description |
|---|---|---|
| Dashboard | `/dashboard` | Summary cards: weight trend, active goal, last workout, calorie ring |
| Weight Tracking | `/weight` | Log entries, trend chart, BMI |
| Measurements | `/measurements` | Body measurements log (chest, waist, hips, arms, thighs, etc.) |
| Progress Photos | `/photos` | Photo timeline, before/after comparison |
| Calories Calculator | `/calories` | TDEE calculator and macro targets |
| Goals | `/goals` | Active/completed goals, progress tracking |
| Workouts | `/workouts` | Body map, library, generator, session logger, history |
| Profile | `/profile` | All user settings, locale, units, onboarding data |

---

## Error Handling

- All server actions return a discriminated union: `{ success: true, data: T } | { success: false, error: string }`.
- Client components handle both branches and display appropriate toast notifications.
- Database errors are never exposed to the client — they are logged server-side and a generic message is returned.

---

## Performance Targets

- Largest Contentful Paint (LCP) < 2.5 s on mobile 4G.
- First Input Delay (FID) < 100 ms.
- Cumulative Layout Shift (CLS) < 0.1.
- All images served via `next/image` with WebP and lazy loading.
- SVG body maps are inlined for instant interactivity (no network fetch on interaction).
