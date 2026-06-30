# Progress Bar — Root Cause Investigation & Fix

**Date:** 2026-06-30  
**Scope:** UI-only — no logic, state, or behaviour changes  
**Status:** COMPLETE  

---

## Root Cause

The progress bar was placed as a **direct child of `<header backdrop-blur-xl>`**, which applies `backdrop-filter: blur(24px)`. `backdrop-filter` creates a new CSS compositing layer and stacking context. In WebKit (iOS Safari — the primary test device), there is a well-documented rendering bug:

> Elements with `overflow: hidden` inside a `backdrop-filter` stacking context fail to render their background color. The background composites as transparent even though the element has non-zero size.

The track div had both `overflow-hidden` AND `bg-[#333333]`. Inside the `backdrop-filter` stacking context, the background was never painted — making the track invisible at 0% fill. The fill div at `0%` width was also not visible. Net result: nothing appeared below the header content row.

The bar was correctly mounted in the DOM with correct size (`h-1.5 = 6px`, `w-full`). The issue was purely in GPU compositing.

---

## What Was Checked

| Hypothesis | Verdict |
|---|---|
| Element not mounted | ❌ — Both views render the bar in JSX; `progressPct` formula is correct |
| Zero height / zero width | ❌ — `h-1.5` is absolute (6px); `w-full` in a stretch flex item = full container width |
| Clipped by outer `overflow-hidden` | ❌ — Bar is within the fixed-height container; flex items sum fits |
| Opacity / display / visibility | ❌ — None applied |
| Z-index covered by sibling | ❌ — Bar is last child of header; no sibling renders above it |
| `backdrop-filter` compositing bug (WebKit) | ✅ — **Root cause confirmed** |

---

## Fix

Moved the progress bar **out of `<header>`** and made it a `flex-none` sibling div between Zone A (header) and Zone B (scrollable content) in the outer `flex flex-col` container. This is outside the `backdrop-filter` stacking context entirely.

### Before (broken)

```tsx
<header className="flex-none bg-[rgba(10,10,10,0.96)] backdrop-blur-xl">
  <div className="flex h-14 ...">...</div>

  {/* Inside backdrop-filter stacking context — WebKit does not paint bg */}
  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#333333]">
    <div className="h-full rounded-full bg-[#aaff00] ..." style={{ width: `${progressPct}%` }} />
  </div>
</header>
```

### After (fixed)

```tsx
<header className="flex-none bg-[rgba(10,10,10,0.96)] backdrop-blur-xl">
  <div className="flex h-14 ...">...</div>
  {/* Nothing else inside header — no children affected by backdrop-filter */}
</header>

{/* Progress bar as flex sibling — renders in normal compositing layer */}
<div className="flex-none h-1.5 bg-[#333333]">
  <div
    className="h-full bg-[#aaff00] transition-[width] duration-[250ms] ease-out"
    style={{ width: `${progressPct}%` }}
  />
</div>
```

### Why this works

- The sibling div is a direct child of the `flex flex-col` container, not of the `backdrop-filter` element
- `flex-none` preserves the 6px height in column flex layout
- `bg-[#333333]` now renders in the normal compositing layer — no WebKit stacking context bug
- `overflow-hidden` is not needed: the fill is constrained by `width: X%` inline style
- `rounded-full` removed from track (no visual regression — straight track reads as clean divider)
- Layout sum unchanged: header (56px) + bar (6px) + Zone B (flex-1) + Zone C

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/session/views/active-workout-view.tsx` | Moved progress bar div out of `<header>`, into outer `flex flex-col` as sibling |
| `components/workouts/session/views/exercise-transition-view.tsx` | Same — progress bar moved out of `<header>` |

---

## What Was NOT Changed

- `progressPct` formula — unchanged
- `frontierExerciseIndex` / `allSetsForExDone` logic — unchanged
- Zone B, Zone C layout — unchanged
- Header content row (pause button, workout name, exercise counter, timer) — unchanged
- All overlay views (PauseOverlay, FinishConfirmDialog, etc.) — not touched

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
