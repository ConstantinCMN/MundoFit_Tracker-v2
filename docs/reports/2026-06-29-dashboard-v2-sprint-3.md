# Dashboard V2 — Sprint 3 Report

**Date:** 2026-06-29
**Scope:** Quick Actions redesign · Quick Stats improvement · Recent Workout empty state · Design consistency audit
**Build:** Pending approval (not auto-run per sprint instructions)

---

## Summary

Sprint 3 completes the main dashboard experience. Three sections were redesigned using only data already available in the existing server data flow — no new Supabase queries, no new tables, no schema changes.

**Quick Actions** — Replaced the old 4-button row (Weight / Progress / Workout / Nutrition) with four premium vertical cards linking to Body Hub, Workout Generator, Measurements, and Workout History. Each card has a large coloured icon container, title, and short description.

**Quick Stats** — Swapped the Goal card (goal is already visible in the Hero badge) for a Calories card showing the user's TDEE. TDEE was already computed in `ProgressSection`; this adds the same computation to `QuickStatsSection` using existing profile fields — no new data.

**Recent Workout** — Replaced the minimal placeholder with a polished empty state: glow icon container, two-line explainer copy, `motion.button` CTA with `ArrowRight`. Translation keys added to all 3 locales so the section is fully i18n.

**Design consistency** — `DailyGoalCard` label text aligned with the rest of the system (`#cccccc` vs the prior `#bbbbbb`); target text size increased from `text-[9px]` to `text-[10px]`.

---

## Files Modified

| File | Change |
|---|---|
| `components/dashboard/sections/quick-actions-section.tsx` | Replaced 4-button grid with 4 premium vertical cards; updated icon imports; fixed `DailyGoalCard` typography |
| `components/dashboard/sections/quick-stats-section.tsx` | Added TDEE/Calories card (accent); removed Goal card; added `calculateTDEE` + `Gender` imports; removed unused `Goal` import |
| `components/dashboard/sections/recent-workout-section.tsx` | Full empty-state redesign; added `useTranslations`, `ArrowRight`, `motion` imports; section header from translation key |
| `messages/en.json` | Added 8 action keys + `recentWorkout` object (4 keys) |
| `messages/es.json` | Same additions in Spanish |
| `messages/ro.json` | Same additions in Romanian |

---

## Design Decisions

### Quick Actions — vertical card layout vs horizontal row

The old design was a 2×2 grid where each card showed `icon → label` horizontally. Scanning horizontally across 4 compact buttons is fast but gives no context — "Workout" alone doesn't tell you what action it performs.

The new design uses `flex-col` cards: icon on top, title below, description below that. This makes each card self-explanatory, improves scanability on small screens (each row is a clear unit), and creates a premium visual rhythm.

**Touch target size** — Cards use `p-4` with `gap-3` between icon block and text block. Effective tap area is the full card (~169 × ~116 px on 390px viewport), well above the 44 × 44 px minimum.

### Action destinations — Body Hub / Generator / Measurements / History

The old actions (Weight, Progress, Workout, Nutrition) were a mix of logging utilities and navigation shortcuts. The new set is navigation-focused — four high-value workout-related destinations:

| Action | Route | Reason |
|---|---|---|
| Body Hub | `/body` | Primary workout entry point; most likely first action |
| Workout Generator | `/workouts/generator` | Key feature; direct access without going through Body Hub |
| Measurements | `/measurements` | Body tracking; commonly accessed after workouts |
| Workout History | `/workouts/history` | Frequent review destination; no dedicated section for it yet on dashboard |

Nutrition and Weight were removed from actions since they exist in the navigation bar and are less core to the workout flow.

### Quick Stats — Calories replaces Goal

Goal is already prominently displayed in the Hero badge row. Showing it again in Quick Stats is redundant.

TDEE (calories/day) is more actionable and rarely displayed elsewhere with this prominence. It's computed from `weight_kg + height_cm + age + gender + activity_level` — all existing Profile fields — so no new data is required.

The Calories card uses the `accent` variant of `DashboardCard` (green border + bg) to give it visual priority over the other three stats. This matches its role as the most directly actionable number on the dashboard.

**Body Fat omitted** — `body_fat_pct` exists in the `measurements` table (not `profiles`). Displaying it would require an additional Supabase query, which is out of scope for Sprint 3. An honest `—` placeholder was not added since it would mislead users into thinking body fat is tracked but empty.

### Recent Workout — honest empty state

The previous placeholder used a very dark `#333333` Dumbbell icon that was barely visible against the dark card background, making the empty state feel broken rather than designed.

The new empty state:
- Icon container uses `rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]` — a glass-style tile matching the card vocabulary
- Soft purple glow (`#c084fc` at 5% opacity) — subtly indicates this is a workout-related section without being intrusive
- `Dumbbell size={24} strokeWidth={1.5}` — thinner stroke reads as "outline/waiting" rather than "active/filled"
- Text hierarchy: primary label (`#555555`) + hint copy (`#3a3a3a`, max-width constrained to 220 px to prevent wide line lengths)
- `motion.button whileTap` CTA with `ArrowRight` — gives the empty state a clear next action with tactile feedback

### DailyGoalCard typography fix

`text-[#bbbbbb]` for the label and `text-[9px]` for the target were the only two spots in the entire dashboard using these values:

| Token | Affected element | Before | After | Reason |
|---|---|---|---|---|
| Label colour | `DailyGoalCard` label | `#bbbbbb` | `#cccccc` | Aligns with other card label colours across the dashboard |
| Target text size | `DailyGoalCard` target | `text-[9px]` | `text-[10px]` | `9px` is below the readable threshold on high-density screens; `10px` is the system minimum |

---

## Design Consistency Audit Results

| Area | Status | Notes |
|---|---|---|
| Section padding | ✓ All `px-5` | |
| Card border radius | ✓ All `rounded-2xl` (cards) / `rounded-xl` (icon containers) / `rounded-full` (chips/badges) | |
| Card border | ✓ `rgba(255,255,255,0.06)` default · `rgba(170,255,0,0.2)` accent | |
| Icon container size | ✓ `h-11 w-11 size={20}` for featured; `h-9 w-9 size={18}` for secondary (DailyGoalCard has fixed SVG size — acceptable) | |
| Section entry animation | ✓ All sections use `fadeUp` helper | |
| Section delay ladder | ✓ 0 / 0.05 / 0.10 / 0.15 / 0.20 / 0.25 | |
| `whileTap` on interactive buttons | ✓ All primary CTAs now have `whileTap={{ scale: 0.97 }}` | |
| CTA button style (accent) | ✓ `border-[rgba(170,255,0,0.2)] bg-[rgba(170,255,0,0.05)] text-[#aaff00]` | |
| Section header label colour | ✓ `text-[#444444]` | |
| Meta label in cards | ✓ `text-[#555555] uppercase tracking-widest` | |
| Primary text | ✓ `#f5f5f5` / `#f0f0f0` / `#cccccc` (descending hierarchy) | |
| Secondary text | ✓ `#555555` | |
| Muted / hint text | ✓ `#3a3a3a` | |
| DailyGoalCard label | ✓ Fixed → `#cccccc` | Was `#bbbbbb` |
| DailyGoalCard target size | ✓ Fixed → `text-[10px]` | Was `text-[9px]` |

**Remaining known inconsistency**: Activity labels in `QuickStatsSection` are hardcoded English strings. These are flagged but not fixed here — they belong to a dedicated i18n pass, not a visual polish sprint.

---

## Remaining TODOs

- **`loading.tsx`** — `SkeletonCard` exists but `app/[locale]/(app)/dashboard/loading.tsx` not yet created
- **`RecentWorkoutSection` real data** — Full implementation requires `workout_sessions` query (Sprint 4+)
- **`WeeklyStripSection`** — Planned in blueprint, not yet scaffolded
- **`whileInView`** — Sections below first viewport should use `whileInView + once: true`
- **i18n pass** — Activity labels in `QuickStatsSection`, "day streak", "View all", "kcal" unit labels, "Daily Target" chip still hardcoded in English
- **Stale translation keys** — `difficultyEasy/Medium/Hard` (en/es/ro) and `updateWeight/viewProgress/startWorkout/nutrition` in `dashboard.actions` are no longer used in components; safe to remove in cleanup pass
- **`widgets/` extraction** — `StatCard`, `DailyGoalCard`, `GoalRing` each have one consumer; extraction deferred until second consumer appears
- **TDEE deduplication** — `QuickStatsSection`, `ProgressSection`, and `QuickActionsSection` each compute TDEE independently; a shared `useDashboardDerivedStats` hook is warranted once Sprint 4+ adds more derived-value consumers

---

## Build Status

**Pending approval.** Build was not run automatically per sprint instructions.

Changes expected to be clean:
- All new translation keys added to all 3 locale files before component usage
- `calculateTDEE` and `Gender` already existed in the project; imports are additive
- `ArrowRight`, `Zap`, `Ruler`, `History` verified present in the installed version of `lucide-react`
- No TypeScript type changes; no schema changes; no server action changes

---

## Metrics

| Metric | Sprint 2B baseline | Sprint 3 |
|---|---|---|
| `quick-actions-section.tsx` lines | 195 | 187 |
| `quick-stats-section.tsx` lines | 138 | 118 |
| `recent-workout-section.tsx` lines | 38 | 52 |
| Dashboard sections complete | 4/6 (Hero, Today, Quick Stats, Progress) | **6/6** |
| Sections with real calculated data | 4 | **5** (TDEE now in Quick Stats) |
| Sections with i18n section headers | 5/6 | **6/6** (Recent Workout header now translated) |
| Translation keys added this sprint | 0 | **12** (8 action + 4 recentWorkout) |
| `whileTap` micro-interactions | 2 (Today Start CTA, Quick Stats void) | **5** (+ Generator, Measurements, History, Recent CTA, all action cards) |
| Hardcoded English section headers | 1 (Recent Workouts) | **0** |
