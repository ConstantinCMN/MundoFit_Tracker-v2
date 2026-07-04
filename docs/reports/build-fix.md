# Build Fix — Unescaped Apostrophe

**Date:** 2026-07-04
**Task:** Fix the single remaining build error reported in `docs/reports/workout-session-engine-activation.md` — a `react/no-unescaped-entities` ESLint failure in `components/workouts/session/views/active-workout-view.tsx`. No logic changed.

---

## Fix

**File:** `components/workouts/session/views/active-workout-view.tsx`, line 299.

```diff
- Today's target
+ Today&apos;s target
```

One character entity, no other change. No JSX structure, props, logic, or styling touched.

---

## Validation

```
npm run build
```

**Result: PASS.** Compiled successfully; the full route manifest was generated, including `/workouts/session` (13.9 kB) — the newly activated Workout Session Engine route builds cleanly.

---

## Files Modified

- `components/workouts/session/views/active-workout-view.tsx` (1 line)

STOP.
