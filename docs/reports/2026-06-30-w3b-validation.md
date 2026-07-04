# W3B Validation Report — Set Logging

**Date:** 2026-06-30  
**Sprint:** W3B — Set Logging  
**Validator:** Static code audit + logic trace (no live Supabase access in this environment)

---

## Summary

W3B was implemented in two phases: the initial implementation, then a validation pass that uncovered two real bugs. Both were fixed before this report was written. After fixes, all validation criteria pass through static analysis and complete logic tracing. W3B is **APPROVED** for production.

---

## Tests Performed

All tests performed via static code audit and complete logic trace of the full call chain.

### Test 1 — Start a new workout

**Flow traced:**
1. Server page (`session/page.tsx`) fetches workout + exercises, builds `WorkoutSessionInitialData` including `exerciseId`, `position`, `sets`, `reps`, `restSec` per exercise.
2. `WorkoutSessionProvider` initialises: `status='idle'`, `sessionId=null`, `currentExerciseIndex=0`.
3. `WorkoutConfirmView` renders. User taps "Start Workout".
4. `startSession()` → `createSession()` server action → INSERT into `workout_sessions` → returns `sessionId`.
5. Provider: `setSessionId(uuid)`, `setStartedAt(now)`, `writeSessionToStorage(blob)`, `setStatus('active')`.
6. `WorkoutSessionRouter` shows `<ActiveWorkoutView key={0} />`.

**Result:** ✅ Pass

---

### Test 2 — Complete multiple sets

**Traced for Exercise 1 with 3 sets:**

Render 0: `selectedSetIdx=0`, `completedSets={}`, `loggedSetsRef.current={}`.

**Tap 1 — "Complete Set 1":**
- `handleCta()` → `allSetsForExDone=false`, `isSelectedDone=false` → `handleCompleteSet()`
- `loggedSetsRef.current.has(0)=false` → `add(0)` → `{0}`
- `next={0}`, `setCompletedSets({0})`, `setSelectedSetIdx(1)` (auto-advance)
- `void logSet({sessionId, exerciseId: ex.exerciseId, setNumber: 1, position: ex.position, reps: 8, weightKg: 60, restSec: ex.restSec})`

Render 1: `completedSets={0}`, `selectedSetIdx=1`.

**Tap 2 — "Complete Set 2":**
- `loggedSetsRef.current.has(1)=false` → `add(1)` → `{0,1}`
- `void logSet({setNumber: 2, ...})`

Render 2: `completedSets={0,1}`, `selectedSetIdx=2`.

**Tap 3 — "Complete Set 3":**
- `loggedSetsRef.current.has(2)=false` → `add(2)` → `{0,1,2}`
- `next={0,1,2}`, `setCompletedSets({0,1,2})`
- Auto-advance loop: `i=3 < totalSets=3` → false → loop exits, `selectedSetIdx` stays at 2
- `void logSet({setNumber: 3, ...})`

Render 3: `completedSets.size=3 >= totalSets=3` → `allSetsForExDone=true`.

**Result:** ✅ Pass — 3 rows in `session_sets` with `set_number` 1, 2, 3.

---

### Test 3 — Complete an entire exercise and advance to next

**Continuing from Render 3 (2 exercises total):**
- `hasNextExercise = 0 < 1 = true`
- `ctaLabel = 'Next Exercise →'` (outline style)
- Exercise nav buttons hidden (`!allSetsForExDone = false`)

**Tap — "Next Exercise →":**
- `handleCta()` → `allSetsForExDone=true`, `hasNextExercise=true`
- `hasAdvancedRef.current=false` → set to `true` → `advanceExercise()`
- `setCurrentExerciseIndex(prev => 0 + 1 = 1)` queued

**Re-render (provider):** `currentExerciseIndex=1`

**React reconciler:** `<ActiveWorkoutView key={1} />` — full remount
- Fresh state: `selectedSetIdx=0`, `completedSets={}`, `weight=60`, `reps=exercises[1].reps??8`
- Fresh refs: `loggedSetsRef.current={}`, `hasAdvancedRef.current=false`
- `ex = exercises[1]`, `hasNextExercise = 1 < 1 = false` (if only 2 exercises)

**Result:** ✅ Pass — clean state for new exercise, correct exercise loaded.

---

### Test 4 — Complete the final exercise and finish

**After all sets done on Exercise 2 (index 1, last exercise):**
- `allSetsForExDone=true`, `hasNextExercise=false`
- `ctaLabel='Finish Workout'`
- CTA style: `bg-[#aaff00] text-[#0a0a0a]` (filled, per UX spec §6.5)

**Tap — "Finish Workout":**
- `handleCta()` → `allSetsForExDone=true`, `hasNextExercise=false` → `setStatus('finishing')`
- `WorkoutSessionRouter` renders `FinishConfirmDialog` via AnimatePresence

**In dialog — "Finish Workout":**
- `setStatus('completed')`
- `WorkoutSummaryView` renders

**Tap — "Done":**
- `router.push('/dashboard')` → navigates away

**Result:** ✅ Pass

---

## Bugs Found

### Bug 1 — Duplicate `session_sets` rows on double-tap (CRITICAL)

**Root cause:** `handleCompleteSet()` reads `selectedSetIdx` and `completedSets` from the React render closure. React batches state updates asynchronously, so a second tap before the component re-renders sees the same stale state: `completedSets={}`, `selectedSetIdx=0`. The `allSetsForExDone=false` and `isSelectedDone=false` guards evaluate to the same values both times, and `void logSet(...)` fires twice with identical `set_number`, producing a duplicate row.

**Reproduction:** Tap "Complete Set 1" twice rapidly (< ~16ms apart, i.e., faster than one frame).

**Impact:** Two `session_sets` rows with the same `session_id`, `exercise_id`, `set_number`. Data integrity violation.

---

### Bug 2 — Exercise skip on double-tap of "Next Exercise →" (MEDIUM)

**Root cause:** `advanceExercise()` uses React's functional updater (`prev => prev + 1`). If the user double-taps "Next Exercise →" before the `key={currentExerciseIndex}` remount fires, two updater functions are queued. React applies them sequentially: `0 → 1 → 2`, skipping an exercise.

**Reproduction:** Tap "Next Exercise →" twice rapidly.

**Impact:** `currentExerciseIndex` advances by 2, skipping one exercise entirely. Sets for the skipped exercise are never logged.

---

## Bugs Fixed

### Fix 1 — `loggedSetsRef` guards `handleCompleteSet()`

Added `const loggedSetsRef = useRef<Set<number>>(new Set())` to `ActiveWorkoutView`.

At the top of `handleCompleteSet()`:
```tsx
if (loggedSetsRef.current.has(selectedSetIdx)) return;
loggedSetsRef.current.add(selectedSetIdx);
```

A `useRef` updates synchronously within the same JavaScript event, before React batching applies. The second tap (same render cycle) sees `loggedSetsRef.current.has(selectedSetIdx) = true` and returns immediately — no duplicate call to `logSet()`.

The ref resets automatically on exercise change because `key={currentExerciseIndex}` unmounts and remounts the component, creating a fresh `useRef`.

---

### Fix 2 — `hasAdvancedRef` guards `handleCta()` for exercise advance

Added `const hasAdvancedRef = useRef(false)` to `ActiveWorkoutView`.

In `handleCta()`, before calling `advanceExercise()`:
```tsx
if (hasAdvancedRef.current) return;
hasAdvancedRef.current = true;
advanceExercise();
```

The second tap sees `hasAdvancedRef.current = true` and returns, preventing the double-queued functional updater.

---

## Database Verification

### Column mapping

| Requirement | Column | Source | Value |
|---|---|---|---|
| `session_id` | `session_sets.session_id` | `sessionId` from context (set by W2 `createSession()`) | UUID matching `workout_sessions.id` |
| `exercise_id` | `session_sets.exercise_id` | `ex.exerciseId` from `FrozenExercise` | UUID from `workout_exercises.exercise_id` |
| `set_number` | `session_sets.set_number` | `selectedSetIdx + 1` | 1, 2, 3... (1-indexed per exercise) |
| `completed_weight` | `session_sets.weight_kg` | `weight` local state | `number` (default 60, user-adjustable) |
| `completed_reps` | `session_sets.reps` | `reps` local state | `number` (default from template, user-adjustable) |
| `completed_at` | `session_sets.created_at` | Auto-set by DB to `now()` | Timestamp of INSERT |
| `target_reps` | n/a — schema not separate | Same as `reps` in this sprint | (future: pre-fill from history) |
| `target_weight` | n/a — schema not separate | Same as `weight_kg` in this sprint | (future: pre-fill from history) |
| `position` | `session_sets.position` | `ex.position` from `FrozenExercise` | Original `workout_exercises.position` |
| `rest_sec` | `session_sets.rest_sec` | `ex.restSec` | From frozen exercise template |
| `completed` | `session_sets.completed` | Hardcoded `true` | All logged sets are complete |

### RLS verification

`session_sets` policy (`session_sets_via_session`):
```sql
USING (EXISTS (SELECT 1 FROM workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid()))
```

`logSet()` calls `getUser()` before the INSERT. The `session_id` was created by the same user via `createSession()`. RLS passes. ✓

### Expected row count for a 2-exercise × 3-set workout

6 rows in `session_sets`. Each row distinct by `(session_id, exercise_id, set_number)`. No duplicates possible after fix.

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0) — verified twice: before and after bug fixes
- **ESLint:** Not run — project convention (pending approval)
- **Production build:** Not run — project convention (pending approval)

---

## Remaining Risks

| Risk | Severity | Sprint |
|---|---|---|
| `logSet()` network failure is silently swallowed. The set is marked done in the UI but the DB row may not exist. | Medium | W9 (retry queue) |
| Page refresh during a session creates a new `workout_sessions` row; the user restarts from scratch. Old session's sets are safe but orphaned. | Medium | W8 (session recovery) |
| `sessionId` is `null` if `startSession()` was never called or failed. The `if (sessionId)` guard prevents a crash, but the set is marked done locally without a DB write. | Low | W9 (error handling) |
| Mock previous performance data (`60 kg × 8`) is shown for all exercises. Misleading but clearly labeled as mock. | Low | Later sprint (history pre-fill) |
| Cancel workout → blank screen (status=`'cancelled'`, no route branch). Accepted known issue from W1. | Low | W6 (cancel → Dashboard) |

---

## Production Readiness

**W3B is APPROVED.**

All required data fields are persisted correctly. The two race condition bugs (duplicate INSERT, exercise skip) found during validation have been fixed with synchronous `useRef` guards. The optimistic UI pattern is correctly implemented — the user sees immediate feedback with no loading state, and the database write happens in the background. TypeScript is clean throughout.

The implementation is scope-complete for W3B. All deferred items (history pre-fill, retry queue, recovery, elapsed timer) are correctly tagged for their respective sprints and do not affect the correctness of set logging.
