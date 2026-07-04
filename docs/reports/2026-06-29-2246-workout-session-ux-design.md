# Workout Session UX Design — Design Sprint v1

**Date:** 2026-06-29  
**Time:** 22:46  
**Scope:** Full UX design for the Workout Session screen — no implementation. Product design, interaction design, component hierarchy, and developer handoff specifications.

---

## Summary

Produced a complete UX design document for the Workout Session experience. The deliverable covers screen architecture, component hierarchy, visual layout specifications with ASCII wireframes, step-by-step interaction flows, and 10 explicit UX recommendations. Also includes a "Things to Avoid" section and a future improvements roadmap. No code was written.

The design is built around four core principles: never make the user think, trust them with their data, make set completion feel rewarding, and treat the rest timer as part of the workout (not an interruption).

---

## Files Created

| File | Purpose |
|---|---|
| `docs/ux/workout-session-design-v1.md` | Full UX design specification — screen architecture, wireframes, interaction flows, UX recommendations |

---

## Files Modified

None.

---

## Files Deleted

None.

---

## Architecture Changes

### Three-Zone Screen Architecture

The central structural decision is a fixed three-zone layout:

- **Zone A (sticky header):** Workout title, elapsed timer, progress bar. Always visible. `backdrop-filter: blur` for premium feel.
- **Zone B (scrollable):** Exercise context, previous performance card, sets table. Grows with content. Has scroll padding at bottom to never hide behind Zone C.
- **Zone C (sticky bottom bar):** Weight input, reps input, CTA button, exercise nav. Fixed above the keyboard. Eliminates the #1 mobile input UX failure (keyboard covers content).

This structure is independent of how the current `ActiveWorkoutView` placeholder works and will require refactoring the layout model when Sprint W3 is implemented.

### CTA Button as State Machine

The single CTA button drives the entire session flow. Its label and behavior are the UI representation of the session state machine:

| Moment | CTA Label | CTA Style |
|---|---|---|
| Active set, not last | "Complete Set N" | Filled `#aaff00` |
| During rest | (hidden — rest overlay visible) | — |
| After last set of exercise | "Next Exercise →" | Accent outline |
| After last set of last exercise | "Finish Workout" | Filled `#aaff00` |
| On summary | "Done — Go to Dashboard" | Muted fill |

### Rest Timer as Overlay (Not Route)

The rest timer slides over the active workout view rather than replacing it. Status remains `'resting'`. The overlay auto-dismisses at 0 and the user returns to the active set without any navigation event. This matches the existing `AnimatePresence` pattern in `WorkoutSessionClient`.

### Optimistic Set Logging

`session_sets` INSERTs happen in the background after the UI confirms the set locally. No spinner. Failed INSERTs queue for retry (Sprint W9). This keeps the workout flow uninterrupted.

---

## Decisions Made

1. **Zone C sticky bottom bar (not inline inputs):** Mobile keyboard covers inline table inputs. Zone C sits just above the keyboard. This is non-negotiable for mobile UX.

2. **2.5 kg increment default:** Matches physical gym reality. Smaller increments add noise. Users can type exact values by tapping the display.

3. **Rest timer auto-starts, auto-dismisses:** One fewer tap per set. Skippable in one tap. This is the default pattern in every major fitness app (Strong, Hevy, Fitbod) because it works.

4. **No auto-advance between exercises:** Users must explicitly tap "Next Exercise". Prevents the anxiety of the app "running away" while the user adjusts equipment.

5. **PR celebration via card tint + row badge, not confetti overlay:** Premium restraint. The moment is brief and meaningful without breaking focus.

6. **inputMode="decimal" / "numeric" instead of type="number":** `type="number"` on mobile has inconsistent decimal support across Android manufacturers. `inputMode` gives the right keyboard without the browser's number input UI quirks.

7. **Previous Performance card always visible (not collapsed):** Progressive overload is the core of strength training. The last session data should be visible at all times, not hidden behind a tap. This is the most important single piece of information during a set.

8. **Implicit pre-fill priority:** Last session (same set number) → last session (any set) → template defaults → previous set in this session. Never leave inputs at 0.

---

## Remaining TODOs

- **Sprint W3:** Set logging — implement `ActiveSetRow` inputs, `session_sets` INSERT, optimistic updates, Zone C bottom bar
- **Sprint W4:** Exercise navigation — `currentExerciseIndex`, slide transitions, prev/next exercise buttons
- **Sprint W5:** Rest timer — timestamp-based countdown overlay, skip rest, +30s/−30s adjustment
- **Sprint W6:** Pause/finish/elapsed time — running HH:MM:SS timer, `PauseOverlay` wired to timer, `ended_at` write, hide bottom nav during session, cancel → navigate to Dashboard
- **Sprint W7:** Summary — real duration, volume sum, per-exercise breakdown, PR badges
- **Sprint W8:** Session recovery — `useSessionRecovery` hook reads localStorage blob, restores exercise index and completed sets
- **Sprint W9:** Error handling — silent set-save retry queue, auth expiry banner, localStorage quota detection
- Revisit this design doc after Sprint W4 to validate against actual state management constraints

---

## Known Issues

None — this is a design document, no code was modified.

---

## Testing Checklist

- [x] Document covers all required sections from task brief
- [x] All 8 required UI components addressed (header, exercise progress, previous performance, sets table, weight/reps input, complete set, rest timer, exercise navigation, finish flow, summary)
- [x] UX principles applied: guided, rewarding, distraction-free, minimal taps, large targets
- [x] Mobile usability addressed throughout (keyboard, touch targets, zone architecture)
- [x] "Things to Avoid" section included
- [x] Future improvements captured

---

## Build Status

- **TypeScript:** N/A (design only)
- **ESLint:** N/A
- **Production Build:** N/A

---

## Notes

- The design was created with the existing `SessionStatus` union type in mind — no new states needed for the described interactions. The `'resting'` and `'transitioning'` statuses are correctly allocated.
- The `workout_sessions.ended_at` discrepancy (vs. blueprint's `completed_at`) is handled consistently — the design refers to the real column name.
- ASCII wireframes in the document are developer-readable but are intentionally not pixel-perfect. They communicate hierarchy and proportion, not exact dimensions.
