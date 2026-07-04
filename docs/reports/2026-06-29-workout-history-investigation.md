# Investigation: Workout History Cards — "0 min / 0 exercises"

**Date:** 2026-06-29  
**Time:** 22:57  
**Type:** Bug Investigation — No code changes made  
**Triggered by:** Workout history cards displaying "0 min" and "0 exercises" for every session; Dashboard "Recent Workouts" always showing empty state despite existing `workout_sessions` records.

---

## Summary

Two distinct symptoms were reported. Investigation revealed they have different root causes and different classifications — one is an incomplete implementation (expected at this sprint stage), one is a pre-existing display bug in the old generator flow. No code was modified.

---

## Findings

### Finding 1 — "0 exercises" on Sprint W2 Sessions

**Classification: Incomplete implementation — expected at Sprint W2.**

The history page derives exercise count from `session_sets`:

```typescript
// app/[locale]/(app)/workouts/history/page.tsx:47
exerciseCount: new Set((session_sets ?? []).map(s => s.exercise_id)).size
```

Sprint W2's `createSession` server action (`lib/actions/sessions.ts`) only inserts the `workout_sessions` row. It does not write any `session_sets` rows. There are no `session_sets` records for Sprint W2 sessions, so `exerciseCount = 0` and the card renders "0 exercises".

The component does not guard against `exerciseCount === 0` — it renders the exercise row unconditionally for any session that has a `workout_id`:

```typescript
// components/workouts/workout-history-client.tsx:203
{!isDeletedWorkout && (
  <span>{t('plan.exercises', { count: session.exerciseCount })}</span>
)}
```

The old generator flow (`saveWorkoutSession` in `lib/actions/workouts.ts:341`) does insert `session_sets` rows at completion. Old generator sessions correctly show exercise count. Only Sprint W2 sessions are affected.

---

### Finding 2 — "0 min" on Old Generator Sessions

**Classification: Display bug — affects old generator sessions only; Sprint W2 sessions are not affected.**

The generator client computes duration on finish:

```typescript
// components/workouts/generator-client.tsx:326
const durationSec = Math.max(
  1,
  Math.round((endedAt.getTime() - startedAt.getTime() - totalPausedMs) / 1000)
);
```

The minimum stored value is 1 second (`Math.max(1, ...)`). This is stored directly in `workout_sessions.duration_sec`.

The history card display formula:

```typescript
// components/workouts/workout-history-client.tsx:144
const durationMin = session.duration_sec ? Math.round(session.duration_sec / 60) : null;
```

Any session with `duration_sec` between 1 and 29 seconds produces `Math.round(N/60) = 0`. Since `0` is truthy relative to the `!= null` check, the clock row renders as **"0 min"** rather than being hidden.

Sprint W2 sessions are unaffected: `createSession` leaves `duration_sec` as `null`. The ternary short-circuits to `null`, and the clock row is suppressed entirely. Sprint W2 sessions correctly show no duration.

---

### Finding 3 — Dashboard "Recent Workouts" Always Empty

**Classification: Incomplete implementation — known and expected.**

`RecentWorkoutSection` (`components/dashboard/sections/recent-workout-section.tsx`) is a fully static placeholder component. It accepts no props and executes no data query. It unconditionally renders the empty state UI. The Dashboard page (`app/[locale]/(app)/dashboard/page.tsx`) does not query `workout_sessions` at all.

This was documented in the Sprint W2 analysis. This section has never been wired to real data.

---

## Root Cause

| Symptom | Root Cause |
|---|---|
| "0 exercises" on Sprint W2 sessions | `createSession` (W2) does not insert `session_sets` rows; exercise count is derived from `session_sets` only |
| "0 min" on old generator sessions | `Math.round(durationSec / 60)` returns `0` for any session under 30 seconds; `0` passes the `!= null` guard and renders |
| Dashboard always empty | `RecentWorkoutSection` is a static placeholder with no data query |

---

## Affected Files

| File | Role |
|---|---|
| `lib/actions/sessions.ts` | Sprint W2 session creation — does not write `session_sets` |
| `lib/actions/workouts.ts` | Old generator session save — does write `session_sets`, but `durationSec` can be < 30s |
| `app/[locale]/(app)/workouts/history/page.tsx` | Derives `exerciseCount` from `session_sets` only |
| `components/workouts/workout-history-client.tsx` | Displays `exerciseCount` unconditionally; rounds `duration_sec` with `Math.round` |
| `components/dashboard/sections/recent-workout-section.tsx` | Static placeholder — no query |
| `app/[locale]/(app)/dashboard/page.tsx` | Does not fetch `workout_sessions` |

---

## Proposed Fix

### Fix A — "0 exercises" (immediate mitigation, before W3)

Suppress the exercise row when `exerciseCount === 0`. This avoids showing misleading data for Sprint W2 sessions while W3 is not yet implemented.

```typescript
// components/workouts/workout-history-client.tsx:203
// Change:
{!isDeletedWorkout && (
// To:
{!isDeletedWorkout && session.exerciseCount > 0 && (
```

**File:** `components/workouts/workout-history-client.tsx`, line 203  
**Scope:** 1 line change  
**Risk:** None — hides an empty stat rather than showing a wrong one

---

### Fix B — "0 min" display (display bug fix)

Replace `Math.round` with `Math.ceil` so any session that ran at least 1 second shows at minimum "1 min". Alternatively, add a `Math.max(1, ...)` guard.

```typescript
// components/workouts/workout-history-client.tsx:144
// Change:
const durationMin = session.duration_sec ? Math.round(session.duration_sec / 60) : null;
// To:
const durationMin = session.duration_sec ? Math.max(1, Math.round(session.duration_sec / 60)) : null;
```

Same fix needed in `components/workouts/session-detail-sheet.tsx:59` (identical formula).

**Files:** `components/workouts/workout-history-client.tsx:144`, `components/workouts/session-detail-sheet.tsx:59`  
**Scope:** 2 line changes (identical fix in both files)  
**Risk:** None — changes display only, no data written

---

### Fix C — Dashboard Recent Workouts (deferred)

Wire `RecentWorkoutSection` to real `workout_sessions` data. This is a meaningful feature addition that belongs after Sprint W7 when sessions are fully formed (`duration_sec`, `total_volume_kg`, `ended_at` all populated). Not appropriate to implement now with incomplete session data.

---

## Recommendation

**Implement Fix A and Fix B now** before resuming the Sprint W3 implementation. Both are 1–2 line changes with zero risk. They prevent the history page from showing actively misleading data ("0 exercises", "0 min") during the Sprint W3 development and testing cycle.

Fix C (Dashboard wiring) should remain deferred until Sprint W7.

The correct long-term fix for "0 exercises" is Sprint W3 itself — once `session_sets` rows are written during set logging, `exerciseCount` will reflect real executed exercise counts with no further changes to the history page or component.

---

## Next Steps

1. **Apply Fix A and Fix B** (2-line changes across 3 files) — can be done as a single small patch before resuming W3
2. **Resume Sprint W3** — Set Logging: `ActiveSetRow` inputs, `session_sets` INSERT, optimistic updates. This permanently resolves "0 exercises" for all future sessions.
3. **Sprint W6** — writes `ended_at` and computes `duration_sec`, resolving the duration display for the Sprint W3+ session engine flow.
4. **Post-W7** — Wire `RecentWorkoutSection` to real `workout_sessions` data.

---

## Testing Checklist

- [ ] Verify old generator sessions now show exercise count (confirm `session_sets` rows exist in DB)
- [ ] Verify Sprint W2 sessions hide the exercise row (Fix A) rather than showing "0 exercises"
- [ ] Verify no session shows "0 min" after Fix B (either hidden or "1 min" minimum)
- [ ] Verify Sprint W2 sessions still correctly hide duration (null check still works)
- [ ] Confirm Dashboard empty state behavior is unchanged (Fix C deferred)

---

## Build Status

- **TypeScript:** N/A — no code changed
- **ESLint:** N/A
- **Production Build:** N/A
