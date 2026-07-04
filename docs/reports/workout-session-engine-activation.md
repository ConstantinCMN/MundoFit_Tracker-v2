# Workout Session Engine Activation — Implementation Report

**Date:** 2026-07-04
**Task:** Activate the Workout Session Engine as the official execution flow, per the architecture decision confirmed by the user and the migration plan in `docs/reports/critical-audit-01-workout-entry.md`.
**Scope discipline:** Entry-point routing only. No Workout Session Engine files were touched. No new features were added. No visual/UI changes were made anywhere — only navigation *destinations* changed, and one now-unreachable execution flow was removed as dead code.

---

## Summary

Every entry point that led users into `generator-client.tsx`'s embedded execution phase now hands off to the real Workout Session Engine (`/workouts/session`) instead. The two entry points that already had a saved `workoutId` (Dashboard Today, My Workouts) now navigate to `/workouts/session` directly. The two entry points that start from a muscle selection with no workout yet (Body Hub, Muscle Detail) still pass through `/workouts/generator` — this is required, not a bug: no workout row exists until the generator's plan is generated and saved — but the generator's own "Start Workout" action now redirects to `/workouts/session?workoutId=...` instead of switching to its own local `'executing'` phase, which has been removed entirely as dead code.

---

## Entry Points Migrated

| Entry point | Before | After | Why |
|---|---|---|---|
| Dashboard Today card (`today-section.tsx`) | `/workouts/generator?workoutId=X&scheduleDay=Y&split=Z` | `/workouts/session?workoutId=X&scheduleDay=Y&split=Z` | A workout row already exists (today's scheduled workout) — no generation needed, so it now launches the session engine directly, matching the architecture blueprint's Path B exactly. |
| My Workouts card (`workouts-client.tsx`) | `/workouts/generator?workoutId=X` | `/workouts/session?workoutId=X` | Same reasoning — resuming a saved workout, matching Path C. |
| Generator's internal "Start Workout" (`generator-client.tsx`, `handleStartWorkout`) | Set local `phase = 'executing'`, rendering ~230 lines of embedded rest-timer/set-logging/completion UI | `router.push('/workouts/session?workoutId=...&scheduleDay=...&split=...')` | This is the actual hand-off point for *every* flow that starts from a fresh muscle selection (Body Hub, Muscle Detail) — by the time this fires, `saveGeneratedWorkout` (or `getWorkoutPlanById` for a resume) has already produced a `workoutId`, so redirecting here is always safe. This removes the duplicate execution flow at its source. |

**Left unchanged, correctly:**
- Body Hub's muscle-confirmation push (`/workouts/generator?muscles=...`) — no workout exists yet; the generator must still run to produce one.
- Muscle Detail's link (`/workouts/generator?muscles=...`) — same reasoning.
- My Workouts' "New Workout" / empty-state CTAs (`/workouts/generator`, no params) — legitimately land on the generator's manual muscle-selection screen (`'select'` phase), which the session engine does not replace.
- Program/Schedule (`program-client.tsx`) and Workout Start (`split-type-selector-client.tsx`) — both route to `/body?split=...`, i.e. Body Hub, not directly to the generator or session engine; unaffected by this migration, verified unchanged.
- Workout History's empty-state CTA — routes to `/body`; unaffected.

---

## Files Modified

- **`components/dashboard/sections/today-section.tsx`** — changed the Today card's "Start" button target from `/workouts/generator` to `/workouts/session` (one line).
- **`components/workouts/workouts-client.tsx`** — changed the saved-workout card's `onCardClick` target from `/workouts/generator` to `/workouts/session` (one line).
- **`components/workouts/generator-client.tsx`** — the substantive change:
  - `handleStartWorkout()` rewritten to redirect to `/workouts/session` instead of entering a local `'executing'` phase.
  - Removed the entire dead `'executing'` phase render block and its exclusive state: the `ExecMode`/`SaveStatus` types, `exIdx`/`setNum`/`mode`/`seconds`/`paused`/`saveStatus`/`saveError` state, `startedAtRef`/`pauseStartRef`/`totalPausedMsRef` refs, the three `useEffect`s driving the rest countdown/auto-advance/auto-save-on-completion, and the handlers `completeSet`, `updateWeight`, `advanceNow`, `skipRest`, `handlePause`, `handleResume`.
  - Removed now-unused imports: `saveWorkoutSession` (from `lib/actions/workouts`), and the `Pause`, `Play`, `SkipForward`, `CheckCircle` icons (from `lucide-react`).
  - `Phase` narrowed from `'select' | 'loading' | 'preview' | 'executing'` to `'select' | 'loading' | 'preview'`.
  - File went from 952 lines to 562 lines. The `'select'`, `'loading'`, and `'preview'` phases — muscle selection, goal/level pickers, generation, and plan preview — are untouched; their JSX, copy, and styling were not modified in any way.

No other files were changed.

---

## Verification — Every Workout Launch Path

Re-traced every path via the same exhaustive grep methodology used in the critical audit, after the changes:

1. **Body Hub** → confirms muscles → `/workouts/generator?muscles=...` (unavoidable — no workout exists yet) → generator auto-generates and saves a plan → Preview → **"Start Workout" now redirects to `/workouts/session?workoutId=...`**. ✅ Reaches the engine.
2. **Dashboard Today** → **`/workouts/session?workoutId=...` directly**. ✅ Reaches the engine.
3. **My Workouts** → tapping a saved workout → **`/workouts/session?workoutId=...` directly**. ✅ Reaches the engine.
4. **Program/Schedule** → unchanged, routes to Body Hub (`/body?split=...&scheduleDay=...`) → same path as #1 from there. ✅ Reaches the engine (via Body Hub).
5. **Muscle Detail** → `/workouts/generator?muscles=...` → same path as #1 from there. ✅ Reaches the engine.
6. **Workout Start** (split selector) → unchanged, routes to Body Hub (`/body?split=...`) → same path as #1 from there. ✅ Reaches the engine.
7. **Workout History** → empty-state CTA routes to `/body` (Body Hub) → same path as #1; the "view details" interaction opens a read-only `SessionDetailSheet`, not a launch path — unaffected, correctly. ✅
8. **Any other launch point** — re-grepped every `router.push`/`<Link href>` referencing `/workouts/*` repo-wide (see table above and raw grep output retained in this session); no remaining path terminates in `generator-client.tsx`'s own execution UI, because that UI no longer exists.

**Conclusion: every workout launch path now opens the Workout Session Engine for actual execution.** The generator is still legitimately used for muscle selection, plan generation, and preview where no workout exists yet — that is correct behavior, not a leftover duplicate — but nothing renders a second, competing execution screen anymore.

---

## Validation Results

### TypeScript
```
npm run type-check
> tsc --noEmit
```
**Result: PASS.** Zero errors.

### Build
```
npm run build
```
**Result: FAIL** — but for a reason unrelated to this migration:

```
./components/workouts/session/views/active-workout-view.tsx
299:20  Error: `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;`.  react/no-unescaped-entities
```

This is a pre-existing ESLint error (`react/no-unescaped-entities` on the apostrophe in `Today's target`) inside the Workout Session Engine itself, in a file this task explicitly instructed not to modify. It was not introduced by this migration — none of the changes in this report touch `components/workouts/session/*`. It was latent in every prior build of this codebase; it simply had not been surfaced in a full `next build` run before now. Compilation itself succeeds ("Compiled successfully in 6.6s"); only the lint step of the build fails.

**This was intentionally left unfixed.** Per the task's explicit constraints ("Do NOT change Workout Session Engine behavior") and `AGENTS.md`'s rule against unrequested changes, this single-character JSX escape fix — while safe and behavior-neutral — falls inside the file set this task told me not to touch, and fixing it was not part of the assigned migration. It is listed below as the top remaining issue.

---

## Remaining Issues

1. **Blocking the build:** `components/workouts/session/views/active-workout-view.tsx:299` — unescaped apostrophe in `Today's target` fails `react/no-unescaped-entities`. Trivial, zero-behavior-risk fix (`Today&apos;s target` or `Today’s target`), but requires someone to explicitly approve touching a Workout Session Engine file, since this task's scope was routing only.
2. **Now-unreachable code inside `generator-client.tsx`:** the `initialWorkoutId` prop and its associated resume effect (`getWorkoutPlanById` → `didLoadWorkoutRef` → `setPhase('preview')`) exist to let the generator jump straight to Preview when given a `workoutId`. Since both callers that used to pass `workoutId` to `/workouts/generator` (Dashboard Today, My Workouts) now go straight to `/workouts/session` instead, nothing in the app calls the generator with a `workoutId` anymore. This code is not broken — it would work correctly if invoked — but it is currently dead. Left in place deliberately: removing it was not necessary for the routing migration and would have gone beyond the requested scope. Worth a follow-up cleanup pass once confirmed it isn't needed for some other planned flow.
3. **`saveWorkoutSession`** (`lib/actions/workouts.ts`) — the competing write path into `workout_sessions`/`session_sets` that the old embedded execution phase used — is no longer called from anywhere (its only caller was the removed effect). Left in place, not deleted, for the same reason as #2: removing exported Server Actions from a shared file is a step beyond "migrate entry points," and doing it unilaterally risks removing something another in-progress branch expects. Flagging it here so it isn't forgotten.
4. All pre-existing gaps identified in the Project Audit and Critical Fix Audit that concern the Workout Session Engine's *own* behavior (pause-time accounting not excluded from duration, no `LIMIT` on the previous-performance query, `setStatus` still exposed raw in context, no session recovery/retry) are unchanged by this activation — they were explicitly out of scope ("Do NOT change Workout Session Engine behavior") and remain exactly as documented in `docs/reports/project-audit-v1.md`.

---

*Migration complete. Stopping here per the task's instructions.*
