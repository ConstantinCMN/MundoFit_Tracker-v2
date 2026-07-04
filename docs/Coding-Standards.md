# MundoFit Tracker V2 — Coding Standards

> Generated from the actual repository state on 2026-07-04. Every rule below is observed practice in the current codebase, not aspiration — where the codebase is inconsistent, both patterns are documented and the inconsistency is flagged rather than silently resolved. See `AGENTS.md` for who owns changes to these standards.

---

## TypeScript

- `strict: true` in `tsconfig.json`. No implicit `any`.
- Path alias `@/*` maps to the repo root (`@/lib/...`, `@/components/...`, `@/types/...`).
- Validate with `npm run type-check` (`tsc --noEmit`) before considering any change done — this is a hard requirement from `AGENTS.md`.
- Shared types live in `types/` (`types/database.ts` for generated-style Supabase table/enum types, `types/index.ts` for app-level derived types). Domain-specific types (e.g. session state shapes, exercise seed entries) live next to the code that owns them (`components/workouts/session/workout-session-provider.tsx`, `data/exercises/_schema.ts`, `lib/exercises/types.ts`) rather than in the shared `types/` folder.

## Linting

- ESLint config (`.eslintrc.json`) extends `next/core-web-vitals` and `next/typescript`. Run via `npm run lint`.
- No Prettier config is present in the repo — formatting is whatever ESLint enforces plus editor defaults. Don't assume a Prettier pass is part of the pipeline.

## File & Folder Naming

- All files: kebab-case (`workout-session-provider.tsx`, `split-type-selector-client.tsx`).
- Client components that need `'use client'` are suffixed `-client.tsx` (`body-hub-client.tsx`, `dashboard-client.tsx`, `log-form-client.tsx`). Files without the suffix are Server Components by default.
- Components are organized by domain folder under `components/` (`auth/`, `body/`, `dashboard/`, `measurements/`, `workouts/`, `layout/`, `ui/`), not by atomic-design layer. Large domains subdivide further (`components/dashboard/sections/`, `components/dashboard/ui/`, `components/workouts/session/{views,overlays}/`).
- Server Actions live in `lib/actions/<domain>.ts`, one file per domain (`auth.ts`, `profile.ts`, `measurements.ts`, `workouts.ts`, `schedules.ts`, `sessions.ts`, `exercises.ts`).

## Server Components & Data Fetching

- Server Components fetch directly via the Supabase server client (`lib/supabase/server.ts`) — no internal `/api` round-trip for reads.
- Pages that require a fresh per-request read (auth-gated data, session state) declare `export const dynamic = 'force-dynamic';` (see `app/[locale]/(session)/workouts/session/page.tsx`, `app/[locale]/(app)/workouts/program/page.tsx`).
- Client components access Supabase only through the browser client (`lib/supabase/client.ts`), and only when real-time interactivity is needed — not for data that could be fetched server-side.

## Server Actions

All mutations go through `'use server'` functions in `lib/actions/`. **Two return-shape conventions currently coexist in the codebase:**

**Convention A — `success` discriminant** (used in `auth.ts`, `profile.ts`; matches `docs/ARCHITECTURE.md`):
```ts
type Result<T> = { success: true; data: T } | { success: false; error: string };
```

**Convention B — bare `{ data, error }` or `{ error }`-only** (used in `measurements.ts`, most CRUD actions):
```ts
async function logMeasurement(input: MeasurementInput): Promise<{ error: string | null }> { ... }
```

**Convention C — presence-of-key discriminant** (newest, used in the session engine — `sessions.ts`, `schedules.ts`):
```ts
type CreateSessionResult = { sessionId: string } | { error: string };
```

*Known gap:* these three conventions are not unified. New Server Actions should match whichever convention the domain they're extending already uses; don't introduce a fourth pattern. Unifying them is an architecture-level decision — flag it to the Product/Tech Lead role, don't do it unilaterally (`AGENTS.md` rule: never change architecture without approval).

Every Server Action starts with an auth check:
```ts
const { data: { user } } = await supabase.auth.getUser();
if (!user) return { error: 'Not authenticated' };
```
Ownership is enforced twice — once by RLS, once by an explicit `.eq('user_id', user.id)` in the query (belt-and-suspenders, called out explicitly in code comments in `lib/actions/sessions.ts`).

*Known gap:* `docs/ARCHITECTURE.md` states "Database errors are never exposed to the client — they are logged server-side and a generic message is returned." The current code does not do this — `error.message` from Supabase is returned to the client directly in every Server Action reviewed (`auth.ts`, `profile.ts`, `measurements.ts`, `sessions.ts`). This is a documented-behavior-vs-actual-behavior mismatch, not something to silently patch — surface it rather than resolve it unilaterally.

## Validation (Zod)

- Zod schemas live in `lib/validations/<domain>.ts` (`auth.ts`, `onboarding.ts`, `profile.ts`). They are applied client-side via `zodResolver` in `react-hook-form` (`components/auth/login-form.tsx`, `register-form.tsx`, `forgot-password-form.tsx`, and the onboarding wizard).
- *Known gap:* not every input boundary has a Zod schema. Notably, `measurements.ts` and several other CRUD Server Actions accept a plain TypeScript-typed object with no server-side re-validation — they rely entirely on the client-side form having validated first. `AGENTS.md` requires Zod validation on new/changed input boundaries; when touching one of these actions, add a schema in `lib/validations/` rather than assuming the existing lack of one is the standard to match.

## State Management

- Local/page-level UI state: plain `useState`/`useReducer` in client components.
- Cross-component session state: React Context with a single `useMemo`-wrapped context value and named transition callbacks (`workout-session-provider.tsx` is the reference implementation — `startSession()`, `finishWorkout()`, `cancelWorkout()`, etc., rather than exposing a raw setter). One exception (`setStatus`) is still exposed directly in that same provider — a known, tracked debt, not a pattern to copy.
- **Timers are always derived from absolute timestamps, never decremented counters** — e.g. `remaining = duration - (Date.now() - startedAt) / 1000`. This is required so timers self-correct after tab backgrounding or phone lock. Do not implement a new timer with a `setInterval` that decrements a `useState` counter.
- Components that tick every second (`ElapsedTimer`, `RestOverlay`) must be leaf components that own their own interval — they must not cause their parent to re-render each tick.

## Internationalization

- No hardcoded user-facing strings. Every string is a key in all three of `messages/ro.json`, `messages/en.json`, `messages/es.json` — adding a key to one locale file without the other two is an incomplete change.
- Locale-aware navigation goes through `lib/i18n/navigation.ts` (typed `Link`/`useRouter`), not raw `next/navigation`.
- Server Components call `setRequestLocale(locale)` before rendering (see any `page.tsx` under `app/[locale]/`).

## Database & Migrations

- Migrations live in `supabase/migrations/`, named `<timestamp>_<description>.sql`. Every new table needs RLS enabled and an owner-only policy in the same migration — never added in a follow-up.
- Weight is always stored in kg, height always in cm. Unit conversion for imperial display happens only at the render layer.

## Reports & Workflow

- The pre-implementation checklist and reporting convention are defined once, in `AGENTS.md` — this document does not duplicate them.

## Testing

- No automated test runner is configured (`package.json` has no `test` script, and no Jest/Vitest/Testing Library dependency exists in the repo as of 2026-07-04). Verification currently happens via `npm run type-check`, `npm run lint`, manual QA (see `docs/qa/`), and the `/verify` skill. This is a real gap, not a documented convention to follow — if a task calls for automated tests, that's a decision to raise (test framework choice is effectively an architecture decision under the current `AGENTS.md` rules).
