# Dashboard V2 — Remove Daily Targets

**Date:** 2026-06-29
**Scope:** Delete Daily Targets section and all associated dead code
**Build:** Pending approval (not auto-run per instructions)

---

## Summary

The Daily Targets section (four animated rings showing Water / Kcal / Workout / Sleep) was removed from the dashboard. It was a placeholder with no real data behind it — all four rings rendered at `pct={0}` because the underlying progress data (water intake, workout completion, sleep tracking) does not exist in the current data model.

Removing it eliminated two internal components (`GoalRing`, `DailyGoalCard`), one `useMemo` computation (TDEE calculated solely for the Kcal ring target), several imports, and the `dailyGoals` translation namespace across all three locales.

The `QuickActionsSection` no longer receives a `profile` prop, since the only thing that required it was the TDEE calculation for the rings.

---

## Files Modified

| File | Change |
|---|---|
| `components/dashboard/sections/quick-actions-section.tsx` | Deleted `GoalRing`, `DailyGoalCard`, Daily Targets JSX block, `tdee` useMemo, profile prop and all dependent variables; removed `useMemo`, `ComponentType`, `Flame`, `Droplets`, `BedDouble`, `calculateTDEE`, `Gender`, `ActivityLevel`, `Profile` imports; changed section from `space-y-7 px-5` to `px-5` |
| `components/dashboard/dashboard-client.tsx` | Removed `profile={profile}` from `<QuickActionsSection />` callsite |
| `messages/en.json` | Deleted `dashboard.dailyGoals` block (7 keys); preceding `chart` closing brace updated from `},` to `}` |
| `messages/es.json` | Same — deleted `dashboard.dailyGoals` (Spanish) |
| `messages/ro.json` | Same — deleted `dashboard.dailyGoals` (Romanian) |

---

## Dead Code Removed

### Components

| Symbol | Type | Reason for removal |
|---|---|---|
| `GoalRing` | Internal component | Only consumed by `DailyGoalCard` |
| `DailyGoalCard` | Internal component | Only rendered in Daily Targets JSX |

### Imports (from `quick-actions-section.tsx`)

| Import | Source | Reason |
|---|---|---|
| `useMemo` | `react` | Used only for TDEE computation |
| `ComponentType` | `react` | Used only in `DailyGoalCard` prop type |
| `Flame` | `lucide-react` | Used only in DailyGoalCard Kcal instance |
| `Droplets` | `lucide-react` | Used only in DailyGoalCard Water instance |
| `BedDouble` | `lucide-react` | Used only in DailyGoalCard Sleep instance |
| `calculateTDEE` | `@/lib/utils/fitness` | Used only to compute Kcal ring target |
| `Profile` | `@/types` | Used only for `QuickActionsSectionProps` |
| `Gender` | `@/types` | Used only to cast `profile.gender` for TDEE |
| `ActivityLevel` | `@/types` | Used only to cast `profile.activity_level` for TDEE |

### Logic

| Symbol | Reason for removal |
|---|---|
| `QuickActionsSectionProps` type | `profile` prop is now gone; component takes no props |
| `weight`, `height`, `age`, `gender`, `activityLevel` variables | All fed only into `calculateTDEE` |
| `tdee` useMemo | Consumed only by DailyGoalCard Kcal target |

### Translation keys deleted (× 3 locales)

| Key | en value |
|---|---|
| `dashboard.dailyGoals.title` | "Daily Targets" |
| `dashboard.dailyGoals.water` | "Water" |
| `dashboard.dailyGoals.waterTarget` | "8 glasses" |
| `dashboard.dailyGoals.workout` | "Workout" |
| `dashboard.dailyGoals.workoutTarget` | "30 min" |
| `dashboard.dailyGoals.sleep` | "Sleep" |
| `dashboard.dailyGoals.sleepTarget` | "8 hrs" |

---

## Visual Balance

The dashboard section order after removal:

```
Hero
Today's Workout
Quick Stats
Progress (Calories + Weight Trend)
Recent Workouts
Quick Actions   ← now the final section
```

The `space-y-7` spacing between sections in `dashboard-client.tsx` already distributes vertical space evenly, so no additional bottom padding adjustment is needed. The Quick Actions grid (2×2 cards) terminates the page with a visually complete block.

The `pb-24` on the root container in `dashboard-client.tsx` ensures the last section clears the mobile nav bar, which is unchanged.

---

## Why Not Replace with Real Data?

The rings required: water intake, workout session completion, and sleep duration — none of which exist in the current data model (`profiles`, `weight_logs`, `workout_schedule_days`, `workout_sessions`). A placeholder at `pct={0}` across all four rings conveyed no information and consumed visible space.

Removing empty UI is preferred over keeping it as "coming soon" scaffolding. If daily tracking is added in a future sprint, the section can be reintroduced with real data.

---

## Build Status

**Pending approval.**

Changes expected to be clean:
- No imports of removed symbols remain in any file
- `dashboard-client.tsx` no longer passes `profile` to `QuickActionsSection`, which now takes no props
- `dailyGoals` key removed from all 3 locale files; no other file references it (verified by grep)
- `quick-actions-section.tsx` shrank from 229 → 67 lines
