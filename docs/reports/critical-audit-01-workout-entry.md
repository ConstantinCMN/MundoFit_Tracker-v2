# Critical Fix Audit #1 — Workout Session Engine Reachability

**Date:** 2026-07-04
**Subject:** Verify the Project Audit v1 (`docs/reports/project-audit-v1.md`, Critical Issue #1) claim that the Workout Session Engine is unreachable and that `generator-client.tsx` runs a duplicate execution flow.
**Method:** Exhaustively grepped every `router.push(...)`, `<Link href=...>`, and import of the session engine's own modules (`WorkoutSessionProvider`, `WorkoutSessionClient`) across the entire repository — not sampled, all matches inspected. No files were modified.

---

## Verdict

# VERIFIED

The Workout Session Engine (`app/[locale]/(session)/workouts/session/`, `components/workouts/session/*`) is fully built, wired to its own route, and **has zero inbound references from anywhere else in the application.** Every real user-facing entry point terminates at `/workouts/generator`, which is served by `GeneratorClient` (`components/workouts/generator-client.tsx`) — a separate, self-contained component that implements its own workout-execution phase (rest timer, set logging, pause, completion) independently of the session engine.

---

## Entry-Point Trace

Every navigation call site in the codebase that targets a `/workouts/*` (or a route that feeds into one) was located via:

```
grep -rn "router\.\(push\|replace\)(" --include="*.tsx" | grep -i workout
grep -rn "href=" --include="*.tsx" | grep -i workout
```

### 1. Body Hub (`components/body/body-hub-client.tsx`)
- Confirming a muscle selection calls (line 74–75):
  ```ts
  router.push(`/workouts/generator?muscles=${...}&view=${view}${splitParam}${scheduleDayParam}`)
  ```
  → **`/workouts/generator`**, carrying forward `scheduleDay` if it arrived via the Program flow (see #4).
- Secondary action buttons (lines 212–236) route to `/workouts/start`, `/workouts/library`, `/workouts`, `/workouts/history`, `/workouts/program` — none reach `/workouts/session`.

### 2. Dashboard Today Card (`components/dashboard/sections/today-section.tsx`)
- Line 180 (found in the prior audit pass): the "Start Workout" CTA for today's scheduled workout builds
  ```
  `/workouts/generator?workoutId=${workout.id}&scheduleDay=${day.id}&split=${day.day_type}`
  ```
  → **`/workouts/generator`** — this is the exact URL shape (`workoutId` + `scheduleDay` + `split`) that the engine's own architecture blueprint (`docs/architecture/workout-session-engine-blueprint.md`, §1, "Path B — Dashboard Today Card") specifies should route to `/workouts/session`. It routes to the generator instead.
- Lines 30/170: empty/fallback states route to `/workouts/program`.

### 3. My Workouts (`components/workouts/workouts-client.tsx`)
- Lines 210, 223: "New Workout" / empty-state CTA → `/workouts/generator`.
- Line 241: tapping an existing saved workout card →
  ```
  router.push(`/workouts/generator?workoutId=${w.id}`)
  ```
  → **`/workouts/generator`** (resume flow), not `/workouts/session`.

### 4. Program / Schedule (`components/workouts/program-client.tsx`)
- Line 252: tapping a scheduled day →
  ```
  router.push(`/body?split=${dayType}&scheduleDay=${dayId}`)
  ```
  → routes back to **Body Hub**, carrying `scheduleDay` along, which (per #1) then forwards it into `/workouts/generator` once muscles are confirmed. Program never links directly to `/workouts/generator` or `/workouts/session` itself — it always round-trips through Body Hub first.

### 5. Muscle Detail (`components/body/muscle-detail-client.tsx`)
- Line 103: `<Link href={`/workouts/generator?muscles=${muscle}`}>` → **`/workouts/generator`**.
- Line 112: `<Link href="/workouts/library">`.

### 6. Workout Start / Split Selector (`components/workouts/split-type-selector-client.tsx`, served by `app/[locale]/(app)/workouts/start/page.tsx`)
- Line 74: `router.push(`/body?split=${selected}`)` → back to **Body Hub** (same pattern as #4).

### 7. Workout History (`components/workouts/workout-history-client.tsx`)
- Line 402: empty-state "Start a workout" CTA → `router.push('/body')` → **Body Hub**.
- The "repeat"/detail interaction for a past session opens `SessionDetailSheet` (`components/workouts/session-detail-sheet.tsx`) in place — a read-only detail view, not a session launch.

### 8. Any other launch point
No other file in the repository references `/workouts/session` in a `router.push`, `<Link href>`, or redirect. Confirmed by grepping every `.tsx`/`.ts` file for the session engine's own exported symbols:

```
grep -rln "workout-session-provider\|workout-session-client\|WorkoutSessionProvider\|WorkoutSessionClient" .
```

Result — **10 files, all inside the session engine's own tree**:
```
app/[locale]/(session)/workouts/session/page.tsx
components/workouts/session/workout-session-client.tsx
components/workouts/session/workout-session-provider.tsx
components/workouts/session/elapsed-timer.tsx
components/workouts/session/overlays/finish-confirm-dialog.tsx
components/workouts/session/overlays/pause-overlay.tsx
components/workouts/session/views/workout-confirm-view.tsx
components/workouts/session/views/workout-summary-view.tsx
components/workouts/session/views/exercise-transition-view.tsx
components/workouts/session/views/active-workout-view.tsx
```
Nothing outside this list — no page, no client component, no server action — imports or links to any part of the session engine. `cancelWorkout()` and the summary screen's "Done" button do `router.push('/dashboard')` (exit-only, one-directional); nothing routes back in.

### Convergence

All eight traced paths converge on exactly one destination for actual workout execution: **`/workouts/generator`**, i.e. `app/[locale]/(app)/workouts/generator/page.tsx` → `GeneratorClient`.

---

## What `GeneratorClient` Actually Does

`components/workouts/generator-client.tsx` (952 lines) defines its own phase state machine, independent of the session engine:

```ts
type Phase = 'select' | 'loading' | 'preview' | 'executing';
```

- `phase === 'executing'` (entered at line 453 via `setPhase('executing')`) renders the live workout: it has its own `mode === 'rest'` countdown (lines 290–297), its own `mode === 'complete'` finish flow (line 315), and its own pause state — functionally the same responsibilities as `ActiveWorkoutView` + `RestOverlay` + `FinishConfirmDialog` + `WorkoutSummaryView` in the session engine, reimplemented separately.
- On completion it calls `saveWorkoutSession(...)` (`lib/actions/workouts.ts`), a different Server Action from the session engine's `createSession`/`logSet`/`completeSession` (`lib/actions/sessions.ts`) — two separate write paths into the same `workout_sessions`/`session_sets` tables, computed differently (`saveWorkoutSession` computes `total_volume_kg` server-side from a full `executedExercises` array in one batch write; the session engine computes it incrementally client-side via `addVolume()` and writes per-set via `logSet()`).
- It then `router.push('/workouts/history')` — never `/workouts/session`.

This is a genuine duplicate execution flow, not just a superficial naming coincidence: two different phase machines, two different rest-timer implementations, two different Server Actions, writing to the same schema through different code paths.

---

## Root Cause

Chronologically, per `docs/Changelog.md` and git tags:
- `generator-client.tsx`'s embedded execution phase was built in **Sprint 10.1** ("Rest Timer + step-by-step workout execution", tag `sprint-10.1`, 2026-06-17) — well before the dedicated engine existed.
- The standalone Workout Session Engine (`(session)` route group, `WorkoutSessionProvider`, sprints **W1–W7**) was designed and built **2026-06-29 to 2026-06-30**, per `docs/architecture/workout-session-engine-blueprint.md` and the W1–W7 sprint reports, explicitly to replace the ad-hoc execution flow with a more robust one (frozen exercise state, absolute-timestamp timers, autosave, a chrome-free layout to prevent accidental exits — all gaps that `generator-client.tsx`'s inline implementation does not address).
- **The cutover step was never performed.** Building the new engine and its route was completed; updating the five call sites above (Body Hub, Dashboard Today, My Workouts, Program-via-Body-Hub, Muscle Detail) to point at `/workouts/session?workoutId=...&scheduleDay=...&split=...` instead of `/workouts/generator?...` was not done. `docs/qa/QA-01-Workout-Session-Audit.md` (2026-06-30) audited the new engine in isolation and found and helped fix real defects in it, but did not check — and so did not catch — that nothing links to it.

In short: this is an incomplete migration, not a design flaw in either system individually.

---

## Affected Files

**Unreachable (fully built, zero inbound references):**
- `app/[locale]/(session)/workouts/session/page.tsx`
- `app/[locale]/(session)/layout.tsx`
- `components/workouts/session/workout-session-client.tsx`
- `components/workouts/session/workout-session-provider.tsx`
- `components/workouts/session/elapsed-timer.tsx`
- `components/workouts/session/views/workout-confirm-view.tsx`
- `components/workouts/session/views/active-workout-view.tsx`
- `components/workouts/session/views/exercise-transition-view.tsx`
- `components/workouts/session/views/workout-summary-view.tsx`
- `components/workouts/session/overlays/pause-overlay.tsx`
- `components/workouts/session/overlays/rest-overlay.tsx`
- `components/workouts/session/overlays/finish-confirm-dialog.tsx`
- `lib/actions/sessions.ts` (`createSession`, `logSet`, `completeSession` — called only from the above)

**Actually serving all live traffic (the duplicate flow):**
- `components/workouts/generator-client.tsx`
- `app/[locale]/(app)/workouts/generator/page.tsx`
- `lib/actions/workouts.ts` (`saveWorkoutSession` — the competing write path)

**Call sites that would need to change to complete the cutover:**
- `components/body/body-hub-client.tsx` (line 74–75)
- `components/dashboard/sections/today-section.tsx` (line 180)
- `components/workouts/workouts-client.tsx` (line 241)
- `components/body/muscle-detail-client.tsx` (line 103)
- `components/workouts/program-client.tsx` (indirectly, via the Body Hub round-trip at line 252)

---

## Recommended Fix

This is an architecture decision, not a mechanical bug fix — per `AGENTS.md`, it requires Product/Tech Lead sign-off before implementation, not a unilateral call by the implementation agent. Two viable directions, both legitimate:

**Option A — Complete the cutover (wire the new engine in).**
Update the five call sites above to route to `/workouts/session?workoutId=...&scheduleDay=...&split=...` instead of `/workouts/generator`. Retire `generator-client.tsx`'s `'executing'` phase (keep `'select'`/`'loading'`/`'preview'` — those still serve muscle selection and plan preview, which the session engine does not replace). Retire `saveWorkoutSession` in favor of `createSession`/`logSet`/`completeSession`. This captures the reliability work already done in the engine (frozen exercise state, absolute timers, autosave, chrome-free layout) and fixes the still-open engine gaps identified in the Project Audit (pause-time accounting, session recovery) as part of the same effort, since that work would then actually matter.

**Option B — Retire the new engine, keep the generator's flow.**
If the generator's embedded flow is considered good enough or the team prefers not to maintain a separate route group, fold the engine's specific fixes (absolute-timestamp timers instead of decrementing counters, the chrome-free `(session)` layout pattern to prevent accidental exits) back into `generator-client.tsx`'s existing `'executing'` phase, and delete the now-redundant `(session)` route group, `components/workouts/session/*`, and `lib/actions/sessions.ts`.

**Not recommended:** leaving both in place. Every hour spent polishing the session engine currently produces no user-facing value, and every hour spent on the generator's execution phase widens the gap that a future consolidation will have to close.

No code changes were made as part of this verification, per the task's instructions.
