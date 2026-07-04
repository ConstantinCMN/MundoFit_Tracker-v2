# Workout Session Engine — Sprint W6 (Workout Completion & Session Finalization)

**Date:** 2026-06-30  
**Sprint:** W6 — Workout Completion & Session Finalization  
**Status:** APPROVED

---

## Summary

The workout session now finalises correctly. After the last set of the last exercise, a confirmation dialog shows real session stats — duration, exercise count, completed sets. Confirming writes `ended_at` and `duration_sec` to the database in a single atomic UPDATE, clears the localStorage recovery blob, and navigates to the summary screen. The active workout unmounts on confirm, making the session read-only. Double-tap protection prevents duplicate writes. The elapsed timer placeholder is wired in all headers.

---

## Files Created

| File | Description |
|---|---|
| `components/workouts/session/elapsed-timer.tsx` | Self-contained elapsed timer component; reads `startedAt` from context, updates every second |

---

## Files Modified

| File | Change |
|---|---|
| `lib/actions/sessions.ts` | Added `completeSession()` server action |
| `components/workouts/session/workout-session-provider.tsx` | Added `totalSetsCompleted`, `incrementCompletedSets`, `finishWorkout`; imported `completeSession` |
| `components/workouts/session/overlays/finish-confirm-dialog.tsx` | Rewrote with real stats, `finishWorkout()` call, `useRef` double-tap guard |
| `components/workouts/session/views/active-workout-view.tsx` | Added `incrementCompletedSets()` call in `handleCompleteSet`; wired `ElapsedTimer` in header |
| `components/workouts/session/views/exercise-transition-view.tsx` | Wired `ElapsedTimer` in header |

---

## Architecture

### Session finalisation flow

```
handleCta() [last exercise, all sets done]
  └─ setStatus('finishing')
       └─ Router: AnimatePresence shows FinishConfirmDialog

FinishConfirmDialog
  hasFinishedRef guard → void finishWorkout()
    ├─ setStatus('completing')         ← synchronous
    │    └─ Router: ActiveWorkoutView unmounts (showActive=false)
    │    └─ FinishConfirmDialog exits  (AnimatePresence)
    │    └─ WorkoutSummaryView renders (completing || completed)
    ├─ await completeSession(sessionId, endedAt, durationSec)   ← single SQL UPDATE
    ├─ localStorage.removeItem(SESSION_STORAGE_KEY)
    └─ setStatus('completed')          ← WorkoutSummaryView stays
```

The `setStatus('completing')` fires synchronously at the top of `finishWorkout()`. By the time the server action completes, the UI is already showing the summary — no visible wait, no loading spinner needed.

### `completeSession` server action

```typescript
// lib/actions/sessions.ts
UPDATE workout_sessions
  SET ended_at = $endedAt, duration_sec = $durationSec
  WHERE id = $sessionId AND user_id = auth.uid()
```

Single statement — atomic. The `ended_at IS NOT NULL` signals completion (no `status` column in the schema). The `user_id` filter is belt-and-suspenders alongside RLS.

### Session lock

The lock is implicit in the router's `showActive` predicate:

```typescript
const showActive =
  status === 'active' || status === 'resting' ||
  status === 'paused'  || status === 'finishing';
// 'completing' and 'completed' are NOT included
```

When `finishWorkout()` calls `setStatus('completing')`, `ActiveWorkoutView` unmounts. No further `handleCompleteSet()` calls are possible — the component no longer exists. The `WorkoutSummaryView` is read-only by construction.

### Double-tap protection

```typescript
const hasFinishedRef = useRef(false);

function handleFinish() {
  if (hasFinishedRef.current) return;
  hasFinishedRef.current = true;
  void finishWorkout();
}
```

The ref is set synchronously before the async call. A second tap during the same render cycle is rejected immediately. The same pattern as `hasAdvancedRef` in `ActiveWorkoutView` (W4).

### `totalSetsCompleted` counter

Tracked in provider state, incremented by `ActiveWorkoutView` on each real set completion:

```typescript
// In handleCompleteSet() — after both guards pass:
// 1. isReviewMode guard (review mode sets cannot re-increment)
// 2. loggedSetsRef guard (same set cannot increment twice)
incrementCompletedSets();
```

The guards ensure the count reflects exactly the number of unique sets successfully logged this session. Review-mode browsing does not contribute.

### `ElapsedTimer`

A self-contained component that reads `startedAt` from context and manages its own `setInterval`:

```typescript
// Lazy initializer sets the correct value at mount time (avoids 0s flicker)
const [elapsed, setElapsed] = useState(() =>
  startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0
);

useEffect(() => {
  if (!startedAt) return;
  const id = setInterval(() => {
    setElapsed(Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  }, 1000);
  return () => clearInterval(id);
}, [startedAt]);
```

`startedAt` is stable (set once at session start, never changes). The effect runs once and cleans up on unmount. Re-renders of the parent (e.g., from context value changes) do not restart the interval — `startedAt` in the deps array is stable.

`ElapsedTimer` re-renders only itself (one component) on each tick. It does not cause the provider or any sibling to re-render.

---

## Validation

### `ended_at` written correctly

`new Date().toISOString()` → ISO 8601 UTC string. DB column type is `timestamptz`. Supabase parses and stores correctly. ✅

### Duration calculated correctly

```typescript
const durationSec = Math.floor(
  (Date.now() - new Date(startedAt).getTime()) / 1000
);
```

`startedAt` is set at `createSession()` call time. `Date.now()` is evaluated in `finishWorkout()`, which fires synchronously after the user taps "Finish Workout". The delta is the real workout duration in seconds. ✅

### Completed sessions cannot be modified

After `setStatus('completing')`, `showActive = false` → `ActiveWorkoutView` unmounts. `handleCompleteSet()` is unreachable. Even if the user somehow retained a reference to the CTA, the component has no state and no event listeners. ✅

### Repeated Finish presses cannot duplicate writes

`hasFinishedRef.current` is set to `true` synchronously on first press. All subsequent presses return immediately. The server action is called at most once per dialog mount. ✅

### Navigation to summary

`WorkoutSummaryView` renders as soon as `status === 'completing'` (before the server action completes). The summary is a placeholder for W7 — stats show `—`. The "Done" button in `WorkoutSummaryView` navigates to `/dashboard`. ✅

### No TypeScript errors

`npx tsc --noEmit` — no output (exit 0). ✅

### No runtime errors (static analysis)

- `completeSession()` called only when `sessionId` and `startedAt` are non-null (guarded at top of `finishWorkout`)
- `localStorage.removeItem()` wrapped in try/catch (storage unavailable in some browsers)
- `ElapsedTimer` renders `--:--` fallback when `startedAt` is null (before session starts)
- `formatDuration()` in dialog called only when `startedAt` is non-null ✅

---

## Decisions Made

1. **`setStatus('completing')` before awaiting the server action** — The status change is synchronous, so the UI responds immediately. The user sees the summary screen at once without a loading state on the dialog. The server action completes in the background. W9 will add retry logic if the write fails.

2. **Silent failure on `completeSession` error** — If the UPDATE fails (network issue, RLS violation), the user still sees the summary and the session is considered done locally. The set data is already written (from `logSet()` calls). A failed `ended_at` write can be repaired via admin tooling. W9 addresses proper error handling.

3. **`useRef` double-tap guard in the dialog (not provider `status` check)** — Provider status changes are asynchronous from the perspective of `handleFinish()`. A second tap can fire before React flushes the state update. The `useRef` is set synchronously and is always reliable in the same render cycle.

4. **`totalSetsCompleted` in provider state (not derived from DB query)** — Querying the DB to count sets at dialog-open time would require an async operation and add latency to showing the dialog. The in-memory counter is accurate for the current session and available instantly.

5. **`ElapsedTimer` as a dedicated component** — Isolates the `setInterval` re-render to a single leaf node. A `useMemo` inside the provider would have caused the entire context to re-render every second. A component-level approach means only `ElapsedTimer` re-renders on each tick.

6. **`ElapsedTimer` uses `setInterval` (not `setTimeout` chain)** — Unlike the rest timer (which must unmount on `onDismiss`), the elapsed timer runs for the entire session duration. `setInterval` is simpler and appropriate here. The single cleanup call `clearInterval(id)` handles unmount cleanly.

7. **Duration display in dialog is computed at render time** — The dialog shows the duration at the moment it appears. The actual `ended_at` will be set a second or two later when the user taps "Finish Workout". For a gym timer, this precision is more than sufficient.

---

## Remaining TODOs

- **W7**: Workout summary real stats (wire duration, volume, sets into `WorkoutSummaryView`)
- **W8**: Session recovery (localStorage blob restore → `frontierExerciseIndex`, total sets counter)
- **W9**: `logSet()` retry queue; `completeSession()` error handling

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — project convention
- **Production Build:** Not run — project convention
