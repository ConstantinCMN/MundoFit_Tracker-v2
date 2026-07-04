# History Polish Patch — Exercise Count & Duration Display

**Date:** 2026-06-29  
**Time:** 23:05  
**Scope:** Display-only fixes for workout history cards. No database changes, no query changes, no logic changes.

---

## Summary

Applied the two fixes approved in the history investigation report. Both are display-only changes affecting how `exerciseCount` and `duration_sec` are rendered in the history card and session detail sheet. The underlying data, queries, and server actions are untouched.

---

## Files Created

None.

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/workout-history-client.tsx` | Guard exercise row with `session.exerciseCount > 0`; replace `Math.round` duration with `<1` / rounded value |
| `components/workouts/session-detail-sheet.tsx` | Same duration formula fix (`<1` for sessions under 60 seconds) |

---

## Files Deleted

None.

---

## Architecture Changes

None. Display logic only.

---

## Decisions Made

1. **`'<1'` string instead of `1` for short sessions** — "1 min" would be inaccurate for a 5-second session. `<1 min` is honest and standard (matches patterns used by Apple Health, Strava, Strong). The `durationMin` variable becomes `number | '<1' | null` — TypeScript accepts this because the rendered output is a template string, not arithmetic.

2. **Guard is `exerciseCount > 0`, not `exerciseCount != null`** — `exerciseCount` is always a number (never null, it defaults to `0` from the `Set.size` computation). The `> 0` guard is the correct and minimal condition.

3. **Same formula in both files** — `workout-history-client.tsx` (the list card) and `session-detail-sheet.tsx` (the detail bottom sheet) had identical `Math.round` formulas. Both were updated for consistency. Diverging them would cause the card and sheet to show different values for the same session.

4. **No change to the null-hiding logic** — Sessions with `duration_sec = null` (all Sprint W2 sessions) still produce `durationMin = null` and the clock row is still hidden. The `<1` path only fires for sessions where `duration_sec` is a small positive number (old generator sessions that completed in < 60 seconds).

---

## Remaining TODOs

- Sprint W3 (Set Logging) — will populate `session_sets`, making `exerciseCount` real for all future engine sessions. The `> 0` guard will naturally become a no-op for completed sessions.
- Sprint W6 (Finish flow) — writes `duration_sec` for engine sessions, making the clock row appear for the first time in the new flow.
- Post-W7 — Wire Dashboard `RecentWorkoutSection` to real `workout_sessions` data.

---

## Known Issues

None introduced by this patch.

---

## Testing Checklist

- [ ] Sprint W2 session card: exercise row is hidden (not "0 exercises")
- [ ] Sprint W2 session card: clock row is hidden (duration_sec is null — unchanged)
- [ ] Old generator session < 60s: clock row shows "<1 min" (not "0 min")
- [ ] Old generator session ≥ 60s: clock row still shows correct rounded minutes
- [ ] Old generator session with exercises: exercise row still shows correct count
- [ ] Session detail sheet: same duration rendering as the list card

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — pending approval per project convention
- **Production Build:** Not run — pending approval per project convention
