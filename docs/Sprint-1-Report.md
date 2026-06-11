# Sprint 1 Report — Foundation Setup

**Date:** 2026-06-11
**Status:** Complete
**Next Sprint:** Sprint 2 — Auth & Onboarding

---

## Objective

Establish the full project foundation so that every subsequent sprint can build features without revisiting infrastructure. No feature pages were implemented — only architecture, configuration, and route scaffolding.

---

## Deliverables

### 1. Dependency Installation

`package.json` created with all required dependencies. Run `npm install` to complete setup.

| Package | Role |
|---|---|
| `next@^15.3.0` | App Router framework |
| `react@^19.0.0` / `react-dom` | UI runtime |
| `@supabase/ssr@^0.6.0` | Server-side Supabase (SSR-safe cookies) |
| `@supabase/supabase-js@^2.49.0` | Supabase JS client |
| `framer-motion@^11.18.0` | Animations |
| `next-intl@^3.26.0` | i18n (RO / EN / ES) |
| `react-hook-form@^7.54.0` + `@hookform/resolvers` | Forms |
| `zod@^3.24.0` | Schema validation |
| `lucide-react@^0.468.0` | Icons |
| `clsx` + `tailwind-merge` | Class name utility (`cn`) |
| `tailwindcss@^3.4.17` | Styling |

### 2. Environment Configuration

| File | Purpose |
|---|---|
| `.env.example` | Template — committed to git |
| `.env.local` | Actual secrets — gitignored, must be filled with Supabase project values |

Required environment variables:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL
```

### 3. TypeScript Configuration

- `tsconfig.json` with `strict: true`, `moduleResolution: bundler`, path alias `@/*` → root.
- `next.config.ts` wrapped with `withNextIntl` plugin.
- `postcss.config.mjs` and `tailwind.config.ts` configured.

### 4. Supabase Client Setup

| File | Export | Usage |
|---|---|---|
| `lib/supabase/client.ts` | `createClient()` | Browser (Client Components) |
| `lib/supabase/server.ts` | `createClient()` | Server (Server Components + Server Actions) |

Both clients are typed with the full `Database` type from `types/database.ts`. The server client uses Next.js 15's async `cookies()` API.

### 5. Internationalization Setup

| File | Role |
|---|---|
| `lib/i18n/routing.ts` | Defines locales `['ro', 'en', 'es']`, defaultLocale `'ro'` |
| `lib/i18n/navigation.ts` | Exports typed `Link`, `redirect`, `usePathname`, `useRouter` |
| `i18n.ts` | Per-request config, loads message files |
| `middleware.ts` | Combined next-intl routing + Supabase session refresh + auth guards |
| `messages/ro.json` | Romanian translations (primary locale) |
| `messages/en.json` | English translations |
| `messages/es.json` | Spanish translations |

**Locale detection order:**
1. URL locale segment (e.g. `/en/dashboard`)
2. `Accept-Language` browser header (on first visit)
3. Fallback: `ro`

**Message structure covers:** `common`, `nav`, `auth`, `onboarding`, `dashboard`, `weight`, `measurements`, `photos`, `calories`, `goals`, `workouts`, `profile` — all three locales.

### 6. Theme System

**`app/globals.css`** defines all CSS custom properties from UI-UX.md:

```
--bg-base, --bg-surface, --bg-elevated, --bg-overlay
--accent (#aaff00), --accent-dim, --accent-glow
--text-primary, --text-secondary, --text-muted
--border, --border-accent
--danger, --warning, --success, --info
--radius-sm/md/lg/xl/full
--shadow-card, --shadow-modal, --glow-accent, --glow-accent-sm
```

**`tailwind.config.ts`** maps all tokens to Tailwind color/shadow/radius utilities via `var()` references. Custom font sizes match the typography scale from UI-UX.md.

**Utilities added:** `.safe-area-top`, `.safe-area-bottom`, `.glow-accent`, `.glow-accent-sm`, `.text-gradient-accent`, `.app-container`.

### 7. Base Layout

**Layout hierarchy:**
```
app/layout.tsx                       ← Pass-through (locale layout owns html/body)
└── app/[locale]/layout.tsx          ← <html lang={locale}>, Inter font, NextIntlClientProvider
    ├── app/[locale]/(auth)/layout.tsx        ← Centered card container, no shell
    ├── app/[locale]/(onboarding)/layout.tsx  ← Full-screen, no shell
    └── app/[locale]/(app)/layout.tsx         ← AppShell (header + main + bottom nav)
```

**`components/layout/app-shell.tsx`** — Server Component wrapper
**`components/layout/header.tsx`** — Client Component, reads `usePathname` to derive page title and show back button on nested routes
**`components/layout/bottom-nav.tsx`** — Client Component, 5-tab nav with Framer Motion spring animation on active tab, Lucide icons, locale-aware hrefs

### 8. Route Structure

All routes scaffolded with placeholder pages:

| Route | Group | Sprint |
|---|---|---|
| `/{locale}/login` | (auth) | Sprint 2 |
| `/{locale}/register` | (auth) | Sprint 2 |
| `/{locale}/onboarding` | (onboarding) | Sprint 2 |
| `/{locale}/dashboard` | (app) | Sprint 13 |
| `/{locale}/weight` | (app) | Sprint 4 |
| `/{locale}/measurements` | (app) | Sprint 5 |
| `/{locale}/photos` | (app) | Sprint 6 |
| `/{locale}/calories` | (app) | Sprint 8 |
| `/{locale}/goals` | (app) | Sprint 7 |
| `/{locale}/workouts` | (app) | Sprint 11 |
| `/{locale}/workouts/library` | (app) | Sprint 9 |
| `/{locale}/workouts/generator` | (app) | Sprint 12 |
| `/{locale}/workouts/history` | (app) | Sprint 11 |
| `/{locale}/profile` | (app) | Sprint 3 |

### 9. Type System

`types/database.ts` — Full `Database` type for all 11 tables matching Database.md spec:
- All enum types exported (`Gender`, `ActivityLevel`, `TrainingLocation`, etc.)
- `Row`, `Insert`, `Update` variants for every table
- Used by both Supabase clients for end-to-end type safety

`types/index.ts` — Re-exports all types and adds convenience row aliases (`Profile`, `WeightLog`, `Measurement`, etc.) plus the `ActionResult<T>` discriminated union for Server Actions.

---

## Auth Guards (Middleware)

`middleware.ts` protects all app routes server-side:

| Condition | Behaviour |
|---|---|
| Unauthenticated → protected path | Redirect to `/{locale}/login` |
| Authenticated → auth path (`/login`, `/register`) | Redirect to `/{locale}/dashboard` |
| Authenticated + onboarding incomplete | TODO in Sprint 2 (requires `profiles` table) |

Supabase session cookies are refreshed on every request and written back onto the i18n response, keeping JWTs valid without client-side polling.

---

## Known Limitations / Sprint 2 TODO

1. **`npm install` must be run manually** — temp filesystem was full during this session.
2. **Onboarding redirect not wired** — middleware has a TODO comment; requires `profiles` table (Sprint 2 adds the database migrations).
3. **No Supabase project values** — `.env.local` contains placeholder strings. Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from the Supabase dashboard before running the dev server.

---

## How to Run

```bash
# 1. Install dependencies (one-time)
npm install

# 2. Fill in .env.local with your Supabase project values

# 3. Start dev server
npm run dev
# → http://localhost:3000
# → Redirects to /ro/dashboard → redirects to /ro/login (unauthenticated)
```

---

## File Count

**48 files created** across:
- 8 root config files (`package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`, `.env.example`, `.env.local`)
- 4 i18n files (`i18n.ts`, `middleware.ts`, `lib/i18n/routing.ts`, `lib/i18n/navigation.ts`)
- 3 message files (`messages/ro.json`, `messages/en.json`, `messages/es.json`)
- 2 Supabase clients (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- 1 utility (`lib/utils/cn.ts`)
- 2 type files (`types/database.ts`, `types/index.ts`)
- 5 layout files (`app/layout.tsx`, `app/[locale]/layout.tsx`, 3 route-group layouts)
- 3 layout components (`app-shell.tsx`, `header.tsx`, `bottom-nav.tsx`)
- 1 CSS file (`app/globals.css`)
- 17 page files (2 auth + 1 onboarding + 13 app module pages + root redirect + 404)
- 5 documentation files (4 existing + this report)
