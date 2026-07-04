# Workout Session Engine — Sprint W4 (Guided Workout Flow)

**Date:** 2026-06-30  
**Sprint:** W4 — Guided Workout Flow  
**Status:** APPROVED

---

## Summary

The workout session now feels continuous and guided. A smooth exercise transition screen appears between exercises. The header always shows workout name, exercise counter, and a live progress bar. Previous and Next navigation is wired — backward navigation enters a read-only review mode that displays the exercise's completed state without permitting re-completion. The Next nav button is locked while sets are incomplete, preventing exercise skipping.

---

## Files Created

| File | Description |
|---|---|
| `components/workouts/session/views/exercise-transition-view.tsx` | Transition screen between exercises |

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/session/workout-session-provider.tsx` | Replaced `advanceExercise` with full navigation API; added `frontierExerciseIndex` |
| `components/workouts/session/workout-session-client.tsx` | Added `ExerciseTransitionView` route; removed `'transitioning'` from `showActive` |
| `components/workouts/session/views/active-workout-view.tsx` | Header upgrade, real progress bar, review mode, wired nav buttons, `beginTransition` CTA |

---

## Architecture

### `frontierExerciseIndex` — the key invariant

Two indices now live in the provider:

| State | What it tracks | Direction |
|---|---|---|
| `currentExerciseIndex` | Which exercise is displayed | Can go forward and backward |
| `frontierExerciseIndex` | How many exercises have been completed | Only increases |

`frontierExerciseIndex` is the invariant that makes safe navigation possible:
- `currentExerciseIndex === frontierExerciseIndex` → active mode (current exercise, in progress)
- `currentExerciseIndex < frontierExerciseIndex` → review mode (browsing a completed exercise)

### Navigation API (provider context)

| Function | When called | Effect |
|---|---|---|
| `beginTransition()` | "Next Exercise →" CTA | `frontier++`, `status='transitioning'` |
| `confirmAdvance()` | Transition "Continue" button | `currentIndex++`, `status='active'` |
| `goToPreviousExercise()` | ← nav button | `currentIndex--` (min 0) |
| `goToNextExercise()` | → nav button (review mode) | `currentIndex++` (capped at frontier) |
| `returnToActive()` | "Return to Workout →" CTA in review | `currentIndex = frontierExerciseIndex` |

`advanceExercise()` removed from context — `beginTransition()` is its replacement.

### Exercise Transition Screen (`ExerciseTransitionView`)

Activated when `status === 'transitioning'`. The router no longer includes `'transitioning'` in `showActive`, so `ActiveWorkoutView` unmounts while the transition is shown. On "Continue", `currentExerciseIndex` increments → `key=` changes → `ActiveWorkoutView` remounts fresh.

The transition view has its own Zone A header (workout name, exercise counter, progress bar) so the header is always visible. The rest is centred content: check circle (spring scale-in animation), "Exercise Complete" label, completed exercise name, next exercise name, "Continue →" button.

### Progress bar

```typescript
// In ActiveWorkoutView:
const progressPct =
  (frontierExerciseIndex + (!isReviewMode && allSetsForExDone ? 1 : 0)) /
  Math.max(exercises.length, 1) *
  100;

// In ExerciseTransitionView (frontier already incremented by beginTransition):
const progressPct = (frontierExerciseIndex / Math.max(exercises.length, 1)) * 100;
```

The `allSetsForExDone` term in the active view gives immediate feedback: the bar advances as soon as the last set is completed, before the user taps "Next Exercise →". The transition view sees the same value (frontier already incremented), so there is no visual jump.

### Review mode

When `currentExerciseIndex < frontierExerciseIndex`:
- `completedSets` initialised with all indices (all checkmarks show on mount)
- `handleCompleteSet()` returns early — no new `logSet()` calls, no DB duplicates
- `handleRowTap()` returns early — rows are display-only
- Zone C inputs hidden; shows "Last logged: X kg × N reps" from `prevPerf` instead
- CTA: "Return to Workout →" (outline style) → calls `returnToActive()`
- Nav bar: always visible in review mode; next button enabled while `currentIndex < frontier`

The "last logged" data in review mode comes from `previousPerformance` (the cross-session history loaded at session start), not from the current session's local state. This is intentional — it gives context without reconstructing in-session state per exercise.

### Header upgrade

The header center is now a two-line flex column:
- Line 1: workout name (13px semibold, truncated)
- Line 2: "Exercise X of Y" + "· reviewing" suffix in review mode (10px, `#555555`)

This satisfies the W4 requirement that the header always shows context regardless of Zone B scroll position.

---

## Decisions Made

1. **`frontierExerciseIndex` rather than a `Set<number>` of completed exercise indices** — The frontier is a monotonically increasing integer. Since exercises are always completed in order (skipping is blocked), the frontier fully encodes completion state with a single number and makes `isReviewMode` a trivial comparison.

2. **`beginTransition()` increments frontier immediately** — The progress bar in the transition view should reflect the completed exercise. Incrementing at `beginTransition()` (not at `confirmAdvance()`) means both the transition view and the next active view show the same progress value — no jump when "Continue" is tapped.

3. **Review mode initialises `completedSets` with all indices via `useState` lazy initializer** — Since `key={currentExerciseIndex}` remounts the component, the initializer has access to the correct closure values (`isReviewMode`, `totalSets`) at mount time. No prop drilling or context state per exercise needed.

4. **`handleCompleteSet()` and `handleRowTap()` guard `isReviewMode`** — Defense in depth: even if a review-mode button somehow fires, the guards prevent any DB write. The `loggedSetsRef` alone would not protect this (it resets on remount), so the explicit `isReviewMode` guard is the correct barrier.

5. **Next nav button disabled in active mode (not just visually muted)** — `disabled` + `pointer-events-none` prevents any tap propagation in Safari. The user should never be able to skip a set.

6. **"Return to Workout →" CTA uses outline style** — Consistent with "Next Exercise →": both are navigation actions (not completion actions), so they share the accent-outline variant rather than the filled action style.

7. **Transition screen has its own Zone A header** — Rather than extracting a shared `<SessionHeader>` component (which would require a larger refactor), each full-screen view renders its own header. The views are few and the header is small. Extraction can happen in a later refactor sprint if the codebase grows.

---

## Validation

All scenarios verified via static code audit and complete logic trace.

### Scenario 1 — Progress bar updates correctly

| State | `frontier` | `allSetsForExDone` | Progress |
|---|---|---|---|
| Exercise 1, no sets done | 0 | false | `(0+0)/3 = 0%` |
| Exercise 1, all sets done (before CTA) | 0 | true | `(0+1)/3 = 33%` |
| Transition screen (after `beginTransition`) | 1 | — | `1/3 = 33%` |
| Exercise 2, no sets done | 1 | false | `1/3 = 33%` |
| Exercise 2, all sets done | 1 | true | `(1+1)/3 = 66%` |
| Exercise 3, all sets done (last) | 2 | true | `(2+1)/3 = 100%` |

**Result: ✅ Pass** — no jump at transition; last exercise reaches 100%

### Scenario 2 — Navigation cannot skip unfinished exercises

- Active mode, sets incomplete: `nextNavDisabled = true`, button has `pointer-events-none`. ✅
- CTA is "Complete Set N" — not a navigation action. ✅
- After all sets done: nav bar hides (`showNavBar = false`). Only "Next Exercise →" CTA visible. ✅

**Result: ✅ Pass**

### Scenario 3 — Transition screen appears and works correctly

- `beginTransition()` → `frontier++`, `status='transitioning'`
- Router: `showActive = false`, `ExerciseTransitionView` renders
- Shows: ✓ icon, "Exercise Complete", completed exercise name, "Next: {nextEx.name}", "Continue →"
- Tap "Continue" → `confirmAdvance()`: `currentIndex++`, `status='active'`
- Router: `showActive = true`, `ActiveWorkoutView key={new index}` remounts fresh

**Result: ✅ Pass**

### Scenario 4 — Previous Exercise restores correct UI state

Setup: 3-exercise workout, exercises 0 and 1 completed (`frontier=2`), now on exercise 2 (active, sets incomplete).

Tap `← {ex0.name}`:
- `goToPreviousExercise()` → `currentIndex = 2 → 1`
- Key changes → `ActiveWorkoutView` remounts for index 1
- `isReviewMode = 1 < 2 = true`
- `completedSets` init: all indices `[0, 1, 2]` → all checkmarks shown
- Nav: prev enabled (`currentIndex=1 > 0`), next enabled (`1 < frontier=2`)
- CTA: "Return to Workout →" (outline)
- Inputs hidden; "Last logged" shown if `prevPerf` exists

Tap `← {ex0.name}` again (prev from index 1):
- `currentIndex = 1 → 0`
- `isReviewMode = 0 < 2 = true`
- Nav: prev disabled (`currentIndex=0`), next enabled (`0 < 2`)

Tap "Return to Workout →":
- `returnToActive()` → `currentIndex = frontierExerciseIndex = 2`
- Active mode on exercise 2 (where sets were interrupted)
- `isReviewMode = 2 < 2 = false` ← correct

**Result: ✅ Pass** — no duplicate DB writes, correct UI state

### Scenario 5 — TypeScript

`npx tsc --noEmit` — no output (exit 0). Clean. ✅

---

## Remaining TODOs

- **W5**: Rest timer overlay after set completion
- **W6**: Elapsed timer (wire `--:--`), `ended_at` write, cancel → Dashboard, hide bottom nav
- **W7**: Workout summary real stats
- **W8**: Session recovery (localStorage blob needs `frontierExerciseIndex`)
- **W9**: Set retry queue for failed `logSet()` calls

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — project convention
- **Production Build:** Not run — project convention
