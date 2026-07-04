# Dashboard V2 — Sprint 1 Report

**Date:** 2026-06-29
**Scope:** Body Hub cleanup · Build fixes · Dashboard V2 foundation

---

## Summary

Three sequential workstreams were completed in this session.

**1. Body Hub Module Cleanup**
A full code review of the Body Hub module was conducted, identifying four correctness issues. All four were applied as a minimal cleanup commit:
- Dead `anatomy-client.tsx` removed
- Hardcoded Romanian UI strings replaced with `next-intl` translations (two new keys added to all three locales)
- `scheduleDay` URL parameter wrapped in `encodeURIComponent`
- `<BodyHubClient />` wrapped in `<Suspense>` in `body/page.tsx` to satisfy Next.js App Router requirements for `useSearchParams`

**2. Build Fixes**
Three ESLint/build errors unrelated to the Body Hub were resolved:
- `<a href="/">` in `app/not-found.tsx` replaced with Next.js `<Link>`
- Unused `locale` destructure removed from `SignOutButton` and `LogFormClient` props
- Unused `cn` import removed from `workouts-client.tsx`
Build passes clean with zero warnings after fixes.

**3. Dashboard V2 — Sprint 1 (Foundation)**
The 747-line monolithic `dashboard-client.tsx` was refactored into a structured folder hierarchy. No new data sources, server queries, or business logic were introduced. All existing functionality is preserved.

---

## Files Created

### `components/dashboard/` — new structure

| File | Description |
|---|---|
| `types.ts` | Shared `WeightEntry` type (extracted from monolith) |
| `ui/animations.ts` | `fadeUp()` helper — single source of truth for section entry animations |
| `ui/dashboard-card.tsx` | Base card surface primitive: border / bg / radius / backdrop-blur with `accent` variant |
| `ui/section-header.tsx` | Uppercase section label with optional action button |
| `ui/skeleton-card.tsx` | `animate-pulse` loading placeholder for future `loading.tsx` |
| `sections/hero-section.tsx` | Greeting, avatar glow, goal motivation banner |
| `sections/today-section.tsx` | Today's workout card (schedule-driven); contains `TodayWorkoutCard` |
| `sections/quick-stats-section.tsx` | Weight / BMI / Goal / Activity 2×2 grid; contains `StatCard` |
| `sections/progress-section.tsx` | TDEE + macro bars + weight sparkline; contains `MacroBar`, `WeightSparkline`, `getMacros` |
| `sections/recent-workout-section.tsx` | Sprint 1 placeholder — empty state with CTA to Body Hub |
| `sections/quick-actions-section.tsx` | Daily target rings + quick action grid; contains `GoalRing`, `DailyGoalCard` |

### `docs/reports/`
- `2026-06-29-dashboard-v2-sprint-1.md` — this file

---

## Files Modified

| File | Change |
|---|---|
| `components/dashboard/dashboard-client.tsx` | Replaced 747-line monolith with 35-line typed orchestrator |
| `app/[locale]/(app)/body/page.tsx` | Added `<Suspense>` wrapper around `<BodyHubClient />` |
| `components/body/body-hub-client.tsx` | Removed `MUSCLE_LABELS`; added `tm` translations; fixed `encodeURIComponent`; replaced Romanian label strings |
| `messages/en.json` | Added `body.lastSelectedLabel`, `body.musclesSelectedLabel` |
| `messages/es.json` | Added `body.lastSelectedLabel`, `body.musclesSelectedLabel` |
| `messages/ro.json` | Added `body.lastSelectedLabel`, `body.musclesSelectedLabel` |
| `app/not-found.tsx` | `<a href="/">` → `<Link href="/">` from `next/link` |
| `components/auth/sign-out-button.tsx` | Removed unused `locale` destructure binding |
| `components/measurements/log-form-client.tsx` | Removed unused `locale` destructure binding |
| `components/workouts/workouts-client.tsx` | Removed unused `import { cn }` |

---

## Files Deleted

| File | Reason |
|---|---|
| `components/workouts/anatomy-client.tsx` | Dead code — `AnatomyClient` was never rendered; `workouts/anatomy/page.tsx` redirects to `/body` |

---

## Architecture Changes

### Dashboard folder structure (before → after)

**Before:**
```
components/dashboard/
  dashboard-client.tsx   (747 lines, all logic inline)
```

**After:**
```
components/dashboard/
  types.ts
  dashboard-client.tsx   (35 lines, orchestrator only)
  ui/
    animations.ts
    dashboard-card.tsx
    section-header.tsx
    skeleton-card.tsx
  sections/
    hero-section.tsx
    today-section.tsx
    quick-stats-section.tsx
    progress-section.tsx
    recent-workout-section.tsx
    quick-actions-section.tsx
  widgets/               (empty — reserved for Sprint 2+)
```

### Symbol redistribution

| Symbol | Was in | Now in |
|---|---|---|
| `fadeUp()` | `dashboard-client.tsx` | `ui/animations.ts` |
| `getMacros()` | `dashboard-client.tsx` | `sections/progress-section.tsx` |
| `WeightEntry` type | `dashboard-client.tsx` | `types.ts` |
| `StatCard` | `dashboard-client.tsx` | `sections/quick-stats-section.tsx` |
| `MacroBar` | `dashboard-client.tsx` | `sections/progress-section.tsx` |
| `WeightSparkline` | `dashboard-client.tsx` | `sections/progress-section.tsx` |
| `GoalRing` | `dashboard-client.tsx` | `sections/quick-actions-section.tsx` |
| `DailyGoalCard` | `dashboard-client.tsx` | `sections/quick-actions-section.tsx` |
| `TodayWorkoutCard` | `dashboard-client.tsx` | `sections/today-section.tsx` |

### Visual consistency improvements

- `DashboardCard` replaces the repeated `rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] backdrop-blur-sm` class string across all card surfaces
- `SectionHeader` standardises section labels at `text-[#444444]` (was `#3a3a3a` inline per section)
- Root container uses `space-y-7` instead of per-section `mb-7`
- All buttons now have explicit `type="button"` (missing on quick-action buttons and sparkline CTA in V1)

---

## Decisions Made

**`anatomy-client.tsx` deleted rather than kept** — The file was unreachable (its route redirects) and imported a context pattern (`MuscleSelectionContext`) the module had already abandoned. Keeping dead code creates confusion about intended architecture.

**Romanian strings replaced with translations rather than a new static map** — The `workouts.muscles` translation namespace already contained all 13 muscle names in en/es/ro. Using `useTranslations('workouts.muscles')` with an `as Parameters<typeof tm>[0]` cast is consistent with the pattern used in `muscle-detail-client.tsx`.

**`{}` empty destructure for unused `locale` prop** — The `_locale` prefix convention did not suppress the warning in Next.js's built-in ESLint config (`@typescript-eslint/no-unused-vars` without `argsIgnorePattern`). Omitting the binding while keeping the prop in the `Props` type is the cleanest solution: callers are unaffected, no linting workaround needed.

**`RecentWorkoutSection` added as a placeholder** — The blueprint calls for this section and the slot needs to exist in the hierarchy before Sprint 2 adds data. An honest empty-state CTA (linking to Body Hub) is better than a "coming soon" banner.

**Sub-components kept inline within their section files** — `StatCard`, `MacroBar`, `WeightSparkline`, `GoalRing`, `DailyGoalCard`, and `TodayWorkoutCard` were not moved to `widgets/`. Each is used by exactly one section. Extracting them now would be premature — they move to `widgets/` in Sprint 2 only if a second consumer appears.

**`TDEE` computed independently in `ProgressSection` and `QuickActionsSection`** — Both sections need TDEE but from different data paths. Lifting it to the orchestrator would mean passing it as a prop through `DashboardClient`, adding coupling with the server page. The calculation is cheap; the duplication is acceptable until a shared hook is warranted in Sprint 3+.

---

## Remaining TODOs

- **`widgets/` folder is empty** — `StatCard`, `MacroBar`, `WeightSparkline`, `GoalRing`, and `DailyGoalCard` should migrate here once a second consumer exists (Sprint 2+)
- **`app/[locale]/(app)/dashboard/loading.tsx`** — `SkeletonCard` exists but `loading.tsx` has not been created yet; needed before any navigation loading state is visible
- **`RecentWorkoutSection`** — requires `workout_sessions` + `session_sets` Supabase queries (Sprint 2)
- **`WeeklyStripSection`** — planned in blueprint, not yet scaffolded
- **`GoalsSection`** — requires `goals` table query (Sprint 2+)
- **Hardcoded English strings** — "Activity", "kcal / day", "Daily Target", "Sedentary / Light / Moderate…" activity labels carry over from V1; should be added to locale files in a future i18n pass
- **`whileInView` for below-fold sections** — currently all sections use `fadeUp` with staggered delays on mount; sections below the first viewport should use `whileInView` with `once: true` (Sprint 2 polish)
- **TDEE deduplication** — `ProgressSection` and `QuickActionsSection` both compute `calculateTDEE`; a shared `useDashboardDerivedStats` hook should consolidate this when a third consumer appears

---

## Known Issues

- **`StatCard` `accent` variant is unused** — the prop exists and is wired through `DashboardCard`, but no current call site passes `accent={true}` to `StatCard`. No functional impact.
- **SVG gradient `id="sparkGrad"`** — the sparkline SVG uses a fixed `id`. If multiple `WeightSparkline` instances ever appear on one page, the gradient definition would conflict. Currently only one instance exists; safe for now.
- **`GoalRing` always renders at `pct={0}`** — the ring animation fires to 0% since no actual daily progress is tracked yet. This is intentional for Sprint 1 (cosmetic placeholder).

---

## Build Status

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (67/67)
  0 errors · 0 warnings
```

---

## Notes

- `app/[locale]/(app)/dashboard/page.tsx` was not modified — the server data-fetching layer and prop contract are unchanged
- The `widgets/` directory is intentionally absent from git (no files yet); it will be created when the first widget is extracted in Sprint 2
- Sprint 2 target: add `workout_sessions` + `workout_schedule_days` queries, implement `StreakBadge`, `WeeklyHeatmap`, `StatPill`, and `RecentWorkoutsList`, and populate `RecentWorkoutSection`
