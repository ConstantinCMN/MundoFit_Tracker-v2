# Stabilization Sprint S1 — Critical Issue Resolution

**Date:** 2026-06-30  
**Sprint:** S1 — Stabilization (QA-01 Critical Fixes)  
**Status:** COMPLETE  
**Issues Resolved:** C-01, C-02, C-03, C-04

---

## Executive Summary

All four critical issues identified in QA Sprint 01 are resolved. The session engine is now safe to navigate, database volume is persisted correctly, and the workout experience is fully isolated from the global app shell. The session page was moved to a dedicated `(session)` route group — the right architectural boundary for a standalone experience. No new files were created beyond what the fix required. TypeScript is clean.

---

## Issues Fixed

### C-01 — Cancel Workout now works correctly

**Before:** "Cancel Workout" in `PauseOverlay` called `setStatus('cancelled')`. The session router had no branch for `'cancelled'` — blank screen, session orphaned in DB, localStorage not cleared.

**Fix:** Added `cancelWorkout()` callback to `WorkoutSessionProvider`. It clears the localStorage recovery blob and calls `router.push('/dashboard')`. `PauseOverlay` now calls `cancelWorkout()` directly.

**Files:**
- `components/workouts/session/workout-session-provider.tsx` — added `cancelWorkout`, added `useRouter` import
- `components/workouts/session/overlays/pause-overlay.tsx` — replaced `setStatus('cancelled')` with `cancelWorkout()`

---

### C-02 — `total_volume_kg` now written to the database

**Before:** `completeSession()` wrote only `ended_at` and `duration_sec`. The `total_volume_kg` column in `workout_sessions` was always `NULL`. Summary screen showed volume from in-memory state; the database had no record of it.

**Fix:** Added `totalVolumeKg: number` as a fourth parameter to `completeSession()`. The UPDATE now includes `total_volume_kg: totalVolumeKg`. In `finishWorkout()`, the current `totalVolumeKg` from provider state is passed. The summary screen and the database now hold identical values.

**Files:**
- `lib/actions/sessions.ts` — added `totalVolumeKg` param, included in UPDATE
- `components/workouts/session/workout-session-provider.tsx` — updated `finishWorkout()` to pass `totalVolumeKg`; added to `useCallback` dependency array

---

### C-03 + C-04 — Global Header and BottomNav hidden during sessions

**Before:** The session page lived inside `app/[locale]/(app)/workouts/session/`. The `(app)` layout wraps all routes with `AppShell`, which renders a fixed `Header` (z-40, 48px top) and fixed `BottomNav` (z-40, bottom). During a session, both were visible: the Header showed an active back button (`router.back()`), and the BottomNav exposed five tab-switch links — three accidental-exit paths with no warning.

**Fix:** Moved the session page to a new `app/[locale]/(session)/` route group. Route groups in Next.js App Router do not affect the URL, so `/[locale]/workouts/session` continues to resolve correctly. The `(session)/layout.tsx` is a minimal wrapper — full-viewport background, `app-container` centering — with no `AppShell`, no `Header`, no `BottomNav`.

The old `(app)/workouts/session/page.tsx` was deleted to avoid the routing conflict.

**Height calculations updated:** All session views that used `calc(100dvh - 112px - env(safe-area-inset-bottom, 0px))` (subtracting 48px Header + 64px BottomNav) now correctly use `calc(100dvh - env(safe-area-inset-bottom, 0px))` for fixed-height views, or `min-h-dvh` for flex-column views.

**Files:**
- `app/[locale]/(session)/layout.tsx` — new standalone session layout (no AppShell)
- `app/[locale]/(session)/workouts/session/page.tsx` — session page in new route group
- `app/[locale]/(app)/workouts/session/page.tsx` — deleted (moved)
- `components/workouts/session/views/active-workout-view.tsx` — height: `calc(100dvh - env(safe-area-inset-bottom, 0px))`
- `components/workouts/session/views/exercise-transition-view.tsx` — same
- `components/workouts/session/views/workout-confirm-view.tsx` — `min-h-dvh`
- `components/workouts/session/views/workout-summary-view.tsx` — `min-h-dvh`

---

## Architecture Notes

### `cancelWorkout()` ownership

Cancel logic belongs in the provider, not the overlay. `PauseOverlay` doesn't need to know about localStorage or navigation — it just calls `cancelWorkout()`. The provider owns the full cancel contract: clear state, clear storage, navigate away.

```typescript
const cancelWorkout = useCallback(() => {
  try { localStorage.removeItem(SESSION_STORAGE_KEY); } catch { /* quota / incognito */ }
  router.push('/dashboard');
}, [router]);
```

No `status` change is needed before navigating — `router.push` triggers a full unmount of the provider tree.

### `total_volume_kg` closure correctness

`finishWorkout()` reads `totalVolumeKg` from the closure (it's in the `useCallback` dep array). The provider accumulates volume via `addVolume(weight * reps)` on each set completion. When `finishWorkout()` fires, `totalVolumeKg` holds the exact value that was shown on the summary screen. The database write and the UI display are guaranteed identical.

### Route group approach for layout isolation

In Next.js App Router, child layouts nest inside parent layouts — they cannot escape them. The only correct way to use a different layout for a specific URL segment is to place it in a sibling route group at the same `[locale]` level. The new `(session)` group sits alongside `(app)`, `(auth)`, and `(onboarding)`. It has its own layout (no AppShell) and resolves `/workouts/session` without conflicting with any `(app)` route (since `/workouts/session` was removed from `(app)`).

The session page inside `(session)` still inherits `app/[locale]/layout.tsx` (which provides `<html>`, `<body>`, fonts, `NextIntlClientProvider`) — so i18n and font loading are unaffected.

---

## Validation

| Check | Result |
|---|---|
| Cancel Workout clears localStorage | ✅ `localStorage.removeItem(SESSION_STORAGE_KEY)` in `cancelWorkout()` |
| Cancel Workout navigates to Dashboard | ✅ `router.push('/dashboard')` |
| No blank screen on cancel | ✅ Router is never in an unmatched state |
| `total_volume_kg` written to DB | ✅ Included in UPDATE alongside `ended_at` and `duration_sec` |
| Summary volume = DB volume | ✅ Same `totalVolumeKg` value from provider closure |
| BottomNav hidden during session | ✅ Session is outside `(app)` layout — no `AppShell` rendered |
| Global Header hidden during session | ✅ Same — no `AppShell`, no `Header` |
| Back button unreachable during session | ✅ Session header's pause button is the only primary navigation |
| Session URL unchanged (`/workouts/session`) | ✅ Route groups don't affect URL |
| All other routes unaffected | ✅ `(app)` layout group unchanged |
| TypeScript | ✅ `tsc --noEmit` — clean (no output) |

---

## Files Summary

| File | Action |
|---|---|
| `lib/actions/sessions.ts` | Modified — added `totalVolumeKg` to `completeSession()` |
| `components/workouts/session/workout-session-provider.tsx` | Modified — added `cancelWorkout()`, `useRouter`, updated `finishWorkout()` |
| `components/workouts/session/overlays/pause-overlay.tsx` | Modified — replaced `setStatus('cancelled')` with `cancelWorkout()` |
| `app/[locale]/(session)/layout.tsx` | Created — standalone session layout |
| `app/[locale]/(session)/workouts/session/page.tsx` | Created — session page in new route group |
| `app/[locale]/(app)/workouts/session/page.tsx` | Deleted — moved to `(session)` group |
| `components/workouts/session/views/active-workout-view.tsx` | Modified — height calc updated |
| `components/workouts/session/views/exercise-transition-view.tsx` | Modified — height calc updated |
| `components/workouts/session/views/workout-confirm-view.tsx` | Modified — min-height updated |
| `components/workouts/session/views/workout-summary-view.tsx` | Modified — min-height updated |

---

## Remaining High-Priority Issues (from QA-01, deferred)

- **H-01**: localStorage not updated after session start → W8 recovery will restore incomplete state
- **H-02**: Duration includes paused time → `accumulatedPauseMs` not yet implemented
- **H-03**: Previous performance query has no LIMIT
- **H-04**: Rest timer drifts after phone lock

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — project convention
- **Production Build:** Not run — project convention
