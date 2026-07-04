# Workout Session Engine — Sprint W3A Revision

**Date:** 2026-06-29  
**Time:** 23:40  
**Scope:** Revise `ActiveWorkoutView` to match the approved UX design document. UI only — no business logic changes from the original W3A.

---

## Why This Revision Was Needed

The original W3A implementation (report: `2026-06-29-2327-session-engine-sprint-w3a.md`) was rejected because it did not match the approved design. Two root problems were identified:

1. **Zones were not actually sticky.** The component used `h-[calc(100dvh-112px)] overflow-hidden` as a wrapper to create a self-contained scroll context. This works on paper but fails in practice because `main` (AppShell) has `overflow-y-auto` — the component's outer container scrolls with the page before Zone B even gets a chance to scroll internally. Zone A and Zone C scrolled away with the content.

2. **Previous Performance + Target were in a 2-column grid.** The UX spec shows both as full-width stacked cards with large typography. The original rendering used `grid-cols-2` with cramped, low-contrast mini-cards that looked like secondary supplementary info rather than primary data surfaces.

Additionally, several required UI elements were absent from the initial build:
- Previous Performance Card (present but wrong visual treatment)
- Target Card (present but wrong visual treatment)
- Read-only Sets Table (present, correct)
- Sticky Bottom Input Bar (present but not truly sticky)
- Progress Bar (present)
- Active Set selection (present)

---

## What Changed

### Layout fix — sticky zones now work

**Old approach:**
```tsx
<div className="flex h-[calc(100dvh-112px)] flex-col overflow-hidden bg-[#0a0a0a]">
```

**New approach:**
```tsx
<div
  className="flex flex-col overflow-hidden bg-[#0a0a0a]"
  style={{ height: 'calc(100dvh - 112px - env(safe-area-inset-bottom, 0px))' }}
>
```

The inline style mirrors exactly what AppShell's `main` already accounts for:
- `100dvh` — full viewport height
- `- 48px` — fixed header (`h-12`)
- `- 64px` — bottom nav (the non-safe-area part of `paddingBottom`)
- `- env(safe-area-inset-bottom, 0px)` — safe area portion of `paddingBottom`

This makes the component fill `main`'s content area with pixel precision. Since `main`'s content height exactly equals the component height, `main` never needs to scroll. Zone A (`flex-none` at top) and Zone C (`flex-none` at bottom) are truly fixed. Zone B (`flex-1 overflow-y-auto`) is the only thing that scrolls.

Key detail: the safe area subtraction was missing from the Tailwind class in the original — Tailwind's JIT mode does not support `env()` inside `calc()` in arbitrary class values, so the inline style is necessary.

### Previous Performance Card — full width, prominent typography

**Before:** `grid grid-cols-2 gap-3` — small, cramped, equal visual weight to Target card

**After:**
```tsx
<div className="rounded-2xl border border-[rgba(170,255,0,0.15)] bg-[rgba(170,255,0,0.05)] px-4 py-3.5">
  <p className="text-[10px]...">Last session · Jun 14</p>
  <p className="mt-1 text-[20px] font-black...">60 kg × 8</p>
  <p className="mt-1 text-[12px]...">3 sets completed</p>
  <span className="...text-[#aaff00]">PR</span>  {/* top-right badge */}
</div>
```

Accent green tinted border and background make it visually distinct as the primary reference card. 20px font-black for the core value.

### Target Card — full width, stacked below performance card

**After:**
```tsx
<div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-4 py-3.5">
  <p className="text-[10px]...">Today's target</p>
  <p className="text-[18px] font-black...">{totalSets} sets × {ex.reps ?? '—'} reps</p>
  <p className="text-[12px]...">{ex.restSec}s rest</p>
</div>
```

Subtle white tint background, neutral border — clearly secondary to the Previous Performance card.

### Zone C — unchanged interaction, now actually sticks

Zone C is `flex-none` at the bottom of the fixed-height flex container, so it always occupies the last part of the screen. The input controls, CTA, and nav buttons are all identical to the original W3A, just now correctly pinned at the bottom.

---

## Files Modified

| File | Change |
|---|---|
| `components/workouts/session/views/active-workout-view.tsx` | Layout fix (inline style height), full-width card redesign, Zone A/B/C retained |

---

## Files Created

| File | Description |
|---|---|
| `docs/reports/2026-06-29-2340-session-engine-sprint-w3a-revision.md` | This report |

---

## No Functionality Changes

All interaction logic from W3A is retained unchanged:
- Tap-to-select set rows
- Weight/reps [−] / [+] controls
- "Complete Set N" CTA with auto-advance
- "Finish Workout" CTA when all sets done → `setStatus('finishing')`
- Exercise nav buttons (disabled, W4 placeholder)
- Pause button → `setStatus('paused')`

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
- **ESLint:** Not run — pending approval per project convention
- **Production Build:** Not run — pending approval per project convention

---

## Testing Checklist

- [ ] Zone A (session header) is visible and does NOT scroll away when Zone B is scrolled
- [ ] Zone C (input bar) is visible and does NOT scroll away when Zone B is scrolled
- [ ] Previous Performance card is full-width with green-tinted border and large typography
- [ ] Target card is full-width, stacked below Previous Performance card
- [ ] Tapping a set row highlights it (accent bar, green set number, green dot)
- [ ] Tapping a different row moves the highlight
- [ ] "Complete Set N" marks row done (checkmark), auto-advances to next uncompleted set
- [ ] After all sets done: CTA shows "Finish Workout" in accent ghost style
- [ ] "Finish Workout" calls `setStatus('finishing')`
- [ ] Weight [−] decrements 2.5 kg (min 0); [+] increments 2.5 kg
- [ ] Reps [−] decrements 1 (min 1); [+] increments 1 (max 50)
- [ ] Whole-number weights display without decimal (e.g. `60` not `60.0`)
- [ ] Fractional weights display with one decimal (e.g. `62.5`)
- [ ] Pause button (Zone A) triggers `PauseOverlay`
- [ ] Progress bar at 0% (expected — locked on exercise 0 in W3A)
- [ ] Exercise nav buttons are visible but disabled
