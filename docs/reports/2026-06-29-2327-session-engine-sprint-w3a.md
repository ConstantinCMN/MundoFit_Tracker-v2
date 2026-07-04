# Workout Session Engine — Sprint W3A (Active View UI)

**Date:** 2026-06-29  
**Time:** 23:27  
**Scope:** Replace the W1 placeholder `ActiveWorkoutView` with a fully designed three-zone session screen. UI only — no database calls, no timers, no server actions, no localStorage writes, no navigation.

---

## Summary

Implemented the complete visual and interaction shell for the active workout screen, following the approved UX design document (`docs/ux/workout-session-design-v1.md`) and the official product decision that overrides the UX doc's input model: sets table is read-only, editing happens exclusively in the Sticky Bottom Input Bar.

The screen is fully interactive at the UI level — set rows can be tapped to select them, the bottom bar reflects the selected set, +/− buttons adjust weight and reps, and the CTA completes sets with local state. No data is persisted anywhere. All business logic (session_sets INSERT, localStorage sync, history pre-fill, exercise navigation) is deferred to later sprints.

---

## Files Created

None.

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/session/views/active-workout-view.tsx` | Full replacement of W1 placeholder with three-zone session screen |

---

## Files Deleted

None.

---

## Architecture Changes

### Three-Zone Layout

The component implements the Zone A / B / C architecture from the design spec using a flex-column container with `h-[calc(100dvh-112px)] overflow-hidden`:

- **Zone A (Sticky Header):** `flex-none` — never scrolls. Pause button, workout name (truncated), elapsed timer placeholder (`--:--`), progress bar (4px accent fill). Uses `backdrop-blur-xl` for the frosted glass effect.
- **Zone B (Scrollable Content):** `flex-1 overflow-y-auto` — scrolls independently. Exercise context, Previous Performance Card, Target Card, Sets Table.
- **Zone C (Sticky Bottom Bar):** `flex-none` — never scrolls. Weight and Reps input controls with +/− buttons, primary CTA, exercise navigation.

Since Zone C is a `flex-none` child (not `position: fixed`), the iOS keyboard appears above it without displacing content — no keyboard-covers-input problem.

### Product Decision: Tap-to-Select, Read-Only Table

The sets table is display-only. Each row is a `<button>` that updates `selectedSetIdx` state. The active set is highlighted with:
- `border-l: 2px #aaff00` (absolute-positioned left bar to avoid border-direction conflicts)
- `bg-[rgba(255,255,255,0.03)]` background
- Accent text for set number, full `#f5f5f5` for previous data
- Green dot indicator in status column

Editing (weight, reps) happens only in Zone C's input controls.

### Local UI State (W3A only — not persisted)

| State | Type | Default | Purpose |
|---|---|---|---|
| `selectedSetIdx` | `number` | `0` | Which set row is highlighted |
| `completedSets` | `Set<number>` | empty | Which sets have been marked done |
| `weight` | `number` | `60` (mock) | Current weight value in bottom bar |
| `reps` | `number` | from `ex.reps ?? 8` | Current reps value in bottom bar |

### CTA State Machine (UI layer only)

| Condition | Label | Style | Disabled |
|---|---|---|---|
| All sets done | "Finish Workout" | accent ghost | No → calls `setStatus('finishing')` |
| Selected set not done | "Complete Set N" | filled `#aaff00` | No → marks set done + auto-advances |
| Selected set already done (not all done) | "Complete Set N" | filled `#aaff00` | Yes (opacity 40%) |

Auto-advance after completing a set: iterates from `selectedSetIdx + 1` upward to find the next uncompleted set, updates `selectedSetIdx` to it.

### Set Row Visual States

| State | Background | Set# color | Previous color | Status |
|---|---|---|---|---|
| Live (selected, not done) | `rgba(255,255,255,0.03)` + left bar | `#aaff00` | `#f5f5f5` | Green dot |
| Done | `rgba(170,255,0,0.04)` | `#555555` | `#555555` | `Check` icon `#aaff00` |
| Upcoming | `transparent` | `#3a3a3a` | `#3a3a3a` | None |

### Progress Bar

Currently fills by `exIdx / exercises.length` — always 0 in W3A (locked on exercise 0). Will animate correctly once W4 implements `currentExerciseIndex` state.

### Exercise Navigation

The nav buttons at the bottom of Zone C are rendered based on whether prev/next exercises exist in `initialData.exercises`. They are `disabled` in W3A (no onClick). W4 wires `currentExerciseIndex` state and `onClick` handlers. The exercise names are visible to preview what navigation looks like.

---

## Decisions Made

1. **Absolute-positioned left accent bar instead of `border-l`** — Using `border-l-2` on a row that also has `border-b` for dividers causes conflicting border declarations. The `absolute inset-y-0 left-0 w-[2px]` element is a clean alternative that co-exists with the bottom divider and gets clipped correctly by the `overflow-hidden rounded-2xl` table container.

2. **Mock previous data as a module-level constant** — `MOCK_PREV` is not state, not context — it's a compile-time placeholder. W3B will replace it with data from the session history query. Using a constant prevents it from re-initializing on re-renders.

3. **`parseFloat((w ± 2.5).toFixed(1))`** — Floating-point addition can produce `62.49999999...` from `60 + 2.5`. `.toFixed(1)` rounds to one decimal, `parseFloat` converts back to number. This keeps weight values clean without a custom decimal library.

4. **`disabled:pointer-events-none` on nav buttons** — The nav buttons are `disabled` but also have `pointer-events-none` to prevent any tap event propagation in mobile Safari, which sometimes fires click events on disabled buttons inside scroll containers.

5. **No `AnimatePresence` on checkmark for W3A** — The `Check` icon appears/disappears on set completion without a mounting animation. W3B will add the spring-scale animation when the full set-completion flow (network call + local state) is implemented. Adding it to W3A would require `AnimatePresence` around each row's status cell, which is noise at this stage.

6. **`ctaDisabled = !allDone && isSelectedDone`** — When the user taps a completed row and the CTA becomes disabled, the user sees a clear signal: they need to select a different row. No tooltip or explanatory text needed — the sets table's visual state (only one live dot) makes the intent obvious.

---

## Remaining TODOs

- **W3B**: Wire real previous-session data; implement per-set stored weight/reps; wire `session_sets` INSERT on complete; optimistic local state sync
- **W4**: `currentExerciseIndex` context state, exercise navigation handlers, exercise transition animation, progress bar fill
- **W5**: Rest timer overlay (auto-starts after set completion)
- **W6**: Elapsed timer, `ended_at` write, hide bottom nav during session, cancel → Dashboard
- **W7**: Session summary real stats (duration, volume, exercise breakdown)
- **W8**: Session recovery from localStorage blob

---

## Known Issues

- `--:--` timer is a visual placeholder — acceptable for W3A
- Progress bar always at 0 — acceptable for W3A (single exercise)
- Nav buttons are disabled — expected for W3A
- Mock previous performance data (`60 kg × 8 · Jun 14`) is hardcoded — replaced in W3B
- `weight` and `reps` state resets on component re-mount — non-issue until W3B adds localStorage sync

---

## Testing Checklist

- [ ] Zone A is visible and does not scroll away on Zone B scroll
- [ ] Zone C is visible and does not scroll away on Zone B scroll
- [ ] Pause button (Zone A) triggers `PauseOverlay`
- [ ] Tapping an upcoming set row highlights it (accent bar, dot)
- [ ] Tapping a different row moves the highlight
- [ ] "Complete Set N" button marks the row done (checkmark appears)
- [ ] After completing a set, focus auto-advances to next uncompleted set
- [ ] After all sets done, CTA changes to "Finish Workout" (accent ghost style)
- [ ] "Finish Workout" triggers `FinishConfirmDialog`
- [ ] Weight [−] decrements by 2.5 kg (minimum 0)
- [ ] Weight [+] increments by 2.5 kg
- [ ] Reps [−] decrements by 1 (minimum 1)
- [ ] Reps [+] increments by 1 (maximum 50)
- [ ] Weights display without trailing `.0` for whole numbers
- [ ] Weights display with one decimal for non-integers (e.g., `62.5`)
- [ ] Exercise name shows in header (truncated if long)
- [ ] Muscle group tags appear correctly
- [ ] Previous performance card is visible with mock data
- [ ] Target card shows correct sets and reps from `initialData`
- [ ] Next exercise name appears in nav (disabled but visible)

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — pending approval per project convention
- **Production Build:** Not run — pending approval per project convention
