# Dashboard — Compact Empty-State Cards

**Date:** 2026-06-29  
**Time:** 18:16  
**Scope:** Reduce vertical height of Weight Trend and Recent Workouts empty states by ~40%

---

## Summary

Reduced the visual height of two dashboard empty-state cards (Weight Trend and Recent Workouts) by approximately 40% through tighter padding, smaller icons, and reduced gaps. All required elements — title, icon, description, and CTA button — are retained. The populated state of Weight Trend (sparkline chart) is completely unaffected.

---

## Files Created

None.

---

## Files Modified

| File | Change |
|---|---|
| `components/dashboard/sections/progress-section.tsx` | Reduced empty-state padding, icon size, and gaps inside `WeightSparkline`; added conditional card padding so only the empty state is affected |
| `components/dashboard/sections/recent-workout-section.tsx` | Reduced card padding, container gaps, icon size, and button padding in the empty state |

---

## Files Deleted

None.

---

## Architecture Changes

None. The conditional card padding (`weightLogs.length >= 2 ? 'py-4' : 'py-2'`) in `ProgressSection` is the only structural addition — it ensures the populated sparkline retains its original spacing while the empty placeholder is compact.

---

## Decisions Made

- **Conditional card padding instead of in-component padding**: The `DashboardCard` wrapper in `ProgressSection` now applies `py-2` in the empty state and `py-4` in the populated state. This was required because the `WeightSparkline` populated branch does not have an equivalent inner padding div to adjust — only the card-level class can be conditionally changed without touching the chart path.
- **Removed inner `py-4` from the empty container div**: The `WeightSparkline` empty state had both the card `py-4` and an inner `div py-4`, creating ~32px of padding on each side. Removing the inner padding (and reducing the card to `py-2`) brings total vertical padding down to ~8px per side.
- **Icon scale-down chosen over layout change**: Kept the vertical stacked layout to preserve visual style. Reduced icons from `h-12 w-12` → `h-8 w-8` (Weight Trend) and `h-14 w-14` → `h-10 w-10` (Recent Workouts) proportionally.
- **Glow radius matched to new icon size**: `Recent Workouts` glow adjusted from `-inset-3 rounded-2xl` to `-inset-2 rounded-xl` to stay proportional to the smaller icon.

---

## Change Summary by Component

### Weight Trend (`WeightSparkline` — empty branch only)

| Property | Before | After |
|---|---|---|
| Card padding | `py-4` (always) | `py-4` (populated) / `py-2` (empty) |
| Container | `gap-3 py-4` | `gap-2` (no inner py) |
| Icon | `h-12 w-12`, `Scale size={20}` | `h-8 w-8`, `Scale size={14}` |
| Button | `mt-1 py-2` | `py-2` (mt-1 removed; gap handles it) |

### Recent Workouts (always empty state)

| Property | Before | After |
|---|---|---|
| Card padding | `py-8` | `py-3` |
| Container | `gap-4` | `gap-2` |
| Icon | `h-14 w-14 rounded-2xl`, `Dumbbell size={24}` | `h-10 w-10 rounded-xl`, `Dumbbell size={18}` |
| Glow | `-inset-3 rounded-2xl` | `-inset-2 rounded-xl` |
| Hint text margin | `mt-1.5` | `mt-1` |
| Button padding | `py-2.5` | `py-2` |

---

## Remaining TODOs

None.

---

## Known Issues

- `RecentWorkoutSection` has no populated state yet (always renders the empty placeholder). When real workout history data is wired in, a populated layout will need to be designed separately — no regressions from this change at that time.
- The 40% reduction target is approximate. Exact pixel savings depend on device font scaling and line-height rendering.

---

## Testing Checklist

- [ ] Weight Trend empty state appears ~40% shorter than before
- [ ] Weight Trend populated state (sparkline + labels) is visually unchanged
- [ ] Recent Workouts empty state appears ~40% shorter than before
- [ ] Icon, title, description, and CTA button all visible in both cards
- [ ] CTA button is clearly tappable (not clipped by reduced padding)
- [ ] Layout correct on narrow screens (320px width)
- [ ] Layout correct on standard mobile (390px width)
- [ ] No overflow or clipping on either card
- [ ] No console errors

---

## Build Status

**Pending approval** — build not run per project convention (do not auto-run).

Expected: clean. Changes are purely presentational (Tailwind class adjustments). No TypeScript type changes, no new imports, no logic changes.

---

## Notes

- The inner `py-4` on `WeightSparkline`'s empty container was redundant with the card's own `py-4` — together they created ~32px of padding on each side before any content. Both needed to be addressed to achieve meaningful height reduction.
- If a `loading.tsx` skeleton is added for the dashboard in a future sprint, these empty states should be excluded from the skeleton (they are data-driven fallbacks, not loading states).
