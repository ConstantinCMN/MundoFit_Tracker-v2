# Dashboard V2 — Sprint 2A Report

**Date:** 2026-06-29
**Scope:** HeroSection polish · TodayWorkoutCard redesign · Build cleanup

---

## Summary

Sprint 2A continued directly from Sprint 1's folder structure. The focus was the top of the dashboard (Hero + Today sections), using only data already available — no new Supabase queries, tables, or API calls were introduced.

Three workstreams were completed:

**1. HeroSection — staggered animations + badge row**
The single animated `<motion.section>` was replaced with a non-animated `<section>` whose children each have independent `fadeUp` animations with increasing delays (0 → 0.12 → 0.22). A compact badge row was inserted between the greeting and motivational banner, showing a goal pill (derived from `profile.goal`) and a streak placeholder pill (flame icon, "— day streak").

**2. TodayWorkoutCard — premium redesign**
The workout-day state was restructured with four improvements: a larger workout name (15px → 15px font-black with tighter leading), a difficulty badge derived inline from `estimated_duration_min`, muscle group chips derived from `SPLIT_MUSCLE_MAP[split]` using existing `workouts.muscles` translations, and a dual-CTA row replacing the single full-width "Start Workout" button. The full-card click (`role="button"` wrapper) was removed in favour of the two explicit action buttons.

**3. Build cleanup**
Two pre-existing warnings from Sprint 1 (`Goal` and `DashboardCard` imported but unused in `quick-actions-section.tsx`) were fixed. Build now passes with zero errors and zero warnings.

---

## Files Modified

| File | Change |
|---|---|
| `components/dashboard/sections/hero-section.tsx` | Staggered child animations; added goal badge + streak placeholder badge; improved date typography |
| `components/dashboard/sections/today-section.tsx` | Restructured workout-day card: difficulty badge, muscle chips, dual CTA, cleaner visual hierarchy; extracted rest-day into its own JSX branch |
| `components/dashboard/sections/quick-actions-section.tsx` | Removed unused `Goal` and `DashboardCard` imports (Sprint 1 leftovers) |
| `messages/en.json` | Added `dashboard.todayWorkout.viewProgram`, `difficultyEasy`, `difficultyMedium`, `difficultyHard` |
| `messages/es.json` | Added same 4 keys (Spanish: "Ver programa", "Fácil", "Medio", "Difícil") |
| `messages/ro.json` | Added same 4 keys (Romanian: "Vezi programul", "Ușor", "Mediu", "Dificil") |

---

## Architecture Changes

### HeroSection — animation structure

**Before (Sprint 1):**
```tsx
<motion.section {...fadeUp(0)} className="px-5 pt-5">
  {/* avatar + greeting in same div */}
  {/* motivational banner */}
</motion.section>
```

**After (Sprint 2A):**
```tsx
<section className="px-5 pt-5">
  <motion.div {...fadeUp(0)}>    {/* avatar + greeting row */}    </motion.div>
  <motion.div {...fadeUp(0.12)}> {/* goal badge + streak badge */} </motion.div>
  <motion.div {...fadeUp(0.22)}> {/* motivational banner */}       </motion.div>
</section>
```

### TodayWorkoutCard — workout state layout

**Before (Sprint 1):**
```
[icon] [name + completed ✓]
       [SplitBadge · ex count · duration]
[Start Workout — full width]
```

**After (Sprint 2A):**
```
[icon] [name (font-black 15px)]  [difficulty badge]
       [SplitBadge · ex · dur]
[chest] [shoulders] [triceps]    ← muscle chips
[View Program (ghost)]  [Start Workout (accent)]
```

### Difficulty derivation (inline, no new query)

| Duration | Label | Color |
|---|---|---|
| `< 45 min` | Easy | `#34d399` (green) |
| `45–75 min` | Medium | `#fb923c` (orange) |
| `> 75 min` | Hard | `#f87171` (red) |
| `null` | `—` | `#555555` (muted) |

### Muscle groups derivation (inline, no new query)

```ts
// From SPLIT_MUSCLE_MAP in lib/workouts/split-types.ts
const muscles: MuscleId[] = isRest ? [] : SPLIT_MUSCLE_MAP[day.day_type as SplitType];
```

Muscle names translated via existing `useTranslations('workouts.muscles')` — no new translation keys added for muscle names.

---

## Decisions Made

**Streak badge shows `—` rather than `0`** — There is no `workout_sessions` data available in the current dashboard data flow. `0` would imply a real count; `—` correctly signals "not tracked yet" without misleading the user.

**Goal badge uses `goalLabel.*` keys (already existing) rather than new keys** — `dashboard.goalLabel.loseWeight` etc. were already defined and translated in Sprint 1. Reusing them avoids adding duplicate translations.

**Muscle chips capped at 4, not 3** — Splits like `upper` have 7 muscles; capping at 3 would show "+4 more", making the chip row feel truncated. 4 chips + "+N" hits the right density. `full` split shows all 5 without overflow.

**`DashboardCard` removed from `quick-actions-section.tsx` imports** — `DailyGoalCard` uses inline class strings rather than `<DashboardCard>`. Replacing them with `<DashboardCard>` would change the padding model (DashboardCard has no built-in padding). Removing the unused import is the minimal correct fix.

**Full-card click removed from workout-day state** — With a "View Program" explicit secondary CTA, the `role="button"` wrapper with `e.stopPropagation()` on the inner button was redundant and fragile. Explicit buttons are cleaner semantics.

**Rest day extracted to its own JSX branch** — Previously rest and workout states shared an outer `return`. Separating them makes each path self-contained and easier to modify independently.

---

## New Translation Keys

Four keys added under `dashboard.todayWorkout` in all three locale files:

| Key | EN | ES | RO |
|---|---|---|---|
| `viewProgram` | View Program | Ver programa | Vezi programul |
| `difficultyEasy` | Easy | Fácil | Ușor |
| `difficultyMedium` | Medium | Medio | Mediu |
| `difficultyHard` | Hard | Difícil | Dificil |

---

## Remaining TODOs

- **Streak data** — `— day streak` placeholder in `HeroSection` needs `workout_sessions` aggregation to show real count (Sprint 3+)
- **`loading.tsx`** — `SkeletonCard` UI primitive exists but `app/[locale]/(app)/dashboard/loading.tsx` has not been created
- **`RecentWorkoutSection`** — Still a placeholder; needs `workout_sessions` + `session_sets` queries
- **`WeeklyStripSection`** — Planned in blueprint, not yet scaffolded
- **`GoalsSection`** — Requires `goals` table (Sprint 3+)
- **Hardcoded English strings** — "— day streak", "View all", "+ Log weight", "kcal / day", "Daily Target", "No recent workouts" etc. carry over from V1; i18n pass planned for a future sprint
- **`whileInView`** — Below-fold sections still use mount-based `fadeUp`; should use `whileInView` with `once: true` (Sprint 3 polish)
- **`widgets/` extraction** — `StatCard`, `MacroBar`, `WeightSparkline`, `GoalRing`, `DailyGoalCard`, `TodayWorkoutCard` should move here once a second consumer exists

---

## Known Issues

- **SVG gradient `id="sparkGrad"`** — still a fixed `id` in `WeightSparkline`; safe while only one instance renders per page
- **`GoalRing` always at `pct={0}`** — intentional placeholder until daily progress tracking is implemented
- **`StatCard accent` variant unused** — prop wired through `DashboardCard` but no call site passes `accent={true}` to `StatCard`

---

## Build Status

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Generating static pages (67/67)
  0 errors · 0 warnings
```
