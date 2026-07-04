# Workout Session Engine — Sprint W3C (Performance Intelligence)

**Date:** 2026-06-30  
**Sprint:** W3C — Performance Intelligence  
**Status:** APPROVED

---

## Summary

The Previous Performance card is now powered by real data from `session_sets`. At session load time, the server page queries all completed sets for every exercise in the workout, finds the most recent completed set per exercise, and passes the results down as `previousPerformance: Record<string, ExercisePreviousPerformance>` inside `WorkoutSessionInitialData`. The view looks up this map by `exerciseId` to populate the card and pre-fill the weight/reps inputs. Exercises with no history show a "No previous performance / Set your baseline today" state.

---

## Files Modified

| File | Change |
|---|---|
| `app/[locale]/(app)/workouts/session/page.tsx` | Added `weight_kg` to exercises query; added `RawPrevSet` type; full previous performance query; passes `previousPerformance` in `initialData` |
| `components/workouts/session/workout-session-provider.tsx` | Added `weightKg` to `FrozenExercise`; added `ExercisePreviousPerformance` type; added `previousPerformance` field to `WorkoutSessionInitialData` |
| `components/workouts/session/views/active-workout-view.tsx` | Removed `MOCK_PREV`; added `formatShortDate()` helper; real `prevPerf` lookup; conditional card rendering; pre-fill from history |

---

## Architecture

### Data flow

```
session/page.tsx (server)
  ↓  SELECT session_sets JOIN workout_sessions WHERE exercise_id IN (...)
  ↓  JS sort: started_at DESC, set_number DESC
  ↓  take first occurrence per exerciseId
  ↓  previousPerformance: Record<exerciseId, ExercisePreviousPerformance>
  ↓
WorkoutSessionInitialData (frozen at session load)
  ↓
WorkoutSessionProvider → context.initialData
  ↓
ActiveWorkoutView
  prevPerf = initialData.previousPerformance[ex.exerciseId] ?? null
```

Data is fetched once at page load and frozen in `initialData`. The view never makes a network call — it only reads from the frozen map. This follows the established session architecture: all session-critical data is fetched server-side at load time.

### Previous performance query

Single query to `session_sets` joining `workout_sessions(started_at)`, filtered to the workout's `exerciseIds` and `completed = true`. RLS automatically scopes to the current user's sessions — no explicit `user_id` filter needed.

Results are sorted in JavaScript (Supabase JS does not support ordering by join columns). Sort key: `started_at DESC, set_number DESC`. The first occurrence per `exerciseId` in the sorted array is the last set logged in the most recent session for that exercise.

```typescript
prevSets.sort((a, b) => {
  const dateA = a.workout_sessions?.started_at ?? '';
  const dateB = b.workout_sessions?.started_at ?? '';
  if (dateB !== dateA) return dateB.localeCompare(dateA);
  return (b.set_number ?? 0) - (a.set_number ?? 0);
});
```

### New types

```typescript
// In workout-session-provider.tsx
export type ExercisePreviousPerformance = {
  reps: number | null;
  weightKg: number | null;
  sessionDate: string;  // ISO 8601 — workout_sessions.started_at
};

// FrozenExercise gains:
weightKg: number | null;  // template default weight

// WorkoutSessionInitialData gains:
previousPerformance: Record<string, ExercisePreviousPerformance>;
// Missing key = no history for that exercise
```

### Pre-fill priority

Per UX spec §7.1:
1. Previous session weight/reps for this exercise (`prevPerf?.weightKg`, `prevPerf?.reps`)
2. Workout template defaults (`ex?.weightKg`, `ex?.reps`)
3. Zero / 8 reps as last-resort fallback

```typescript
const [weight, setWeight] = useState(prevPerf?.weightKg ?? ex?.weightKg ?? 0);
const [reps,   setReps]   = useState(prevPerf?.reps   ?? ex?.reps   ?? 8);
```

---

## Validation

All scenarios verified via static code audit and complete logic trace.

### Scenario 1 — First workout (no history)

- `session_sets` returns 0 rows for these `exerciseIds`
- `previousPerformance = {}` (empty Record)
- `prevPerf = undefined ?? null = null`
- Card: "No previous performance / Set your baseline today" (dark border, `rgba(255,255,255,0.06)`)
- Pre-fill: template defaults or `0` / `8`
- Sets table Previous column: `'—'`
- **Result: ✅ Pass**

### Scenario 2 — Second workout (history exists)

- Previous session logged 3 sets for ex-abc (e.g. 60 kg × 8)
- Query returns 3 rows. After sort: set_number=3 first
- `previousPerformance["ex-abc"] = { weightKg: 60, reps: 8, sessionDate: "2026-06-28T..." }`
- Card: "Last session · Jun 28 / 60 kg × 8 reps" (green-tinted border/bg)
- Pre-fill: `weight=60`, `reps=8`
- Sets table Previous column: `'60 kg × 8'`
- **Result: ✅ Pass**

### Scenario 3 — Different exercises (each gets independent history)

- Workout: ex-abc (Bench, history 60 kg × 8), ex-def (Squat, history 100 kg × 5)
- Single query `.in('exercise_id', ['ex-abc', 'ex-def'])` returns rows for both
- `previousPerformance = { "ex-abc": { weightKg: 60, reps: 8 }, "ex-def": { weightKg: 100, reps: 5 } }`
- Exercise 1 (index 0): `prevPerf = previousPerformance["ex-abc"]` → 60 kg × 8
- Exercise 2 (index 1): `key={1}` remounts view; `prevPerf = previousPerformance["ex-def"]` → 100 kg × 5
- Each exercise independently keyed by `exerciseId` — no cross-contamination
- **Result: ✅ Pass**

### Scenario 4 — Exercise never performed (mixed workout)

- ex-abc has history; ex-new has never been performed
- Query returns rows only for ex-abc
- `previousPerformance = { "ex-abc": {...} }` — ex-new key absent
- For ex-new: `initialData.previousPerformance["ex-new"] = undefined` → `undefined ?? null = null`
- Card: "No previous performance"
- Pre-fill: template defaults or `0` / `8`
- **Result: ✅ Pass**

### TypeScript

`npx tsc --noEmit` — no output (exit 0). Clean. ✅

---

## Decisions Made

1. **Single query for all exercises, not N queries** — One `.in('exercise_id', exerciseIds)` call fetches history for all exercises at once. N separate queries would multiply the load time by exercise count.

2. **JS sort, not ORDER BY** — Supabase JS client does not support ordering by joined table columns. Sorting the full result set in JavaScript after the fetch is O(k log k) where k is total historical sets — negligible for any real-world workout history.

3. **Most recent completed set (not last set of last session)** — The sort places the most recent session's last set first per exercise. This is what pre-fill should use: the last weight and reps the user actually lifted in that exercise, regardless of which set number it was.

4. **`previousPerformance` as a frozen Record in `initialData`** — The map is built at page load and never mutated. This is the established session data pattern (FrozenExercise, etc.). It avoids any mid-session data fetching and makes the data available at context level for any future component without prop drilling.

5. **Missing key = no history** — `Record<string, ExercisePreviousPerformance>` with a missing key (vs. a `null` value) is the idiomatic TypeScript signal for "this exercise has no history." The `?? null` nullish coalesce in the view handles it cleanly.

6. **`as unknown as RawPrevSet[]` cast** — The Supabase TS client cannot infer the shape of `workout_sessions(started_at)` inside a `session_sets` select. The join result doesn't match the generated types. This is the established cast pattern used throughout this project for join results.

---

## Remaining TODOs

- **W4**: Exercise navigation buttons wired (currently `disabled`), progress bar on set completion
- **W5**: Rest timer overlay after set completion
- **W6**: Elapsed timer, `ended_at` write, cancel → Dashboard, hide bottom nav
- **W7**: Session summary with real stats
- **W8**: Session recovery (localStorage blob)
- **W9**: Set retry queue for failed `logSet()` calls

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — project convention
- **Production Build:** Not run — project convention
