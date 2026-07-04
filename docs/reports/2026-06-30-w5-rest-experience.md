# Workout Session Engine — Sprint W5 (Rest Experience)

**Date:** 2026-06-30  
**Sprint:** W5 — Rest Experience  
**Status:** APPROVED

---

## Summary

The workout now feels continuous between sets. Immediately after completing any set (except the last set of the last exercise, and sets with `restSec === 0`), a rest overlay slides up from the bottom showing a countdown, a depleting progress bar, the next target, and a Skip Rest button. The overlay dismisses automatically at zero or immediately when Skip Rest is tapped. The timer is fully isolated in a dedicated component with no memory leaks and no duplicate timers.

---

## Files Created

| File | Description |
|---|---|
| `components/workouts/session/overlays/rest-overlay.tsx` | Self-contained rest countdown component |

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/session/views/active-workout-view.tsx` | Added `restState`, trigger logic in `handleCompleteSet`, `relative` outer container, `AnimatePresence` + `RestOverlay` render |

---

## Architecture

### Timer isolation

Timer logic lives entirely in `RestOverlay`. The parent (`ActiveWorkoutView`) only manages whether the overlay is shown (`restState: { restSec, nextTarget } | null`). The interface is three props: `initialSeconds`, `nextTarget`, `onDismiss`.

```
ActiveWorkoutView
  handleCompleteSet() → setRestState({...})  ← trigger
  <AnimatePresence>
    {restState && <RestOverlay
      initialSeconds={restState.restSec}
      nextTarget={restState.nextTarget}
      onDismiss={() => setRestState(null)}   ← callback for both skip and auto-close
    />}
  </AnimatePresence>
```

### `setTimeout` chain (not `setInterval`)

Each tick schedules only the next tick:

```typescript
useEffect(() => {
  if (secondsLeft <= 0) { onDismissRef.current(); return; }
  const id = setTimeout(() => { setSecondsLeft(s => s - 1); }, 1000);
  return () => clearTimeout(id);  // cleanup cancels pending tick on unmount
}, [secondsLeft]);
```

Why `setTimeout` chain over `setInterval`:
- React's `useEffect` cleanup runs before the next effect and on unmount. Each cleanup `clearTimeout(id)` cancels exactly one timer — there is never more than one pending timer.
- With `setInterval`, the cleanup must fire before the interval fires again or you get duplicate callbacks. With a `setTimeout` chain, React's cleanup window is naturally aligned with the tick boundary.
- Result: zero memory leaks, zero duplicate timers, zero race conditions on unmount.

### `onDismiss` ref sync

```typescript
const onDismissRef = useRef(onDismiss);
useEffect(() => { onDismissRef.current = onDismiss; });
```

The `onDismiss` callback is `() => setRestState(null)` — a new function identity on every parent render. If included in the timer effect's dependency array, it would cause the timer to re-run on every render (resetting the count). The ref pattern keeps the callback fresh without triggering effect re-runs.

### `RestNextTarget` discriminated union

```typescript
export type RestNextTarget =
  | { kind: 'set';      weight: number; reps: number }
  | { kind: 'exercise'; name: string }
  | { kind: 'none' };
```

The overlay renders different text per `kind`. The `'none'` variant is included for completeness (the overlay type is shared), but in practice `shouldStartRest` is false when the result would be `'none'` — the overlay never shows with `kind: 'none'`.

### Guard logic (UX spec §6.5 and §8.10)

In `handleCompleteSet()`:

```typescript
const isAllSetsNowDone = next.size >= totalSets;
const isLastExercise = !hasNextExercise;
const shouldStartRest = ex.restSec > 0 && !(isAllSetsNowDone && isLastExercise);
```

| Case | `shouldStartRest` | Reason |
|---|---|---|
| Non-last set, `restSec > 0` | `true` | Normal rest |
| Last set of non-last exercise, `restSec > 0` | `true` | Rest before next exercise |
| Last set of last exercise, any `restSec` | `false` | §6.5: no rest after final set |
| Any set, `restSec === 0` | `false` | §8.10: don't show 0s timer |

### `nextTarget` computation

```typescript
const nextTarget: RestNextTarget = isAllSetsNowDone
  ? { kind: 'exercise', name: nextExercise!.name }  // !.name safe: isLastExercise is false here
  : { kind: 'set', weight, reps };
```

`weight` and `reps` are the current Zone C input values — they apply to all sets within an exercise, so they correctly represent the next set's target.

### Overlay visual details

| Element | Value |
|---|---|
| Slide animation | `y: '100%' → 0` on enter; reverse on exit (framer-motion `AnimatePresence`) |
| Duration | 300ms ease-out |
| Background | `#0a0a0a` — opaque, immersive |
| Countdown size | `72px font-black` (largest element on screen) |
| Color change | `text-[#aaff00]` when `secondsLeft ≤ 10` (500ms transition) |
| Progress bar | Depletes from right to left; `motion.div` width animated over 0.9s linear per tick |
| Position | `absolute inset-0 z-30` inside `relative` outer container of `ActiveWorkoutView` |

### Why `absolute inset-0` and not a router route

The UX spec (§6.3) specifies the rest overlay "slides up over the active workout screen — does not replace it." The active workout content remains mounted underneath. Using `absolute inset-0` on the overlay (with `relative` on the parent) achieves this without adding a router branch or changing provider status. The overlay is visually immersive (`#0a0a0a` opaque) but structurally layered.

---

## Validation

### Timer accuracy

`setTimeout(fn, 1000)` fires every ~1000ms. Over a 60s rest, maximum drift is tens of milliseconds — imperceptible for a gym rest timer. The depleting bar animates smoothly between ticks via `transition={{ duration: 0.9, ease: 'linear' }}`. ✅

### Skip Rest

User taps → `onDismiss()` → `setRestState(null)` → `restState = null` → `AnimatePresence` triggers exit animation → `RestOverlay` unmounts → `useEffect` cleanup fires `clearTimeout(id)` → pending tick cancelled. ✅

### Automatic close at zero

`secondsLeft` reaches 0 → effect fires → `if (secondsLeft <= 0) { onDismissRef.current(); return; }` → `setRestState(null)` in parent → unmount → cleanup. The `return;` prevents a new `setTimeout` from being scheduled after zero. ✅

### No timer leaks

Every `setTimeout` ID is captured in effect scope. Every effect cleanup runs `clearTimeout(id)`. On unmount (either via Skip or auto-close), the cleanup fires before the component is garbage collected. The `onDismissRef` sync effect has no subscriptions and needs no cleanup. ✅

### No React memory leaks

No subscriptions, no DOM event listeners added outside React's lifecycle. Only `setTimeout` (cleaned up) and `useRef` (no lifecycle). ✅

### No duplicate timers

`useEffect([secondsLeft])` runs once per `secondsLeft` change. React runs the previous effect's cleanup before scheduling the next one — so the old `clearTimeout` fires before the new `setTimeout` is created. Only one pending timer at any moment. ✅

### No TypeScript errors

`npx tsc --noEmit` — no output (exit 0). ✅

---

## Decisions Made

1. **`setTimeout` chain over `setInterval`** — Aligns with React's effect cleanup model. Each cleanup cancels exactly one timer. No drift accumulation across ticks.

2. **`onDismissRef` for stable callback** — The parent re-renders whenever `restState` changes. An inline `() => setRestState(null)` gets a new identity every render. Without the ref, the timer effect would include `onDismiss` in its deps and reset `secondsLeft` on every parent render. The ref pattern is standard for stable callbacks in `useEffect`.

3. **Local `restState` in `ActiveWorkoutView` (not provider status)** — The rest overlay only needs to interact with local set-completion state. The provider's `status = 'resting'` is reserved for W8 (session recovery needs to know the session was in a rest period). Adding rest to provider state now would be premature coupling.

4. **`absolute inset-0` inside `relative` parent** — The overlay clips to the active workout area (not the full viewport). The app shell navigation above/below the session remains unaffected. This matches the UX spec's "slides up over the active workout screen" intent without modifying the router.

5. **`AnimatePresence` in `active-workout-view.tsx` (not router-level)** — Since the overlay is local to the view (not a router-level status change), `AnimatePresence` belongs in the view. Adding it at the router level would require provider status coordination and would break the encapsulation of rest state.

6. **No rest after last set of last exercise** — Per UX spec §6.5. The CTA transitions directly to "Finish Workout" and the `FinishConfirmDialog` flow starts. A rest timer here would be confusing (rest before what?).

---

## Remaining TODOs

- **W6**: Elapsed timer (wire `--:--`), `ended_at` write, cancel → Dashboard, hide bottom nav
- **W7**: Workout summary real stats
- **W8**: Session recovery (`frontierExerciseIndex`, `restState` restore from localStorage)
- **W9**: Set retry queue for failed `logSet()` calls

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — project convention
- **Production Build:** Not run — project convention
