# Workout Session Engine — Sprint W3B (Set Logging)

**Date:** 2026-06-30  
**Scope:** Wire "Complete Set" to a real `session_sets` INSERT. Auto-advance through sets and exercises. No Finish Workout, no Summary, no Rest Timer.

---

## Summary

Every time the user taps "Complete Set N," the set is persisted to `session_sets` in Supabase immediately. The UI updates optimistically before the network response — the set row shows a checkmark and the next uncompleted set becomes active without waiting for the server. When all sets for an exercise are finished, the CTA transitions to "Next Exercise →" (outline style). Tapping it advances to the next exercise with fresh local state. On the final exercise, "Finish Workout" (filled style) calls `setStatus('finishing')` as before.

---

## Files Created

| File | Description |
|---|---|
| `docs/reports/2026-06-30-w3b-set-logging.md` | This report |

---

## Files Modified

| File | Change |
|---|---|
| `lib/actions/sessions.ts` | Added `logSet()` server action + `LogSetParams`/`LogSetResult` types |
| `components/workouts/session/workout-session-provider.tsx` | Added `currentExerciseIndex` state + `advanceExercise()` callback to context |
| `components/workouts/session/workout-session-client.tsx` | `<ActiveWorkoutView key={currentExerciseIndex} />` — remounts view on exercise change |
| `components/workouts/session/views/active-workout-view.tsx` | Use `currentExerciseIndex` from context; fire `logSet()` on set completion; "Next Exercise →" CTA |

---

## Architecture Changes

### `logSet()` server action

Added to `lib/actions/sessions.ts`. Takes `sessionId`, `exerciseId`, `setNumber` (1-indexed), `position` (exercise order in session), `reps`, `weightKg`, `restSec`. Inserts into `session_sets` with `completed: true`.

`position` comes from `FrozenExercise.position` — a value that exists in the DB row for the workout template, carried through the session so the session can be replayed in order independently of the live template.

RLS is handled transparently: `session_sets` policy checks `workout_sessions.user_id = auth.uid()` on the parent row — no additional auth check needed in the action beyond calling `getUser()` for safety.

### `currentExerciseIndex` in provider

Added `currentExerciseIndex: number` state (starts at 0) and `advanceExercise()` callback to `WorkoutSessionProvider`. Both are exposed in context.

This state lives in the provider (not the view) so that:
1. The `WorkoutSessionRouter` can read it to key `ActiveWorkoutView`
2. Future sprints (W4 nav buttons, W5 rest timer, W6 pause) can read or update the index without prop drilling

### `key={currentExerciseIndex}` remount strategy

`WorkoutSessionRouter` now renders `<ActiveWorkoutView key={currentExerciseIndex} />`. When `advanceExercise()` increments the index, React sees a different `key` and fully unmounts + remounts the view. This resets all local state (`completedSets`, `selectedSetIdx`, `weight`, `reps`) for the new exercise with zero manual reset logic.

This is the same strategy React's reconciler uses internally for list items — leveraging it here instead of writing explicit reset handlers avoids bugs where a state field is forgotten.

### Optimistic set logging

`handleCompleteSet()`:
1. Immediately updates React state (`completedSets`, `selectedSetIdx`) — UI responds before network
2. Calls `void logSet(...)` — fire and forget; does not await
3. On network failure: silently swallowed — W9 adds a retry queue per the UX spec (§8.5: "Never show a blocking error mid-workout")

### CTA state machine (updated from W3A)

| Condition | Label | Style | Action |
|---|---|---|---|
| Sets incomplete, selected not done | Complete Set N | filled `#aaff00` | `handleCompleteSet()` |
| Sets incomplete, selected done | Complete Set N | filled, `disabled` | — |
| Exercise done, next exercise exists | Next Exercise → | outline `#aaff00` | `advanceExercise()` |
| Exercise done, last exercise | Finish Workout | filled `#aaff00` | `setStatus('finishing')` |

Note: W3A had "Finish Workout" as a ghost/muted style — corrected in W3B to filled per UX spec §6.5 ("full `#aaff00` fill — prominent color change").

### Exercise nav bar visibility

Per UX spec §6.4: "Exercise nav bar hides (no ambiguity about direction)" when all sets for the exercise are done. The nav buttons are now conditionally rendered — only shown while `!allSetsForExDone`. When the CTA shows "Next Exercise →" or "Finish Workout," the nav buttons disappear.

---

## Decisions Made

1. **`void logSet(...)` not `await logSet(...)`** — The UX spec and W3A design both mandate optimistic UI for set logging. Awaiting would show a delay between tap and checkmark on slow connections. `void` tells TypeScript this is intentional fire-and-forget. Errors are silently absorbed at the `.catch()` level until W9 adds the retry queue.

2. **`currentExerciseIndex` in provider, not view** — The index belongs to the session lifecycle, not the current exercise's render cycle. Keeping it in the provider means W4 (nav buttons), W5 (rest timer decides what the next set is), and W6 (pause/elapsed) can all read it without prop drilling through `ActiveWorkoutView`.

3. **`key={currentExerciseIndex}` over manual state reset** — A named `useEffect` to reset each piece of local state on exercise change is error-prone (forgetting one piece of state = subtle bug). The `key` approach is idiomatic React and guarantees all local state resets, including any state added in future sprints to this view.

4. **`position` from `FrozenExercise.position`** — This is the exercise's position in the workout template, not the session-level index. The migration `20240106000000_add_position_to_session_sets.sql` explains why: lets a completed session replay its exact exercise order independent of later edits to the template.

5. **Exercise nav buttons hidden when exercise is done** — UX spec §6.4 is explicit about this. The nav bar below the CTA disappears entirely (not just disabled) when all sets are complete, removing visual ambiguity about what the user should tap next.

6. **"Next Exercise →" outline vs "Finish Workout" filled** — Intentional style distinction from the spec: "Next Exercise →" is a transitional state (accent outline), while "Finish Workout" is the terminal action (filled, most prominent). Both differ from "Complete Set N" only in label, but the color logic makes this clear.

---

## Remaining TODOs

- **W3C / later sprint**: Wire real previous-session data into Previous Performance Card and weight/reps default pre-fill (currently hardcoded `MOCK_PREV`)
- **W4**: `currentExerciseIndex` nav buttons wired (currently `disabled`), exercise transition animation, progress bar advances on exercise completion (not just index change)
- **W5**: Rest timer overlay after set completion
- **W6**: Elapsed timer, `ended_at` write, cancel → Dashboard, hide bottom nav
- **W7**: Session summary real stats
- **W8**: Session recovery (localStorage blob needs `currentExerciseIndex` + per-exercise set state)
- **W9**: Set retry queue for failed `logSet()` calls

---

## Known Issues

- Mock Previous Performance card shows same "60 kg × 8 · Jun 14" for all exercises — correct for W3B (real data in later sprint)
- Progress bar advances by exercise index change (at start of exercise), not at completion of last set — will feel slightly off until W4 wires this properly
- `sessionId` is `null` if the user somehow reaches `ActiveWorkoutView` without a successful W2 `startSession()` — the `if (sessionId)` guard in `handleCompleteSet()` prevents the INSERT but the set is still marked done locally (UX is correct: the set completion is visible; the save just didn't happen)

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — pending approval per project convention
- **Production Build:** Not run — pending approval per project convention

---

## Testing Checklist

- [ ] Tapping "Complete Set N" immediately shows checkmark on the row (no loading state)
- [ ] After completing a set, a `session_sets` row exists in Supabase with correct `session_id`, `exercise_id`, `set_number`, `reps`, `weight_kg`
- [ ] `completed = true` on every logged row
- [ ] Auto-advance moves to next uncompleted set after each completion
- [ ] After all sets: CTA changes to "Next Exercise →" (outline style, not filled)
- [ ] After all sets: exercise nav buttons disappear
- [ ] Tapping "Next Exercise →" transitions to the next exercise with fresh state (all rows unchecked, Set 1 selected)
- [ ] After all sets of the last exercise: CTA shows "Finish Workout" (filled `#aaff00`)
- [ ] Exercise context label updates ("Exercise 2 of 5", etc.)
- [ ] Progress bar updates on exercise advance
- [ ] Weight and reps reset to defaults on exercise change
- [ ] W2 / W1 flows unaffected (confirm view, pause overlay, finish dialog, summary)
