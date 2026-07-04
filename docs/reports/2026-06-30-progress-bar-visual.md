# Workout Progress Bar — Visual Improvement

**Date:** 2026-06-30  
**Scope:** UI-only — no logic, state, or behaviour changes  
**Status:** COMPLETE

---

## Executive Summary

The workout progress bar was rendered correctly but was invisible in practice. A 4px track in `#1a1a1a` sat directly above a `border-b` in the identical colour `#1a1a1a`, making the two merge into a single thick divider line. At 0% progress there was no green fill, leaving nothing visible at all. The fix removes the redundant border, increases track height to 6px, sets the track to `#333333` (clearly distinguishable from the `#0a0a0a` background), and tightens the animation from 700ms to 250ms. The progress bar now reads immediately as a progress indicator at every fill level, including 0%. No logic was touched.

---

## Changes

### What changed

| Property | Before | After |
|---|---|---|
| Track height | `h-1` (4px) | `h-1.5` (6px) |
| Track colour | `bg-[#1a1a1a]` | `bg-[#333333]` |
| Track shape | No border-radius | `rounded-full overflow-hidden` |
| Fill animation | `transition-all duration-700` | `transition-[width] duration-[250ms] ease-out` |
| Header border | `border-b border-[#1a1a1a]` present | Removed |
| Fill colour | `bg-[#aaff00]` | Unchanged |
| Fill shape | `rounded-full` | Unchanged |

### Why each change matters

**Remove `border-b border-[#1a1a1a]` from `<header>`**  
The border shared the exact same colour as the track. Visually, 4px track + 1px border = a 5px `#1a1a1a` band that read as a single decorative border, not a progress indicator. Removing the border makes the track stand on its own. The 6px track now acts as the visual separator between Zone A (session header) and Zone B (scrollable content) — the same role the border served, but with semantic meaning.

**`bg-[#333333]` track (was `#1a1a1a`)**  
`#333333` has approximately 2.5× the luminance of `#1a1a1a` on the `#0a0a0a` background. The empty track is now visually present even before any exercises are completed. At 0% progress the user can see the full extent of the bar and understand what it will fill as they work through the workout.

**`h-1.5` (6px, was 4px)**  
4px is below the threshold at which most people consciously register a horizontal UI element in peripheral vision during active use. 6px is wide enough to be noticed without becoming visually dominant. It sits between h-1 (barely perceptible) and h-2 (chunky).

**`rounded-full overflow-hidden` on track + `rounded-full` on fill**  
The track `rounded-full` makes the empty indicator look intentional rather than a layout artefact. `overflow-hidden` clips the fill to the track bounds so the leading edge is always clean. The fill's `rounded-full` preserves the rounded right-side cap at intermediate values (25%, 50%, 75%), giving the standard "pill fills in from left" progress bar look.

**`transition-[width] duration-[250ms] ease-out` (was `transition-all duration-700`)**  
700ms is noticeably slow for a 4–20% jump that happens the moment the user completes all sets of an exercise. It felt sluggish and slightly disconnected from the action that triggered it. 250ms `ease-out` is fast enough to feel snappy and responsive while still being smooth enough to be readable. `transition-[width]` scopes the transition to only the width property — no unintended transitions on colour or opacity if those ever change.

---

## Visibility at Key Percentages

For a 5-exercise workout (`exercises.length = 5`):

| State | `frontierExerciseIndex` | `allSetsForExDone` | `progressPct` | Visible bar width |
|---|---|---|---|---|
| Session start, no sets done | 0 | false | **0%** | Track only — `#333333` full width |
| Exercise 1, all sets complete (before tap) | 0 | true | **20%** | 20% green + 80% dark track |
| After tapping "Next Exercise" (transition) | 1 | — | **20%** | 20% green + 80% dark track |
| Exercise 3, all sets complete | 2 | true | **60%** | 60% green + 40% dark track |
| Exercise 5, all sets complete | 4 | true | **100%** | Full green — track invisible beneath fill |

At **0%** the dark `#333333` track spans the full width — immediately recognisable as a progress bar waiting to be filled.  
At **100%** the green fill covers the track entirely — the bar reads as "complete."

---

## Files Modified

| File | Lines changed |
|---|---|
| `components/workouts/session/views/active-workout-view.tsx` | Header `className` (removed `border-b`); progress bar track + fill |
| `components/workouts/session/views/exercise-transition-view.tsx` | Header `className` (removed `border-b`); progress bar track + fill |

---

## What was NOT changed

- `progressPct` formula in either component — unchanged
- `frontierExerciseIndex` and `allSetsForExDone` logic — unchanged
- Zone B, Zone C layout — unchanged
- All other header content (pause button, workout name, exercise counter, timer) — unchanged
- `WorkoutSummaryView`, `WorkoutConfirmView`, `PauseOverlay`, `FinishConfirmDialog` — not touched

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
