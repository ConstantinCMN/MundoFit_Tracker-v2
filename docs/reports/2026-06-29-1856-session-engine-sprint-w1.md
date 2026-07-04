# Workout Session Engine — Sprint W1 (Scaffolding)

**Date:** 2026-06-29  
**Time:** 18:56  
**Scope:** Create the architectural skeleton for the Workout Session feature. No business logic.

---

## Summary

Created the complete scaffolding for the Workout Session Engine following the blueprint in `docs/architecture/workout-session-engine-blueprint.md`. The route exists, all views and overlays render placeholder UI, and the context-driven state machine is wired so status transitions between views are fully navigable in the browser — without any Supabase writes, autosave, set logging, or session logic.

---

## Files Created

| File | Purpose |
|---|---|
| `app/[locale]/(app)/workouts/session/page.tsx` | Server component — auth guard, fetches workout + exercises, passes `initialData` to client |
| `components/workouts/session/workout-session-provider.tsx` | Context, types (`SessionStatus`, `FrozenExercise`, `WorkoutSessionInitialData`), `useWorkoutSession()` hook |
| `components/workouts/session/workout-session-client.tsx` | Client root — wraps provider, contains `WorkoutSessionRouter` which drives view switching |
| `components/workouts/session/views/workout-confirm-view.tsx` | Confirm view — workout name, exercise list preview, "Start Workout" button |
| `components/workouts/session/views/active-workout-view.tsx` | Active view — session header, exercise card placeholder, set rows placeholder |
| `components/workouts/session/views/workout-summary-view.tsx` | Summary view — completion icon, stat placeholders, "Done" navigates to dashboard |
| `components/workouts/session/overlays/pause-overlay.tsx` | Full-screen pause overlay — "Resume" and "Cancel Workout" |
| `components/workouts/session/overlays/finish-confirm-dialog.tsx` | Bottom-sheet dialog — "Finish Workout" / "Keep Going" |

---

## Files Modified

None.

---

## Files Deleted

None.

---

## Architecture Changes

### New route
`/[locale]/workouts/session?workoutId=X&scheduleDay=Y&split=Z`

Inherits the `(app)/workouts/layout.tsx` wrapping (`MuscleSelectionProvider` — harmless, not used by the session). A session-specific layout to hide the bottom nav during active workouts is deferred to Sprint W6.

### Session component hierarchy

```
WorkoutSessionPage (Server)
  └── WorkoutSessionClient (Client)
        └── WorkoutSessionProvider (Context — owns SessionStatus)
              └── WorkoutSessionRouter (Private — drives view switching)
                    ├── WorkoutConfirmView    (status: idle | initialising | recovering)
                    ├── ActiveWorkoutView     (status: active | resting | transitioning | paused | finishing)
                    ├── PauseOverlay          (status: paused, via AnimatePresence)
                    ├── FinishConfirmDialog   (status: finishing, via AnimatePresence)
                    └── WorkoutSummaryView    (status: completing | completed)
```

### Session state (Sprint W1)

```typescript
type WorkoutSessionContextValue = {
  status: SessionStatus;          // drives routing
  setStatus: (s) => void;         // replaced by action dispatchers in Sprint W3+
  initialData: WorkoutSessionInitialData;  // frozen at page load
};
```

Context value is memoised (`useMemo` keyed to `status` and `initialData`) — avoids re-rendering all consumers on unrelated state changes.

### Data flow (Sprint W1 only)

Server fetches `workouts` + `workout_exercises` joined with `exercises` (locale-resolved names). Exercises are frozen into `initialData` and passed down — identical to the "freeze at session start" strategy in the blueprint. No mid-session DB queries.

---

## Decisions Made

1. **`WorkoutSessionRouter` is a private function inside `workout-session-client.tsx`** — it needs `useWorkoutSession()` (requires being a descendant of the provider) but doesn't need to be exported. Keeping it private avoids an extra file.

2. **`AnimatePresence` wraps only the overlays** — `PauseOverlay` and `FinishConfirmDialog` appear/disappear; views do their own entry animations. This matches the pattern used in the generator's `AnimatePresence` usage.

3. **`cancelled` status renders nothing** — `WorkoutSessionRouter` has no branch for `cancelled`. On cancellation, a future sprint will navigate the user away before the component unmounts. Sprint W1 just falls through to blank.

4. **`as unknown as RawExerciseRow[]` cast for the join** — Supabase's generated types don't fully resolve nested select shapes. This matches the pattern established in `lib/actions/schedules.ts` (`as unknown as RawScheduleDay[]`). A typed server action in `lib/actions/sessions.ts` will replace this in Sprint W2.

5. **Session page redirects if `workoutId` is absent or workout not found** — follows the same defensive redirect pattern as `program/page.tsx` and `generator/page.tsx`.

6. **Blueprint discrepancy noted**: The `workout_sessions` DB table uses `ended_at` (not `completed_at` as the blueprint described). Sprint W2 must use `ended_at` when creating/closing sessions.

---

## Remaining TODOs

- **W2**: Session creation — INSERT to `workout_sessions`, write to localStorage
- **W3**: Set logging — `ActiveSetRow` inputs, `session_sets` INSERT, sync queue
- **W4**: Exercise navigation — `currentExerciseIndex`, progress dots, skip flow
- **W5**: Rest timer — `RestTimerOverlay`, `useRestTimer`, timestamp-based countdown
- **W6**: Pause/finish — `ElapsedTimer`, accumulated pause time, `ended_at` write, hide bottom nav via session layout
- **W7**: Summary — real duration, volume, per-exercise stats
- **W8**: Recovery — `useSessionRecovery`, localStorage restore, orphaned session detection
- **W9**: Error handling — auth expiry, set save retry, completion retry

---

## Known Issues

- `cancelled` status has no UI — the screen goes blank. Acceptable for W1; navigation away is Sprint W9.
- The session route inherits `MuscleSelectionProvider` from `workouts/layout.tsx`. It is unused and harmless, but a dedicated session layout (to also hide the bottom nav during active workout) is the correct long-term solution.
- Blueprint used `completed_at` for the session end timestamp; the actual column is `ended_at`. All future sprints must use `ended_at`.

---

## Testing Checklist

- [ ] Route resolves: `/en/workouts/session?workoutId=<valid-id>` renders `WorkoutConfirmView`
- [ ] Missing `workoutId` redirects to `/workouts`
- [ ] Invalid `workoutId` (not owned by user) redirects to `/workouts`
- [ ] Unauthenticated request redirects to `/login`
- [ ] "Start Workout" button transitions to `ActiveWorkoutView`
- [ ] "Pause" button shows `PauseOverlay` over `ActiveWorkoutView`
- [ ] "Resume" from pause returns to `ActiveWorkoutView`
- [ ] "Cancel Workout" from pause sets status `cancelled` (blank screen — expected)
- [ ] "Finish Workout" button shows `FinishConfirmDialog`
- [ ] "Keep Going" from dialog returns to `ActiveWorkoutView`
- [ ] "Finish Workout" from dialog transitions to `WorkoutSummaryView`
- [ ] "Done" on summary navigates to `/dashboard`
- [ ] Exercise list renders with locale-correct names (en/es/ro)
- [ ] No TypeScript errors (`tsc --noEmit` clean)
- [ ] No existing workout routes broken

---

## Build Status

- **TypeScript**: Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint**: Not run — pending approval per project convention
- **Production build**: Not run — pending approval per project convention

---

## Notes

- Entry point for the session is `/workouts/session?workoutId=X`. The dashboard "Start Workout" CTA and the generator's save flow should eventually navigate here instead of `/workouts/generator`. That wiring is a product decision for Sprint W2/W3.
- The `FrozenExercise` and `WorkoutSessionInitialData` types in `workout-session-provider.tsx` are the canonical types for session data. Future sprints should import from there, not redefine.
- `useWorkoutSession()` throws if called outside the provider — intentional, consistent with how `useMuscleSelection()` is guarded in `muscle-selection-context.tsx`.
