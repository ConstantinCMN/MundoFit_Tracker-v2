# Workout Session Engine — Sprint W7 (Workout Summary)

**Date:** 2026-06-30  
**Sprint:** W7 — Workout Summary  
**Status:** APPROVED  
**Milestone:** Workout Session Engine — Milestone 1 complete

---

## Summary

The Workout Summary screen now shows real session data. After completing a workout, the user sees workout name, date, and four stat cards: duration, volume, exercises, and sets (completed / planned). The screen feels rewarding and clean — single fade-in animation, no extra flourishes. "Done" navigates to the dashboard.

This sprint completes Milestone 1 of the Workout Session Engine (W1 → W7).

---

## Files Created

None.

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/session/workout-session-provider.tsx` | Added `totalVolumeKg`, `addVolume()`, `completedDurationSec`; updated `finishWorkout()` to capture duration before status change |
| `components/workouts/session/views/active-workout-view.tsx` | Added `addVolume(weight * reps)` call in `handleCompleteSet()` |
| `components/workouts/session/views/workout-summary-view.tsx` | Full replacement — real stats, format helpers, 2×2 stat grid, date display |

---

## Architecture

### Data sources

All stats are accumulated in provider state during the session and read directly by `WorkoutSummaryView`:

| Stat | Provider state | Set by |
|---|---|---|
| Duration | `completedDurationSec` | `finishWorkout()` at the moment of confirmation |
| Volume | `totalVolumeKg` | `addVolume(weight × reps)` called per completed set |
| Completed sets | `totalSetsCompleted` | `incrementCompletedSets()` called per completed set |
| Planned sets | — (derived) | `exercises.reduce((sum, ex) => sum + ex.sets, 0)` at render time |
| Exercises | — (derived) | `exercises.length` at render time |
| Date | `startedAt` | Already in context from W6 |

No DB reads are required at summary time — all data was captured during the session.

### `completedDurationSec` capture timing

```typescript
// In finishWorkout():
const dur = Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000);
setCompletedDurationSec(dur);  // ← first
setStatus('completing');        // ← second: WorkoutSummaryView mounts after this
```

Setting `completedDurationSec` before the status change ensures the value is in context before `WorkoutSummaryView` first renders. The summary never shows `--` for duration.

### `addVolume` accumulation

```typescript
// In active-workout-view.tsx, handleCompleteSet():
loggedSetsRef.current.add(selectedSetIdx);
incrementCompletedSets();
addVolume(weight * reps);  // weight and reps are current Zone C input values
```

The same closure values (`weight`, `reps`) are used for both `logSet()` (DB write) and `addVolume()` — the in-memory total matches what's persisted. Both guards (`isReviewMode`, `loggedSetsRef`) prevent double-counting: they fire before this line, so `addVolume` is called at most once per unique set.

### Format helpers

Three pure functions, no side effects, no external dependencies:

```typescript
// Duration: 3721s → "1h 2m" | 210s → "3 min" | 45s → "45s"
function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return `${sec}s`;
}

// Volume: 5240 → "5,240 kg" | 800 → "800 kg"
// Manual thousands separator — avoids toLocaleString locale ambiguity
function formatVolume(kg: number): string {
  const r = Math.round(kg);
  if (r >= 1000) {
    const thousands = Math.floor(r / 1000);
    const remainder = String(r % 1000).padStart(3, '0');
    return `${thousands},${remainder} kg`;
  }
  return `${r} kg`;
}

// Date: "Mon, Jun 30" (device locale)
function formatWorkoutDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}
```

`formatVolume` uses manual thousands formatting rather than `toLocaleString()` to avoid decimal separators varying by locale (e.g., `5.240` in European locales). This is consistent with the rest of the codebase which avoids `toLocaleString()` for numeric display.

### Layout

```
[ CheckCircle (accent green circle) ]
Workout Complete                       ← 11px uppercase #555555
Upper Body Push                        ← 22px font-black
Mon, Jun 30                            ← 12px #444444

┌─────────────────┬─────────────────┐
│   32 min        │   5,240 kg      │  ← 18px font-black
│   Duration      │   Volume        │  ← 10px uppercase #555555
├─────────────────┼─────────────────┤
│   4             │   12 / 15       │
│   Exercises     │   Sets          │
└─────────────────┴─────────────────┘

[ Done ]                               ← full-width #aaff00
```

`StatCard` is a small local component (not extracted to a separate file) — it's used only here and is 7 lines of JSX.

Animation: single `motion.div` fade + slide-up (y: 16→0) at 450ms. The Done button fades in at 200ms delay. No per-card animations — the sprint spec says "avoid unnecessary animations."

---

## Validation

### Duration correct

`completedDurationSec` = `Math.floor((endedAt - startedAt) / 1000)` captured at the moment the user taps "Finish Workout". The same value is written to `workout_sessions.duration_sec`. The summary and the DB are always in sync. ✅

### Exercise count correct

`exercises.length` = the length of `initialData.exercises`, which is the frozen copy of the workout's exercises created at session start. This cannot change during a session. ✅

### Completed set count correct

`totalSetsCompleted` is incremented by `incrementCompletedSets()` called inside `handleCompleteSet()`, which already has two guards: review-mode guard (returns early before the line) and `loggedSetsRef.current.has(selectedSetIdx)` guard (same). Each unique set increments the counter exactly once. ✅

### Volume correct

`addVolume(weight * reps)` is called at the same point and with the same values as `logSet({ weightKg: weight, reps })`. The in-memory total is the sum of `weight × reps` for all completed sets — the definition of training volume. ✅

### Navigation works

`router.push('/dashboard')` from `@/lib/i18n/navigation` — same import used throughout the project. ✅

### No TypeScript errors

`npx tsc --noEmit` — no output (exit 0). ✅

---

## Decisions Made

1. **In-memory accumulation (not DB query)** — Volume and set count are accumulated in provider state during the session rather than fetched from the DB at summary time. This is faster (no async), more reliable (works offline), and produces the same result since `logSet()` and `addVolume()` use identical values.

2. **`completedDurationSec` stored before status change** — Ensures the value is in context before `WorkoutSummaryView` mounts. If it were set concurrently with `setStatus('completing')`, React could batch the updates differently and the summary might read the old `null` value.

3. **Manual thousands separator in `formatVolume`** — `Number.toLocaleString()` renders `5.240` (period as thousands separator) on European locales. A fitness app showing volume in kg should use the unambiguous `5,240` format regardless of locale. The manual approach is a handful of lines and fully predictable.

4. **2×2 stat grid over 3-card row** — Four stats fit comfortably in a 2×2 grid on a 375px viewport. A 4-column single row would need very small type (≤13px for the value). The 2×2 grid allows 18px font-black values with adequate padding.

5. **`StatCard` as local component, not extracted** — Used in exactly one place. Extracting to a shared file would add indirection without value. If the stats pattern appears elsewhere (e.g., history detail), extraction should happen then.

6. **No exercise breakdown section** — The UX spec §6.7 shows a per-exercise breakdown. The W7 sprint spec does not include it. Deferred to a future polish sprint — it would require tracking weight and reps per exercise, which adds complexity beyond what W7 specifies.

---

## Remaining TODOs

- **W8**: Session recovery from localStorage (restore `frontierExerciseIndex`, `totalSetsCompleted`, `totalVolumeKg` from blob)
- **W9**: `logSet()` retry queue; `completeSession()` error handling
- **Polish**: Exercise breakdown in summary, personal record display, "first workout" first-time experience

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — project convention
- **Production Build:** Not run — project convention
