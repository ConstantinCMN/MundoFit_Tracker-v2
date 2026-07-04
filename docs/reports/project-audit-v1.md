# MundoFit Tracker V2 — Project Audit v1

**Date:** 2026-07-04
**Scope:** Full repository — application code, database schema, documentation, design system, and working-tree (uncommitted) work.
**Method:** Full read of the codebase (app router tree, all `components/`, all `lib/`, all `supabase/migrations/`, all `docs/`), targeted greps for security/accessibility/performance signals (`aria-label` density, `React.memo` usage, `next/image` usage, i18n key parity, unbounded queries, service-role-key exposure), and cross-referencing of every entry point that links into the workout session flow. No application code was modified during this audit.

> Per `AGENTS.md`: this audit is descriptive, not prescriptive of architecture. Where a fix implies an architecture decision (which of two competing systems to keep, which convention to standardize on), that is called out explicitly as requiring Product/Tech Lead approval rather than assumed.

---

## Score Summary

| # | Category | Score |
|---|---|---|
| 1 | Architecture | 62 / 100 |
| 2 | Folder Structure | 78 / 100 |
| 3 | Documentation | 74 / 100 |
| 4 | Database Design | 80 / 100 |
| 5 | Exercise Library | 48 / 100 |
| 6 | Workout Session Engine | 55 / 100 |
| 7 | Dashboard V2 | 76 / 100 |
| 8 | Program / Schedule | 60 / 100 |
| 9 | UI / UX | 80 / 100 |
| 10 | Design System | 90 / 100 |
| 11 | Accessibility | 35 / 100 |
| 12 | Internationalization (i18n) | 92 / 100 |
| 13 | Security | 64 / 100 |
| 14 | Performance | 58 / 100 |
| 15 | Maintainability | 66 / 100 |
| 16 | Scalability | 55 / 100 |
| 17 | Testing | 10 / 100 |
| 18 | Production Readiness | 42 / 100 |

**Unweighted average: 62 / 100.** The spread is the headline: i18n (92) and the Design System (90) are near production-grade, while Testing (10) and Accessibility (35) are barely started, and the single largest finding — an entire, well-built subsystem (the Workout Session Engine) that no user can currently reach — pulls down Architecture, the engine's own score, and Production Readiness simultaneously.

---

## 1. Architecture — 62/100

**Strengths**
- Clean route-group separation: `(auth)`, `(onboarding)`, `(app)`, and a purpose-built `(session)` group added specifically to remove accidental-exit bugs during a workout.
- Server Components fetch directly via the Supabase server client; Server Actions own every mutation; consistent with the documented Next.js App Router data-flow model.
- RLS is universal — every table, no exceptions found.

**Weaknesses**
- **Two independent, parallel workout-execution implementations exist.** `components/workouts/generator-client.tsx` has its own embedded `'executing'` phase (its own rest timer, pause state, completion flow, ~952 lines), while a fully separate, more carefully engineered Workout Session Engine (`components/workouts/session/*`, the `(session)` route group, `WorkoutSessionProvider`) was built across 7+ sprints and audited (`docs/qa/QA-01-Workout-Session-Audit.md`). See §6 and Critical Issue C-1 — this is the single most consequential architecture finding in this audit.
- Three different Server Action result-shape conventions coexist (`{success,data|error}` in `auth.ts`/`profile.ts`; bare `{data,error}` in `measurements.ts`; presence-of-key `{sessionId}|{error}` in `sessions.ts`/`schedules.ts`).
- `docs/ARCHITECTURE.md` states database errors are never exposed to the client; every Server Action reviewed returns `error.message` directly. Documentation and implementation disagree.

**Risks**
- Continued feature work may land in either the generator's embedded execution path or the session engine, deepening the fork and making a future consolidation more expensive the longer it's deferred.

**Recommendations**
- Product/Tech Lead decision required: wire the session engine into the real entry points and retire the generator's embedded execution phase, or retire the session-engine route and fold its fixes (absolute-timestamp timers, standalone chrome-free layout) back into the generator. Either is defensible; the current "both, disconnected" state is not.
- Converge on one Server Action return-shape convention going forward (don't need to retrofit existing code, but stop the drift).

---

## 2. Folder Structure — 78/100

**Strengths**
- Consistent domain-folder organization under `components/` (`auth/`, `body/`, `dashboard/`, `measurements/`, `workouts/`, `layout/`, `ui/`).
- `-client.tsx` suffix reliably marks client components; `lib/actions/<domain>.ts` is a predictable, one-file-per-domain pattern.
- `data/exercises/` cleanly separates seed content from runtime code; `lib/exercises/` cleanly separates query/search/import logic from that data.

**Weaknesses**
- `docs/ARCHITECTURE.md` describes a `components/modules/{body-map,workout,weight,...}` structure that does not match the repo — the actual structure is flatter, organized by top-level domain folder, not a `modules/` subtree.
- `components/workouts/` is the largest and most heterogeneous folder (hub, library, generator, program, session subsystem, muscle map) — it holds both of the two competing execution systems described in §1.

**Risks**
- As more workout sub-features land, `components/workouts/` risks becoming a dumping ground without an explicit subfolder convention (as `session/` already demonstrates works well).

**Recommendations**
- Update `ARCHITECTURE.md`'s Project Structure diagram to match reality, or restructure to match the diagram — whichever the Product/Tech Lead prefers, but stop the drift.
- Consider `program/`, `generator/`, `library/` subfolders under `components/workouts/`, mirroring the `session/` pattern already in place.

---

## 3. Documentation — 74/100

**Strengths**
- `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, `docs/ROADMAP.md` are substantive and mostly accurate.
- `docs/design/MundoFit_V3_Design_System.md` is exceptionally thorough (22 sections) and current.
- `AGENTS.md`, `docs/PROJECT_CONTEXT.md`, `docs/Coding-Standards.md`, `docs/UI-Guidelines.md`, `docs/Changelog.md` now exist (added in a prior session pass) where they were previously empty or missing.
- Extensive dated implementation reports in `docs/reports/` provide real historical traceability.

**Weaknesses**
- `docs/UI_UX.md` (403 lines) coexists with the design system that explicitly says it "supersedes all prior design references" — no deprecation marker was ever added to the older file.
- `ARCHITECTURE.md`'s error-handling claim is stale relative to actual code (§1, §13).
- `ARCHITECTURE.md`'s folder-structure diagram is stale relative to actual code (§2).
- No mechanism keeps `PROJECT_CONTEXT.md`/`ROADMAP.md` in sync with the fast-moving uncommitted working tree.

**Risks**
- Docs will keep drifting from code at the current pace of uncommitted, unreviewed work unless a lightweight "verified as of" convention is adopted.

**Recommendations**
- Mark `UI_UX.md` deprecated at the top (one line) pointing to the design system.
- Reconcile the two stale `ARCHITECTURE.md` claims identified above.

---

## 4. Database Design — 80/100

**Strengths**
- RLS enabled on every table, either owner-direct (`user_id = auth.uid()`) or ownership-via-join (`EXISTS (SELECT 1 FROM parent WHERE ... AND user_id = auth.uid())`), consistently applied across 13 tables and 3 additive migrations.
- Sensible indexing: GIN indexes on array columns (`muscle_groups`, `keywords`, `aliases`) for containment/overlap queries, composite indexes for the common `(user_id, date DESC)` access pattern.
- The `session_sets.position` column is a well-reasoned addition — it snapshots executed-exercise order independently of the live `workout_exercises` template, so history stays accurate even if a workout is later edited.
- Auto-update triggers and a profile auto-creation trigger (`handle_new_user`, `SECURITY DEFINER`, idempotent via `ON CONFLICT DO NOTHING`) are correctly implemented.

**Weaknesses**
- **Two separate code paths write workout completion data**: `lib/actions/sessions.ts` (`createSession`/`logSet`/`completeSession`, used by the session engine) and `lib/actions/workouts.ts` (`saveWorkoutSession`, used by the generator's embedded execution phase, which computes `total_volume_kg` server-side from `executedExercises` rather than client-side). Same tables, two different volume-calculation and write strategies.
- No DB-level constraint ties `workout_schedule_days.workout_id` ownership to the schedule's own `user_id` — enforcement is entirely at the RLS/application layer (see §8, §13).

**Risks**
- The two workout-completion write paths could diverge further (e.g. a bug fix to volume calculation applied to one and not the other) without anyone noticing, since neither is under automated test.

**Recommendations**
- Once §1's architecture decision is made, consolidate on one write path for `workout_sessions`/`session_sets`.
- Consider a `CHECK`-friendly trigger or accept RLS's existing protection as sufficient — but document the decision either way.

---

## 5. Exercise Library — 48/100

**Strengths**
- The v2 schema extension (`20240107000000_extend_exercise_library.sql`) is well designed: `category`/`movement_pattern` classification, per-locale `instructions`/`mistakes`/`tips` as `jsonb`, `keywords`/`aliases` with GIN indexes for search, a stable `slug` for idempotent seeding.
- `lib/exercises/queries.ts` is the only place in the entire codebase with real pagination (`.range()`).
- Chest and back are fully authored, tri-lingual, and QA'd (`docs/reports/chest-library-qa.md`, `back-library-qa.md`).

**Weaknesses**
- Only 2 of 7 planned muscle groups are populated. `legs`, `shoulders`, `arms`, `core`, `cardio` are stubbed (commented out) in `data/exercises/index.ts`.
- Two competing exercise-fetch code paths: the original `lib/actions/exercises.ts` (`getExercises`, unbounded, used by the generator and library client) versus the new `lib/exercises/queries.ts` (paginated, part of the v2 data layer). It's not evident from the code which is meant to become canonical.

**Risks**
- The workout generator cannot currently produce a full-body, leg, shoulder, arm, or core/cardio-focused workout — it can only ever recommend chest/back exercises for those muscle selections, silently degrading quality for most user goals.

**Recommendations**
- Prioritize `legs` next (highest usage muscle group for most training splits), then shoulders/arms, before beta.
- Decide which exercise-fetch layer is canonical and migrate the generator/library client onto it.

---

## 6. Workout Session Engine — 55/100

**Strengths**
- Genuinely excellent state-machine design: single `useMemo`-wrapped context, named transition callbacks (`startSession`, `finishWorkout`, `cancelWorkout`) rather than a raw setter (mostly — see below), frozen exercise data at session start, double-tap guards (`hasAdvancedRef`, `loggedSetsRef`).
- Absolute-timestamp timers throughout — no drift after backgrounding.
- 3 of the 4 blocking defects from `docs/qa/QA-01-Workout-Session-Audit.md` are now fixed: cancel-workout no longer blanks the screen, `total_volume_kg` is written, and a standalone chrome-free `(session)` layout removes the accidental bottom-nav/header exit paths.

**Weaknesses**
- **No entry point in the live application links to `/workouts/session`.** Verified by grepping every `router.push`/`Link` targeting `/workouts/*` across the app: Body Hub → `/workouts/start`; My Workouts → `/workouts/generator`; Dashboard's Today card → `` `/workouts/generator?workoutId=...&scheduleDay=...&split=...` ``. This is exactly the URL shape the engine's own architecture blueprint (`docs/architecture/workout-session-engine-blueprint.md`, §1) specifies should route to `/workouts/session`. The engine is fully built and unreachable.
- Pause time is still not excluded from duration/elapsed-time (QA-01 H-02) — confirmed still true by reading `workout-session-provider.tsx` and `pause-overlay.tsx`: no `pausedAt`/`accumulatedPauseMs` exists anywhere in the codebase.
- `setStatus` is still exposed raw in the context and used directly by `PauseOverlay` (QA-01 M-04, still open).
- The previous-performance query has no `LIMIT` (QA-01 H-03, still open).
- W8 (crash/refresh recovery) and W9 (error/retry handling) were never started.

**Risks**
- Every hour spent polishing this engine currently produces zero user-facing value until the architecture decision in §1 is made.

**Recommendations**
- This is the same decision as §1 — resolve it first. If the engine is kept, H-02/M-04/H-03/W8/W9 above become the real punch list.

---

## 7. Dashboard V2 — 76/100

**Strengths**
- Clean sectioned architecture (`HeroSection`, `TodaySection`, `QuickStatsSection`, `ProgressSection`, `RecentWorkoutSection`, `QuickActionsSection`) over shared `components/dashboard/ui/` primitives.
- Real data wired throughout — today's scheduled workout, weight trend, recent session — not placeholder content.
- Consistent with the design system's documented section order and card patterns.

**Weaknesses**
- `TodaySection`'s "Start Workout" CTA routes into the generator, not the session engine (§6).
- No route-level `loading.tsx` — the dashboard relies on an in-component `skeleton-card.tsx` rather than a Suspense boundary (only 3 `Suspense` usages exist repo-wide).
- No `React.memo` on any dashboard section — likely a non-issue at current scale, but the codebase has zero instances of it anywhere.

**Risks**
- Low — this is the most polished, complete subsystem after i18n and the design system.

**Recommendations**
- Add a `loading.tsx` for `/dashboard` using the existing skeleton components as the fallback, for a smoother first paint on slow connections.

---

## 8. Program / Schedule — 60/100

**Strengths**
- Sensible v1 scope: a fixed 14-day schedule, one active schedule per user (enforced by a partial unique index), completion derived from `workout_sessions` rather than stored redundantly.
- `getActiveSchedule` correctly reconstructs each day's date via `addDays`/`parseDateOnly` and matches sessions by calendar day, avoiding timezone off-by-one bugs (the `parseDateOnly` helper has an explicit comment about why it appends a local-midnight time).

**Weaknesses**
- `updateScheduleDayType` and `attachWorkoutToScheduleDay` (`lib/actions/schedules.ts`) have **no explicit `auth.getUser()`/ownership check** — every other Server Action in the codebase does an explicit auth check plus a redundant `.eq('user_id', ...)` as defense-in-depth; these two rely solely on RLS. Functionally safe today (RLS on `workout_schedule_days` and the `workouts` embed both scope to the owner), but inconsistent with the codebase's own established pattern and a single missing RLS policy away from a real bug.
- `attachWorkoutToScheduleDay` does not verify the given `workoutId` belongs to the calling user before linking it — mirrors the already-known QA-01 finding M-02 for `createSession`, but here it's new and undocumented until now. No data leaks (the subsequent `workouts` embed is itself RLS-scoped), but a user could silently attach a nonexistent or inaccessible `workoutId`, producing a confusing "no workout" UI state rather than a clear error.
- No visible mechanism regenerates or extends the schedule after its fixed 14-day window elapses.

**Risks**
- Low-to-medium — the missing checks are currently masked by RLS, but masked risk is still risk, especially if a future migration or policy change loosens RLS without anyone re-auditing these two actions.

**Recommendations**
- Add the same explicit auth + ownership pattern used everywhere else in the codebase to both actions.
- Decide and implement what happens after day 14 (auto-regenerate, prompt the user, or archive-and-ask) before beta.

---

## 9. UI / UX — 80/100

**Strengths**
- The design language is not just documented but actually followed — spot-checked colors, radii, and spacing in `bottom-nav.tsx`, `header.tsx`, `app-shell.tsx`, and session components all matched `app/globals.css`/`tailwind.config.ts` tokens exactly, with no stray hex values found outside the token set.
- Thoughtful empty states and a WebKit `backdrop-filter` compositing bug was found and fixed with the root cause documented (`docs/reports/2026-06-30-progress-bar-root-cause-fix.md`) and the constraint captured permanently in the design system (§10 warning).

**Weaknesses**
- `useReducedMotion` is never invoked anywhere despite Framer Motion being used pervasively, and the design system itself says reduced motion is "not yet implemented in v1.0" — an honest but real gap.
- QA-01's touch-target findings (exercise nav buttons ~28px effective height, below the 44×44px minimum the design system itself mandates) have not been re-verified as fixed.

**Risks**
- Motion-sensitive users have no opt-out today.

**Recommendations**
- Implement `useReducedMotion` once, centrally (e.g. wrap the `fadeUp`/spring presets in `components/dashboard/ui/animations.ts` so every consumer inherits it for free) rather than per-call-site.

---

## 10. Design System — 90/100

**Strengths**
- `docs/design/MundoFit_V3_Design_System.md` is the strongest single artifact in the repository: 22 sections covering color, typography, layout, motion, accessibility, and even an "AI Development Rules" section written specifically to keep AI-generated code on-spec.
- Tokens are defined exactly once (`app/globals.css`) and consumed consistently through `tailwind.config.ts` — no evidence of parallel/duplicate token definitions.
- The document is explicit and honest about its own gaps (reduced motion, touch targets) rather than overclaiming completeness.

**Weaknesses**
- Coexists with the superseded `docs/UI_UX.md` with no deprecation marker (§3).

**Risks**
- None significant — this is close to a model example of the artifact type.

**Recommendations**
- Add the one-line deprecation note to `UI_UX.md` referenced in §3.

---

## 11. Accessibility — 35/100

**Strengths**
- The design system's own accessibility section (§16) is well-researched — correct WCAG contrast ratio math for every token pair, explicit touch-target minimums, and an honest admission of what's not yet implemented.
- `-webkit-tap-highlight-color: transparent` is paired with deliberate `active:` states rather than just removed outright.

**Weaknesses**
- Only **8 of 81** component files use `aria-label` at all (14 occurrences total, repo-wide) — the vast majority of icon-only buttons across the app have no accessible name.
- Zero `useReducedMotion` usage (§9).
- The three modal-style overlays in the session engine (`PauseOverlay`, `FinishConfirmDialog`, `RestOverlay`) use `fixed`/`absolute` positioning with no focus trap — keyboard and screen-reader users can reach content behind them (QA-01 A-04/A-06, unresolved).
- `--text-muted` (`#555555`) fails WCAG AA at 2.6:1 and the design system's own caveat restricts it to "non-essential text at 11px or smaller" — whether every current usage respects that caveat was not exhaustively verified in this pass.

**Risks**
- Real, concrete barriers for screen-reader users and motion-sensitive users today, not a theoretical future concern.

**Recommendations**
- Treat this as a dedicated pre-beta sprint: sweep all icon-only buttons for `aria-label`, add a focus trap to the three overlays (native `<dialog>` or a small focus-trap utility), centralize reduced-motion handling per §9.

---

## 12. Internationalization (i18n) — 92/100

**Strengths**
- **Perfect key parity across all three locale files** — programmatically verified: 541 flattened keys each in `messages/en.json`, `messages/ro.json`, `messages/es.json`, zero keys missing in any direction.
- Locale-aware routing, middleware locale detection/fallback, and `setRequestLocale` are all correctly and consistently implemented.
- The `exercises` table was designed tri-lingual from the schema up (`name_ro`/`name_en`/`name_es`, and now `instructions_{ro,en,es}` etc.).

**Weaknesses**
- `Header` and `BottomNav` manually strip the locale prefix via `pathname.replace(`/${locale}`, '')` and use raw `next/navigation`/`next/link` instead of the project's own typed `lib/i18n/navigation.ts` wrapper — works correctly today, but bypasses the abstraction built to prevent exactly this class of bug.
- Only 2 of 7 exercise muscle groups have any tri-lingual content authored — this is a content-completeness gap, not a translation-infrastructure gap, but it means the "supported in 3 languages" claim is only as complete as the exercise library itself (§5).

**Risks**
- Low — the manual locale-stripping works for the current 2-letter locale codes, but is more fragile than necessary.

**Recommendations**
- Route `Header`/`BottomNav` through `lib/i18n/navigation.ts` for consistency with the rest of the codebase.

---

## 13. Security — 64/100

**Strengths**
- RLS enabled and correctly scoped on every table (13 tables, verified by reading every migration).
- Middleware and both Supabase client factories (`lib/supabase/client.ts`, `server.ts`) correctly use only the anon key — `SUPABASE_SERVICE_ROLE_KEY` is declared in `.env.example` but **never referenced anywhere in the codebase**, so there's no risk of accidental service-role exposure to the client.
- No `dangerouslySetInnerHTML`, no `eval`, no hardcoded secrets found anywhere in the codebase.
- Server Actions consistently re-check `auth.getUser()` and scope mutations by `user_id` as defense-in-depth beyond RLS (with the two exceptions noted below).

**Weaknesses**
- **`getExercises()` (`lib/actions/exercises.ts`) builds a PostgREST `.or()` filter by directly interpolating unescaped user search input**: `` `name_ro.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%` ``. A search term containing PostgREST-special characters (commas, parentheses, additional `.` operators) can alter the intended filter logic — a real filter-injection class of bug, distinct from SQL injection but in the same family. Not catastrophic (PostgREST still parses within its own grammar; no raw SQL execution), but should be fixed before beta.
- `attachWorkoutToScheduleDay`/`updateScheduleDayType` have no explicit ownership check (§8) — masked by RLS today, but inconsistent with the codebase's own defense-in-depth pattern.
- Every Server Action returns `error.message` directly to the client, contradicting `ARCHITECTURE.md`'s stated policy and potentially surfacing Postgres error detail (table/column names, constraint names) in the browser's network tab.

**Risks**
- The filter-injection issue is the most concrete and cheapest to fix; the error-message exposure is lower severity but broader in surface area (every action, every error path).

**Recommendations**
- Escape or parameterize `filters.search` before building the `.or()` string, or switch to `.textSearch()` / an RPC with a properly parameterized query.
- Add the missing ownership checks to the two schedule actions.
- Decide and enforce one error-sanitization policy for Server Actions — either update `ARCHITECTURE.md` to match reality, or update the code to match the doc.

---

## 14. Performance — 58/100

**Strengths**
- Absolute-timestamp timers throughout the session engine — self-correcting, no `setInterval` drift.
- GIN indexes correctly back the array-containment/overlap queries that matter most (`getExercisesForMuscles`'s `.overlaps('muscle_groups', ...)`).
- The new exercise query layer (`lib/exercises/queries.ts`) is the one place in the codebase with real pagination.

**Weaknesses**
- **`next/image` is used nowhere in the codebase**, despite `docs/ARCHITECTURE.md`'s explicit performance target ("All images served via `next/image` with WebP and lazy loading") and a `next.config.ts` already configured with `images.remotePatterns` for Supabase Storage. Avatars and (once shipped) progress photos will not get automatic WebP conversion, responsive sizing, or lazy loading.
- **Zero `React.memo` usage anywhere in the codebase.** The session-engine architecture blueprint explicitly calls for memoizing `SetRow`, the context value, and other hot-path components (§8 of the blueprint); QA-01's PERF-02 flagged the context-value churn as a concrete, still-open issue.
- The session engine's previous-performance query still has no `LIMIT` (QA-01 H-03).
- Middleware performs a `profiles` table read on **every single protected-route navigation** (to check `onboarding_completed`), in addition to the `auth.getUser()` call — no caching (e.g. a JWT custom claim or short-lived cookie) is used to avoid this per-navigation round trip.

**Risks**
- Photo-heavy screens will be noticeably slower once Progress Photos ships past its current stub state.
- The middleware DB round-trip adds latency to every navigation for every user, forever, unless addressed.

**Recommendations**
- Adopt `next/image` for any real image rendering (avatars now; photos once that module ships).
- Add the missing `LIMIT` to the previous-performance query.
- Consider caching the onboarding-completion check (JWT claim, or a short-TTL cookie set once at onboarding completion) to remove the per-navigation profile fetch.

---

## 15. Maintainability — 66/100

**Strengths**
- Strong TypeScript discipline — zero explicit `: any` found anywhere in the codebase.
- Zero stray `console.log`/`console.warn` noise (one `console.error` total, in an actual error-logging path), zero `TODO`/`FIXME`/`XXX` comments — either genuinely clean or comments-as-tracking simply isn't the convention, consistent with the project's stated "comment only the non-obvious why" style.
- Clear, consistent naming conventions (`-client.tsx`, `lib/actions/<domain>.ts`) make the codebase easy to navigate.

**Weaknesses**
- `components/workouts/generator-client.tsx` (952 lines) and `components/onboarding/onboarding-wizard.tsx` (653 lines) are large, multi-responsibility files. The generator in particular duplicates state-machine logic that also exists, more carefully built, in the session engine (§1, §6).
- Three coexisting Server Action conventions (§1) and two coexisting exercise-fetch layers (§5) both increase the cognitive cost of "which pattern do I copy" for new work.

**Risks**
- `generator-client.tsx` is now the highest-risk file to modify in the codebase: a rest-timer or volume-calculation bug fix applied there would not automatically propagate to the session engine's separate implementation, or vice versa.

**Recommendations**
- Resolve §1 first; then split `generator-client.tsx` by phase (`select`/`loading`/`preview`/`executing`) regardless of which execution path is kept.

---

## 16. Scalability — 55/100

**Strengths**
- The one subsystem with real query load characteristics considered (`lib/exercises/queries.ts`) is properly paginated and indexed.
- Composite indexes on `(user_id, date DESC)` patterns are in place everywhere they're needed for the current query shapes.

**Weaknesses**
- Every other list-returning Server Action — `weight_logs`, `measurements`, `workout_sessions` history, and the legacy `getExercises` — has no `.limit()`/`.range()`. A multi-year active user will eventually fetch their entire weight-log or session history in a single unbounded request.
- The 14-day fixed schedule has no evident rollover/regeneration mechanism (§8).
- The single-active-schedule-per-user unique index is a reasonable v1 constraint but will need revisiting if multi-program support is ever added.

**Risks**
- Unbounded history queries are a scalability cliff that specifically punishes the app's most engaged, longest-tenured users — exactly the users a fitness app most wants to retain.

**Recommendations**
- Add pagination to weight/measurement/session-history queries proactively, before real user data makes it a visible problem.

---

## 17. Testing — 10/100

**Strengths**
- `type-check` and `lint` are real, enforced-by-convention gates (`AGENTS.md`).
- The manual QA process that does exist has produced genuinely useful output (`docs/qa/QA-01-Workout-Session-Audit.md` caught 4 real blocking defects, 3 of which are now fixed).

**Weaknesses**
- **No automated test of any kind exists** — no unit tests, no integration tests, no E2E tests, no test runner in `package.json` (`grep` for jest/vitest/testing-library returns nothing).

**Risks**
- Every regression today depends entirely on manual re-testing or the `/verify` skill. The Critical Issue found in this very audit — an entire orphaned subsystem — is exactly the class of structural problem a basic integration/E2E test (assert that starting a workout from the Dashboard reaches a working session) would have caught the moment it happened, rather than weeks later in a full audit.

**Recommendations**
- Choosing a test framework is effectively an architecture decision under the current `AGENTS.md` rules — raise it with the Product/Tech Lead role rather than picking one mid-feature. Even a minimal Playwright smoke suite covering 2-3 golden paths (onboarding → dashboard, generate + complete a workout, log a measurement) would materially de-risk beta.

---

## 18. Production Readiness — 42/100

**Strengths**
- Auth, onboarding, and middleware gating are solid and correctly implemented.
- i18n is essentially complete (§12).
- RLS coverage is comprehensive (§4, §13).
- The design system is genuinely production-grade (§10).

**Weaknesses**
- No `loading.tsx`/`error.tsx` anywhere in the App Router tree (only `app/not-found.tsx` exists) — Phase 14 ("Polish & QA") per `docs/ROADMAP.md` has not meaningfully started.
- No automated tests (§17).
- The orphaned Workout Session Engine (§1, §6) represents unresolved product-architecture ambiguity at the very core of the app's value proposition.
- Photos and Goals modules remain stubs per the roadmap.
- Exercise library covers 2 of 7 muscle groups (§5).
- Several open security (§13) and performance (§14) items above.

**Risks**
- Shipping a beta today would ship with an entire unreachable subsystem, two stub modules, incomplete exercise coverage for most training goals, and no regression safety net.

**Recommendations**
- Treat the Critical and High Priority lists below as the literal beta gate.

---

## Critical Issues (must fix before Beta)

1. **The Workout Session Engine is completely unreachable from the live application.** Every real entry point (Body Hub, Dashboard Today card, My Workouts) routes into `generator-client.tsx`'s separate, embedded execution phase instead of `/workouts/session`. This is an architecture decision, not a bug fix — requires Product/Tech Lead sign-off per `AGENTS.md` on which system to keep. (§1, §6)
2. **Zero automated tests exist.** No safety net for regressions, including the kind of structural drift found in this audit. (§17)
3. **`next/image` is used nowhere**, despite a documented requirement and pre-configured remote patterns — a real UX/performance risk once Progress Photos ships. (§14)
4. **Exercise library covers only 2 of 7 planned muscle groups** — the generator cannot serve most training goals (legs, shoulders, arms, full-body, core, cardio). (§5)
5. **No `loading.tsx`/`error.tsx` boundaries anywhere in the App Router** — Phase 14 (Polish & QA) has not started. (§18)

## High Priority

6. `getExercises()`'s search filter is vulnerable to PostgREST filter-injection via unescaped user input in a hand-built `.or()` string. (§13)
7. Pause time is still not excluded from workout duration/elapsed time (QA-01 H-02, still open). (§6)
8. Unbounded queries with no `.limit()`/`.range()` on weight logs, measurements, workout-session history, and the legacy exercises action. (§16)
9. `attachWorkoutToScheduleDay`/`updateScheduleDayType` lack explicit ownership checks, inconsistent with the rest of the codebase's defense-in-depth pattern. (§8, §13)
10. Session recovery (W8) and error/retry handling (W9) were never implemented for the session engine. (§6)
11. Zero `React.memo` usage anywhere; the session engine's own architecture blueprint requires memoization that was never applied (QA-01 PERF-02, still open). (§14)
12. Accessibility: only 8/81 files use `aria-label`; zero `useReducedMotion` usage; no focus traps on the three modal overlays. (§11)

## Medium Priority

13. Three coexisting Server Action return-shape conventions across the codebase. (§1, §15)
14. `docs/ARCHITECTURE.md`'s error-handling claim contradicts actual behavior in every Server Action reviewed. (§1, §13)
15. Two competing exercise-fetch code paths with no clear canonical direction. (§5, §15)
16. `docs/UI_UX.md` coexists with the superseded, official design system with no deprecation marker. (§3, §10)
17. `Header`/`BottomNav` bypass the typed `lib/i18n/navigation.ts` wrapper, manually stripping the locale prefix via string replacement. (§12)
18. Middleware performs an uncached `profiles` DB round-trip on every protected-route navigation. (§14)
19. `setStatus` is still exposed raw in the session-engine context (QA-01 M-04, still open). (§6)
20. `generator-client.tsx` (952 lines) and `onboarding-wizard.tsx` (653 lines) are oversized, multi-responsibility components. (§15)

## Low Priority

21. `--text-muted` (#555555) fails WCAG AA; usage beyond the design system's own "non-essential, ≤11px" caveat was not exhaustively audited. (§11)
22. The session engine's previous-performance query still has no `LIMIT` (QA-01 H-03). (§6, §14)
23. No visible mechanism to roll over or regenerate the 14-day schedule after it elapses. (§8)
24. `SUPABASE_SERVICE_ROLE_KEY` is declared in `.env.example` but referenced nowhere in the codebase — harmless, but dead configuration worth pruning or documenting.

---

## Implementation Roadmap (ordered by impact)

### Phase 0 — Decide, don't build
A single Product/Tech Lead decision gates a large fraction of the rest of this list:
- **Resolve the Workout Session Engine vs. Generator-embedded-execution duplication** (Critical #1). Every subsequent fix to pause-time accounting, memoization, recovery, or the oversized `generator-client.tsx` should be applied to whichever system survives this decision — doing them first, in the wrong system, is wasted work.

### Phase 1 — Critical (beta-blocking)
- Wire the winning execution system into all real entry points; retire or archive the other.
- Add `loading.tsx`/`error.tsx` boundaries to the App Router (start with `/dashboard`, `/workouts/*`, `/(session)`).
- Fix the PostgREST filter-injection in `getExercises()`.
- Adopt `next/image` wherever images render today (avatars).
- Begin exercise library completion — `legs` next, then `shoulders`/`arms`, then `core`/`cardio`.
- Stand up a minimal automated test layer (even 2-3 Playwright golden-path tests) — do this early enough that it catches regressions in the rest of this roadmap, not after.

### Phase 2 — High Priority
- Add pagination to weight/measurement/session-history queries.
- Add explicit ownership checks to `attachWorkoutToScheduleDay`/`updateScheduleDayType`.
- Fix pause-time accounting in the (now-canonical) session engine.
- Run a dedicated accessibility pass: `aria-label` sweep, centralized `useReducedMotion`, focus traps on modal overlays.
- Apply `React.memo` to the hot-path components the architecture blueprint always called for (`SetRow`, context-consuming leaf components).

### Phase 3 — Medium Priority
- Unify Server Action return-shape conventions for new code.
- Reconcile `ARCHITECTURE.md` (error-handling policy, folder structure) with actual behavior.
- Consolidate the two exercise-fetch layers onto one.
- Deprecate `docs/UI_UX.md` in favor of the official design system.
- Route `Header`/`BottomNav` through `lib/i18n/navigation.ts`.
- Cache the middleware's onboarding-completion check to remove the per-navigation DB round trip.
- Remove raw `setStatus` from the session engine's public context API.
- Split `generator-client.tsx`/`onboarding-wizard.tsx` into smaller, phase-scoped files.

### Phase 4 — Low Priority / Polish
- Audit `--text-muted` usage against the design system's own contrast caveat.
- Add the missing `LIMIT` to the previous-performance query.
- Design and implement 14-day schedule rollover.
- Prune or document the unused `SUPABASE_SERVICE_ROLE_KEY` env var.

---

*Audit complete. No application code, configuration, or documentation other than this report was modified during this review.*
