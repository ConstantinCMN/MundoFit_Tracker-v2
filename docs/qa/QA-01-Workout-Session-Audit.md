# QA-01 — Workout Session Engine Audit

**Date:** 2026-06-30  
**Auditor:** Senior QA Engineer (QA Sprint 01)  
**Scope:** Workout Session Engine — Sprints W1 through W7 (Milestone 1)  
**Status:** AUDIT COMPLETE

---

## Executive Summary

The Workout Session Engine (W1–W7) delivers a solid core loop: a user can start a workout, log sets with pre-fill from previous performance, navigate through exercises, and receive a real completion summary. The architecture — `WorkoutSessionProvider` + status-driven router + frozen `initialData` — is clean and the critical set-logging path is well-guarded against double-submission.

However, **four issues constitute blocking defects** before beta release. The most severe renders the session UI unrecoverable after "Cancel Workout" (blank screen, no navigation). The global app shell remains mounted during sessions, exposing the user to accidental exit with no warning. Persistent state in localStorage is never updated after session start, making mid-session refresh a destructive operation. And the Supabase `workout_sessions.total_volume_kg` column is systematically never written, silently corrupting the data layer for any downstream analytics or history queries.

These four issues are fixable with targeted, low-risk changes. The foundation is strong enough to proceed to W8–W9 once they are resolved.

**Verdict: NOT READY FOR NEXT MILESTONE** — fix blocking defects first.

---

## Testing Scope

| Sprint | Feature | Covered |
|---|---|---|
| W1 | Session page + WorkoutConfirmView | ✅ |
| W2 | WorkoutSessionProvider, status machine, router | ✅ |
| W3A | ActiveWorkoutView layout (zones, set rows) | ✅ |
| W3B | Set completion flow, logSet(), weight/rep inputs | ✅ |
| W3C | RestOverlay, ExerciseTransitionView | ✅ |
| W4 | Exercise navigation (prev/next/frontier invariant) | ✅ |
| W5 | PauseOverlay, previous performance | ✅ |
| W6 | FinishConfirmDialog, completeSession(), ElapsedTimer | ✅ |
| W7 | WorkoutSummaryView, volume accumulation | ✅ |

**Files read:** `app/[locale]/(app)/workouts/session/page.tsx`, `workout-session-client.tsx`, `workout-session-provider.tsx`, `views/active-workout-view.tsx`, `views/exercise-transition-view.tsx`, `views/workout-summary-view.tsx`, `views/workout-confirm-view.tsx`, `overlays/finish-confirm-dialog.tsx`, `overlays/pause-overlay.tsx`, `overlays/rest-overlay.tsx`, `elapsed-timer.tsx`, `lib/actions/sessions.ts`, `components/layout/app-shell.tsx`, `components/layout/header.tsx`, `components/layout/bottom-nav.tsx`, `supabase/migrations/20240101000000_initial_schema.sql`, `docs/architecture/workout-session-engine-blueprint.md`

---

## Critical Issues

### C-01 — "Cancel Workout" produces a permanent blank screen

**Severity:** Critical  
**Area:** Functional / UX  

**Description:** In `PauseOverlay`, the "Cancel Workout" button calls `setStatus('cancelled')`. The session router (`workout-session-client.tsx`) has no branch that renders anything for `status === 'cancelled'`. The result is a blank page. There is no navigation to dashboard, no localStorage cleanup, and no recovery path. The user is trapped.

**Root Cause:** The `'cancelled'` status was defined in the `SessionStatus` union type but never wired into the router's conditional rendering. The architecture blueprint (§9.2) specifies that `'cancelled'` should navigate to `/dashboard` and clear session state.

**Evidence:**
```typescript
// pause-overlay.tsx
<button onClick={() => setStatus('cancelled')}>Cancel Workout</button>

// workout-session-client.tsx — no branch for 'cancelled'
const showConfirm  = status === 'idle' || status === 'error';
const showActive   = status === 'active' || ...;
const showTransition = status === 'transitioning';
const showSummary  = status === 'completing' || status === 'completed';
// Nothing renders when status = 'cancelled'
```

**Suggested Fix:**
1. In the router, add a `useEffect` that watches for `status === 'cancelled'` and calls `router.push('/dashboard')` + `localStorage.removeItem(SESSION_STORAGE_KEY)`.
2. Alternatively, handle cancellation inside `PauseOverlay` directly: clear localStorage, then `router.push('/dashboard')`.

**Estimated Effort:** 1–2 hours

---

### C-02 — `workout_sessions.total_volume_kg` is never written to the database

**Severity:** Critical  
**Area:** Database Integrity  

**Description:** The `workout_sessions` table has a `total_volume_kg numeric(10,2)` column. `completeSession()` writes only `ended_at` and `duration_sec`. The column remains `NULL` for every completed session. The summary screen reads volume from in-memory provider state (correct), but the database record is silent about volume. Any history view, analytics query, or downstream feature that reads `total_volume_kg` from the DB will receive `NULL`.

**Root Cause:** The W6 `completeSession()` server action was written before volume tracking was added in W7. The parameter list was never updated to include volume.

**Evidence:**
```typescript
// lib/actions/sessions.ts
const { error } = await supabase
  .from('workout_sessions')
  .update({ ended_at: endedAt, duration_sec: durationSec })  // ← no total_volume_kg
  .eq('id', sessionId)
  .eq('user_id', user.id);
```

**Suggested Fix:** Add `totalVolumeKg: number` to `completeSession()`'s parameter list and include it in the UPDATE: `{ ended_at: endedAt, duration_sec: durationSec, total_volume_kg: totalVolumeKg }`. Update the `finishWorkout()` call in the provider to pass `totalVolumeKg`.

**Estimated Effort:** 30 minutes

---

### C-03 — Global bottom navigation is visible and tappable during sessions

**Severity:** Critical  
**Area:** UX / Navigation Safety  

**Description:** `BottomNav` is rendered for all `(app)` routes via `app-shell.tsx`. During an active session, the user can tap any bottom tab (Dashboard, Weight, Body, Calories, Profile) and immediately navigate away from the session with no warning. The session persists in the DB as incomplete (`ended_at IS NULL`) and the localStorage blob remains stale. There is no indication in the session UI that the bottom navigation is dangerous.

The architecture blueprint (§8.7) explicitly states: "During an active session, the bottom navigation bar MUST be hidden."

**Root Cause:** The `(app)` layout group uses a shared `AppShell` that always renders `BottomNav`. No session-specific layout override was created.

**Suggested Fix:** Detect session context in `AppShell` or create a `(session)` route group at `app/[locale]/(session)/workouts/session/` that renders without `AppShell`, using a standalone layout file.

**Estimated Effort:** 2–3 hours

---

### C-04 — Global app `Header` with live back button is visible during sessions

**Severity:** Critical  
**Area:** UX / Navigation Safety  

**Description:** `Header` renders for all `(app)` routes. For `/workouts/session`, `isNested = true` (more than one segment), so the back button (`router.back()`) is visible and active. Tapping it exits the session immediately with no confirmation. No navigation guard exists. The session orphaned in DB, localStorage not cleared.

Combined with C-03, this means the session screen provides **three separate accidental-exit paths** (back button, any bottom nav tab, browser swipe-back) with zero warnings.

**Root Cause:** Same root cause as C-03 — `AppShell` has no session awareness.

**Suggested Fix:** Same remedy as C-03. A standalone session layout eliminates both C-03 and C-04 together. Alternatively, the session page can use `beforeunload`/`router.beforePopState` guards while still sharing the shell, but a dedicated layout is cleaner.

**Estimated Effort:** Covered by C-03 fix

---

## High Priority Issues

### H-01 — localStorage is never updated after session start

**Severity:** High  
**Area:** Data Persistence / Recovery  

**Description:** `writeSessionToStorage()` is called exactly once: at the end of `startSession()`. After that, all session state changes — exercise advances, set completions, `frontierExerciseIndex`, `totalSetsCompleted`, `totalVolumeKg` — exist only in React state. If the user refreshes the browser or the browser crashes, the recovery blob has no record of any progress. W8 (session recovery) will read this stale blob and restore the user to exercise 0, set 0.

**Root Cause:** Recovery blob writing was deferred but the in-progress state fields were never added to `writeSessionToStorage()` calls, and no mechanism triggers a re-write on state change.

**Suggested Fix:** Update `writeSessionToStorage()` to accept the full mutable state (frontierIndex, setsCompleted, volumeKg), and call it inside `beginTransition()`, `confirmAdvance()`, and `incrementCompletedSets()`. Alternatively, use a `useEffect` that watches these three values and writes on change (debounced to 500ms to avoid excessive writes on rapid set logging).

**Estimated Effort:** 3–4 hours

---

### H-02 — Duration includes paused time

**Severity:** High  
**Area:** Data Accuracy  

**Description:** `finishWorkout()` computes duration as `Date.now() - new Date(startedAt).getTime()`. If the user pauses for 5 minutes mid-workout, those 5 minutes are counted toward the session duration. A 30-minute workout that was paused for 10 minutes reports 40 minutes.

The architecture blueprint (§5.3) specifies `accumulatedPauseMs` — the provider should record the timestamp when entering `'paused'` state and accumulate elapsed pause time on resume. Duration = `(endedAt - startedAt) - accumulatedPauseMs`.

**Root Cause:** `accumulatedPauseMs` tracking was never implemented. The pause/resume logic (`setStatus('paused')` → `setStatus('active')`) has no timestamp accounting.

**Suggested Fix:** Add `pausedAt: string | null` and `accumulatedPauseMs: number` state to the provider. When entering `'paused'`, record `pausedAt = new Date().toISOString()`. When returning to `'active'` from `'paused'`, add `Date.now() - new Date(pausedAt).getTime()` to `accumulatedPauseMs`. Use `accumulatedPauseMs` in `finishWorkout()`.

**Estimated Effort:** 2–3 hours

---

### H-03 — Previous performance query has no LIMIT and no date filter

**Severity:** High  
**Area:** Performance  

**Description:** `page.tsx` queries `session_sets` for all historical sets for the workout's exercise IDs:

```typescript
const { data: prevRaw } = await supabase
  .from('session_sets')
  .select('exercise_id, reps, weight_kg, set_number, workout_sessions(started_at)')
  .in('exercise_id', exerciseIds)
  .eq('completed', true);
// No LIMIT, no date filter
```

For an active user doing Bench Press 3×/week for 2 years: ~300 sessions × 4 sets = 1,200 rows for one exercise. A 5-exercise workout returns ~6,000 rows. Only the most recent completed set per exercise is actually used (JS-side sort + first element). All other rows are transferred, parsed, and discarded.

**Root Cause:** The query was written for correctness (get all history, sort JS-side) without a performance constraint. No LIMIT clause was added.

**Suggested Fix:** Add `.order('created_at', { ascending: false }).limit(exerciseIds.length * 10)` to cap results at 10 sets per exercise at most. Better: use a Supabase RPC that returns only the most recent completed set per exercise (a `DISTINCT ON (exercise_id)` query).

**Estimated Effort:** 2–4 hours

---

### H-04 — Rest timer does not self-correct after browser backgrounding

**Severity:** High  
**Area:** Reliability / Mobile UX  

**Description:** `RestOverlay` counts down using a `setTimeout` chain (`secondsLeft` decrement per tick). Mobile browsers throttle or suspend JavaScript timers when the screen locks or the app backgrounds. After a 90-second rest with a 30-second phone lock, the displayed timer might show 60 seconds remaining instead of the correct 0 (or negative). The timer doesn't self-correct because it tracks elapsed ticks, not elapsed wall time.

The architecture blueprint (§6.1) specifies using `restStartedAt + restDurationSec - Date.now()` for each tick so the timer catches up automatically.

**Root Cause:** `RestOverlay` uses `useState(initialSeconds)` as the count-down value, decrementing by 1 each timeout tick rather than computing remaining time from an absolute reference.

**Suggested Fix:** Replace the decrement approach with: compute `remaining = Math.ceil((restStartedAt + restSec * 1000 - Date.now()) / 1000)` on each tick. Store `restStartedAt` (Date.now() at mount) in a ref. Each tick fires `setTimeout(tick, 1000)` but uses wall-clock delta, not tick count.

**Estimated Effort:** 1–2 hours

---

## Medium Priority Issues

### M-01 — Empty workout (0 exercises) is not guarded server-side

**Severity:** Medium  
**Area:** Edge Case / Data Integrity  

**Description:** `page.tsx` validates that `workout` exists but not that `exercises` is non-empty. If a workout has no exercises (deleted all, edge-case data state), the page renders `WorkoutConfirmView` showing "0 exercises." If the user taps "Start Workout," a `workout_sessions` row is created in the DB, `status` becomes `'active'`, and `ActiveWorkoutView` tries to render `exercises[0]` → `undefined` → `return null` → blank screen. The user is stuck with an orphaned session in the DB.

**Suggested Fix:** Add `if (!exercises || exercises.length === 0) redirect(...)` after the exercises query in `page.tsx`.

**Estimated Effort:** 30 minutes

---

### M-02 — `createSession` does not validate that `workoutId` belongs to the current user

**Severity:** Medium  
**Area:** Security / Data Integrity  

**Description:** `createSession(workoutId, workoutName, startedAt)` inserts into `workout_sessions` with the provided `workoutId` as a foreign key. The server action checks `auth.getUser()` for authentication but does not verify that the provided `workoutId` is owned by the current user. An authenticated user who knows another user's workout UUID could create a `workout_sessions` row referencing another user's workout.

The page.tsx does validate ownership (`eq('user_id', user.id)`) before passing the ID, but server actions should not rely on the caller for authorization.

**Suggested Fix:** In `createSession()`, before inserting, verify `SELECT id FROM workouts WHERE id = workoutId AND user_id = auth.uid()`. Return an error if the check fails.

**Estimated Effort:** 1 hour

---

### M-03 — Previous performance query may include current session's sets on recovery

**Severity:** Medium  
**Area:** Data Accuracy  

**Description:** The previous performance query runs server-side on page load. In the normal flow, the session doesn't exist yet at page load time (created client-side when "Start Workout" is tapped), so the query correctly excludes the current session. However, if the user refreshes mid-session (W8 recovery scenario), the current session already has `session_sets` rows. These will appear in the "previous performance" query, causing the current-session data to be presented as the pre-fill "last time" value.

**Suggested Fix:** When the recovery flow is implemented (W8), pass the recovered `sessionId` to the page and add `.neq('session_id', sessionId)` to the previous performance query.

**Estimated Effort:** 1 hour (deferred to W8)

---

### M-04 — `setStatus` is exposed directly in context, enabling invalid state transitions

**Severity:** Medium  
**Area:** Architecture / Reliability  

**Description:** `setStatus: (status: SessionStatus) => void` is exported directly in the context type. Any component can call `setStatus('completed')` without going through `finishWorkout()`, bypassing localStorage cleanup, DB write, and duration capture. As the codebase grows, this creates risk of orphaned state (e.g., marking completed without writing `ended_at`).

**Root Cause:** `setStatus` was originally exposed for simplicity (the architecture iterates quickly). Several overlays use it for simple transitions (`setStatus('active')`, `setStatus('paused')`) where a dedicated callback wasn't needed.

**Suggested Fix:** Remove `setStatus` from the public context API. Replace with named transition callbacks for each status change a component needs to trigger: `resumeWorkout()`, `pauseWorkout()`, `cancelWorkout()`. The `cancelWorkout()` callback would own the navigation + localStorage cleanup logic (fixing C-01 simultaneously).

**Estimated Effort:** 3–4 hours (best done alongside C-01 fix)

---

### M-05 — No feedback when `completeSession()` fails

**Severity:** Medium  
**Area:** Error Handling / Reliability  

**Description:** `finishWorkout()` calls `await completeSession(...)` but ignores the returned `{ error }` result. If the network fails or RLS rejects the UPDATE, `status` advances to `'completed'` anyway and the user sees a normal summary screen. The session row in the DB has `ended_at = NULL` and `duration_sec = NULL`. The session is silently incomplete.

**Suggested Fix:** Check the return value of `completeSession()`. On failure, set `status('error')` and expose the error for display. W9 is the right milestone to address retry logic.

**Estimated Effort:** 1–2 hours (deferred to W9)

---

### M-06 — `ElapsedTimer` does not subtract paused time

**Severity:** Medium  
**Area:** Data Display  

**Description:** `ElapsedTimer` computes `Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)` — identical to the duration bug in H-02. The displayed elapsed time includes pause time. A user who pauses for 3 minutes will see the timer advance through the pause.

**Suggested Fix:** After H-02 is fixed, pass `accumulatedPauseMs` to `ElapsedTimer` (or read it from context) and subtract it from the elapsed calculation.

**Estimated Effort:** Covered by H-02 fix

---

## Low Priority Issues

### L-01 — `formatVolume` does not handle values ≥ 1,000,000 kg

**Severity:** Low  
**Area:** Display  

**Description:** The manual thousands formatter (`Math.floor(r / 1000)` + `padStart(3, '0')`) produces `"1000,000 kg"` for 1,000,000 kg (missing the inner comma). Practically impossible for a fitness tracker, but technically incorrect.

**Suggested Fix:** Add a second grouping level: if `Math.floor(r / 1_000_000) > 0`, format with two commas. Or: use `Intl.NumberFormat` with `useGrouping: true` since the ambiguity was only for thousand-separator locales, not for the grouping character itself.

**Estimated Effort:** 30 minutes

---

### L-02 — Previous performance sort uses string comparison on ISO timestamps

**Severity:** Low  
**Area:** Reliability  

**Description:** `prevRaw.sort((a, b) => dateB.localeCompare(dateA))` sorts by ISO 8601 string. This works correctly only when all timestamps use the same format (UTC `Z` suffix, same precision). All `started_at` values are generated via `new Date().toISOString()` (always `Z`, always millisecond precision), so in practice this is correct. However, if any timestamp is ever stored in a different format (e.g., from a direct DB insert with a timezone offset), the sort would silently produce wrong results.

**Suggested Fix:** Sort by `new Date(dateA).getTime()` instead of string comparison.

**Estimated Effort:** 15 minutes

---

### L-03 — `workout_sessions` `started_at` is client-generated

**Severity:** Low  
**Area:** Security / Data Accuracy  

**Description:** `startedAt = new Date().toISOString()` is computed on the client and sent to `createSession()`. A user who manipulates their device clock can backdate sessions. Not a meaningful attack vector for a personal fitness app, but worth noting if leaderboards or streak features are added.

**Suggested Fix:** For now, acceptable. If competitive features are added, consider generating `started_at` server-side using `now()` in the INSERT.

**Estimated Effort:** 30 minutes (deferred to when relevant)

---

## UX Improvement Observations

**UX-01 — No navigation guard for accidental exit**  
The spec (§7.8) requires a confirmation prompt when the user attempts to leave an active session. No guard exists on any exit path (back button, tab switch, browser swipe). This is partially covered by fixing C-03/C-04 (remove the accidental paths), but a `beforeunload` guard should also exist for browser-level navigation.

**UX-02 — Cancel Workout goes straight to blank screen (no confirmation step)**  
Even after fixing C-01, the cancel flow should show a secondary confirmation ("Are you sure? This session will not be saved.") rather than immediately cancelling. The current "Cancel Workout" button in PauseOverlay fires immediately on tap.

**UX-03 — Pause overlay does not show elapsed time**  
The pause screen shows no workout progress or time elapsed. Users often pause to check the time or plan the next exercise. Showing elapsed time on the pause overlay would be useful.

**UX-04 — Weight input is +/- only (no direct text entry)**  
The UX spec (§4.3) specifies "tap weight value → opens numeric keyboard." Only the +/- stepper is implemented. For large weight adjustments (e.g., from 60 kg to 100 kg), the user taps the + button 16 times.

**UX-05 — No "All sets done" hint before last exercise advances to Finish**  
The spec (§6.5) describes a "Great work." or "All sets done." hint appearing after the last set. This was not implemented. The CTA transitions directly from "Log Set" to "Finish Workout" without any acknowledgement.

**UX-06 — Workout Summary "Done" navigates to Dashboard, not History**  
After completing a workout, the user has no path to see their workout in history without navigating through the bottom nav. A secondary "View in History" link on the summary would improve the loop.

**UX-07 — No per-exercise breakdown on summary screen**  
The UX spec (§6.7) shows a per-exercise list on the summary (exercise name, sets, top weight). Only the aggregate grid is implemented. Users cannot review their performance per exercise without navigating to the history view (not yet built).

---

## Performance Observations

**PERF-01 — No pagination on previous performance query (see H-03)**  
Already documented. The immediate fix is a LIMIT. The ideal fix is a DB-level `DISTINCT ON (exercise_id)` RPC.

**PERF-02 — Context value object is recreated on every state change**  
The `useMemo` dependency array includes all provider state values and callbacks. Any state change (e.g., `totalSetsCompleted` incrementing) produces a new context object, causing all `useWorkoutSession()` consumers to re-render. For a session with 20 sets across 5 exercises, this is ~20 context re-renders per session. Acceptable now, but will compound as more components consume the context. Consider splitting context into stable data (initialData, sessionId, startedAt) and volatile state (status, counters) for future optimization.

**PERF-03 — `ElapsedTimer` `setInterval` is benign but worth noting**  
The 1-second interval fires for the entire session duration. Since `ElapsedTimer` is a leaf component with minimal JSX, re-renders are cheap. No action needed.

---

## Security Observations

**SEC-01 — `createSession` accepts unvalidated `workoutId` (see M-02)**  
Already documented. An authenticated user can reference another user's workout in their session record.

**SEC-02 — `session_sets` RLS uses an indirect EXISTS subquery**  
RLS: `EXISTS (SELECT 1 FROM workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid())`. This is correct and standard. The correlated subquery runs for every row access but is indexed (`session_sets.session_id`, `workout_sessions.user_id`). No data leakage risk. Only noting because indirect RLS patterns require periodic review as schema evolves.

**SEC-03 — No rate limiting on `logSet()` server action**  
An authenticated user with a valid `sessionId` could send thousands of `logSet()` calls per second via direct server action invocation. No throttle exists at the application layer. For beta, the Supabase connection pool is the de-facto rate limiter. A production deployment should add server-side rate limiting (e.g., via Next.js middleware with token bucket per `user_id`).

**SEC-04 — `session_sets` RLS has no explicit `WITH CHECK` clause**  
The policy: `CREATE POLICY ... USING (EXISTS (...))`. In PostgreSQL, a policy without `WITH CHECK` uses the `USING` expression for both SELECT and DML `WITH CHECK` implicitly. For INSERT, this means the policy checks `ws.user_id = auth.uid()` against the provided `session_id` — correct. This is safe but relies on implicit PostgreSQL behavior. An explicit `WITH CHECK` clause would make the intent unambiguous.

---

## Accessibility Observations

**A-01 — Progress bar has no ARIA attributes**  
The exercise progress bar (`h-1 bg-[#aaff00]`) has no `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, or `aria-valuemax`. Screen readers cannot announce workout progress.

**A-02 — Color contrast failures on muted text**  
`#555555` on `#0a0a0a` background: contrast ratio ≈ 2.69:1. WCAG AA requires 4.5:1 for normal text (18px+ or 14px+ bold). Affected elements: elapsed timer (`text-[#555555]`), exercise count text, "Workout Complete" label, stat card labels. These are informational labels, not interactive, but still fail the AA threshold.

**A-03 — Exercise navigation buttons are below 44px touch target**  
`py-2` padding + 12px font = ~28px effective height. WCAG 2.5.5 (AAA) recommends 44×44px minimum. The interactive area is too small for reliable touch, especially mid-workout with sweaty hands.

**A-04 — `FinishConfirmDialog` and `PauseOverlay` have no focus trap**  
Both overlays use `fixed inset-0` positioning but do not trap keyboard focus. Keyboard and screen reader users can navigate to content behind the overlay. Should use `inert` attribute on background content or a focus-trap library.

**A-05 — Set row buttons lack descriptive `aria-label`**  
Set rows are `<button>` elements with text content like "1" (set number) + weight/rep display. Screen readers will announce just the visible text with no semantic context. Each button should have `aria-label="Set 1, 60 kg × 8 reps, completed"` or similar.

**A-06 — `RestOverlay` has no keyboard trap**  
The rest overlay is `absolute inset-0 z-30` within the component tree, not a portal. A keyboard user pressing Tab could reach elements behind it.

---

## Architecture Review

### Strengths

**Status machine design:** The `SessionStatus` union with a router-level conditional render (`showActive`, `showSummary`, etc.) is clean. Transitions are predictable and the session cannot be in an ambiguous state.

**Frozen `initialData`:** Passing all workout data at session start and freezing it in provider state eliminates race conditions with the workouts list being edited mid-session. The `FrozenExercise` type makes this intent explicit.

**Double-tap guards:** The `useRef` pattern (`hasAdvancedRef`, `hasFinishedRef`, `loggedSetsRef`) is applied consistently and correctly at all points where duplicate DB writes would be harmful.

**`key={currentExerciseIndex}` remount:** Using React's `key` prop to fully remount `ActiveWorkoutView` on exercise change elegantly resets all local state (set selection, completedSets, inputs) without manual cleanup.

**Fire-and-forget `logSet()`:** Accepting silent failures for set logging in exchange for zero-latency UX is the right tradeoff for a workout app. W9's retry queue will address the reliability gap.

### Weaknesses

**`setStatus` in public API:** As documented in M-04, exposing raw `setStatus` creates an unguarded state machine. The status type defines a complex enum but nothing enforces valid transitions.

**localStorage write-once:** The recovery blob is written once but never updated. This is the single largest gap between the blueprint's intent and the implementation.

**No error state rendering:** `status === 'error'` exists in the type but the router renders `WorkoutConfirmView` for it (`showConfirm = status === 'idle' || status === 'error'`). An error during session creation shows the confirm screen with no visible error message (the `error` value is in context but `WorkoutConfirmView` doesn't display it prominently). Verify `WorkoutConfirmView` surfaces the `error` string.

**Session layout coupling:** The session UI assumes it has full-screen control but runs inside the global `AppShell`. The mismatch between the intended standalone session experience and the shared app layout causes C-03 and C-04.

---

## Production Readiness

| Area | Status | Blocking? |
|---|---|---|
| Session start flow | ✅ Functional | No |
| Set logging (happy path) | ✅ Functional | No |
| Rest timer | ⚠️ Doesn't self-correct on background | No (acceptable for beta) |
| Exercise navigation | ✅ Functional | No |
| Session completion (DB) | ⚠️ Volume not written to DB | **Yes** |
| Cancel workout | ❌ Blank screen | **Yes** |
| Global navigation during session | ❌ No warning, no guard | **Yes** |
| localStorage persistence | ❌ Stale after session start | **Yes** |
| Previous performance | ⚠️ No LIMIT on query | No (acceptable for beta) |
| Workout Summary | ✅ Functional | No |
| Empty workout guard | ❌ Missing | No (low-probability for beta) |
| Accessibility | ⚠️ Multiple failures | No (beta) |
| Security (RLS) | ✅ Correctly scoped | No |

---

## Final Recommendation

**NOT READY FOR NEXT MILESTONE**

The implementation demonstrates a well-designed architecture and a solid core workout loop. W1–W7 are functionally complete for the happy path. However, four blocking defects prevent a beta release:

1. **C-01** — Cancel Workout crashes the session UI (blank screen)
2. **C-02** — Volume is never persisted to the database
3. **C-03 + C-04** — Global navigation shell exposes three accidental-exit paths with no protection

Additionally, H-01 (localStorage not updated) will make W8 recovery ineffective — W8 cannot be correctly implemented until localStorage is kept current.

**Recommended action before proceeding to W8:**
1. Fix C-01: wire `'cancelled'` status to clear state and navigate to dashboard
2. Fix C-02: pass `totalVolumeKg` to `completeSession()` and write it to DB
3. Fix C-03/C-04: create a standalone session layout (or hide nav/header conditionally)
4. Fix H-01: update localStorage blob on exercise advance and set completion

These four fixes are independent, low-risk, and together constitute a focused "pre-W8 patch sprint" of roughly one day of engineering effort.

---

## Quality Scores

| Dimension | Score | Notes |
|---|---|---|
| Architecture | 7.5 / 10 | Clean status machine, frozen data, good guards; weakened by exposed setStatus and layout coupling |
| Code Quality | 7.0 / 10 | Consistent patterns, good typing; localStorage write-once and missing DB write lower the score |
| UX | 5.0 / 10 | Core loop feels good; three accidental-exit paths, no pause-time exclusion, and no weight text input hurt significantly |
| Performance | 6.5 / 10 | Unbounded history query is the main gap; ElapsedTimer and context memo are fine |
| Maintainability | 7.5 / 10 | Clear file structure, named callbacks, good comments; setStatus exposure and session/layout coupling are future maintenance risks |
| Reliability | 5.5 / 10 | Happy path reliable; cancel → blank screen, silent completeSession failure, and rest timer drift under backgrounding are all reliability gaps |
| **Overall** | **6.5 / 10** | |

---

## Issue Summary Table

| ID | Severity | Area | Description | Effort |
|---|---|---|---|---|
| C-01 | Critical | Functional | Cancel Workout → blank screen | 1–2h |
| C-02 | Critical | DB Integrity | `total_volume_kg` never written | 30m |
| C-03 | Critical | UX/Safety | Bottom nav visible during session | 2–3h |
| C-04 | Critical | UX/Safety | Global header back button active during session | (C-03 fix) |
| H-01 | High | Persistence | localStorage not updated after session start | 3–4h |
| H-02 | High | Accuracy | Duration includes paused time | 2–3h |
| H-03 | High | Performance | Previous performance query unbounded | 2–4h |
| H-04 | High | Reliability | Rest timer drifts after backgrounding | 1–2h |
| M-01 | Medium | Edge Case | Empty workout not guarded | 30m |
| M-02 | Medium | Security | `workoutId` not validated in createSession | 1h |
| M-03 | Medium | Accuracy | Previous perf includes current session sets on recovery | 1h |
| M-04 | Medium | Architecture | `setStatus` exposed in context API | 3–4h |
| M-05 | Medium | Reliability | `completeSession()` failure silently ignored | 1–2h |
| M-06 | Medium | Display | ElapsedTimer includes paused time | (H-02 fix) |
| L-01 | Low | Display | `formatVolume` breaks at ≥ 1,000,000 kg | 30m |
| L-02 | Low | Reliability | Timestamp sort uses string comparison | 15m |
| L-03 | Low | Security | `started_at` is client-generated | 30m |

---

*QA-01 completed 2026-06-30. No code was modified during this audit.*
