# Dashboard V2 — Sprint 2B Report

**Date:** 2026-06-29
**Scope:** Visual polish — HeroSection · TodayWorkoutCard · Motion audit · Design consistency
**Build:** Pending approval (not auto-run per sprint instructions)

---

## Summary

Sprint 2B is a pure visual polish pass over the two top-of-dashboard sections produced in Sprint 2A. No new Supabase queries, no new data shapes, no new functionality. Every change is presentational: spacing, colour, motion, hierarchy, and naming.

Two files modified: `hero-section.tsx` and `today-section.tsx`. No messages changes. No other section files touched.

---

## Design Improvements

### HeroSection

| Area | Before | After |
|---|---|---|
| Avatar glow | `absolute inset-0 blur-lg opacity-20` — glow clipped inside div | `absolute -inset-2 blur-xl opacity-[0.12]` — glow extends 8 px beyond ring |
| Avatar ring | `border-[rgba(170,255,0,0.4)]` only | Added `box-shadow: 0 0 24px rgba(170,255,0,0.14)` for depth |
| Avatar initial | `text-[22px]` | `text-[23px] leading-none` — tighter baseline |
| Date label | `text-[11px] font-medium text-[#3a3a3a]` | `text-[10px] font-semibold uppercase tracking-widest text-[#444444]` — matches SectionHeader style |
| Greeting | `text-[21px] font-black` | `text-[22px] font-black tracking-tight` |
| First name | Same white as greeting | `text-[#aaff00]` accent — creates visual anchor |
| Avatar/greeting gap | `mb-4` | `mb-5` — more breathing room before badges |
| Badge order | Goal → Streak | **Streak → Goal** (per brief) |
| Streak badge | Single span: `— day streak` grey | Three-part: flame icon + `—` in `#fb923c` (orange) + "day streak" in `#555555` — value is visually distinct from label |
| Goal badge | `px-2.5 py-1` | `px-3 py-1` — consistent padding with streak badge |
| Motivational banner | No `backdrop-blur` | `backdrop-blur-sm` + `overflow-hidden` — glass finish |
| Banner text | `text-[13px] text-[#aaff00]/80` | `text-[12.5px] text-[#aaff00]/65` — slightly smaller and more muted; less dominant than the greeting |
| Banner icon gap | `gap-2.5` | `gap-3` |
| Top padding | `pt-5` | `pt-6` — more generous top breathing room |
| Badge row bottom margin | `mb-3` | `mb-4` |
| Animation delays | 0 / 0.12 / 0.22 | **0 / 0.10 / 0.20** — tighter stagger, snappier feel |

### TodayWorkoutCard

| Area | Before | After |
|---|---|---|
| Icon containers | No-schedule: `h-10 w-10 size={18}` · Rest: `h-10 w-10 size={18}` · Workout: `h-11 w-11 size={20}` | **All states: `h-11 w-11 size={20}`** — consistent across all card variants |
| Icon bg (workout) | `${color}22` | `${color}1e` — very slightly more transparent, reduces heaviness |
| Card padding (workout) | `py-4` | **`py-5`** — more breathing room |
| Difficulty badge | "Easy / Medium / Hard" text labels | **`{min} min` factual label** — colour-coded (green/orange/red) without ability-level judgement; removes presumptuous wording |
| Detail row | `exerciseCount · duration min` | **`exerciseCount` only** — duration is now shown exclusively in the top-right badge, eliminating redundancy |
| Muscle chips | `border-[rgba(255,255,255,0.08)] text-[#555555]` — monochrome grey | **Tinted with split accent colour** — `bg: ${color}12`, `color: ${color}bb`, `border: ${color}28` — each split type shows its own colour family in chips |
| Muscle chips margin | `mt-3` | `mt-3.5` |
| No-schedule state | CalendarRange icon only | Added **`ChevronRight size={16} opacity-40`** — navigation affordance |
| No-schedule icon | `h-10 w-10 CalendarRange size={18}` | `h-11 w-11 CalendarRange size={20}` |
| Rest day completed mark | `h-5 w-5 bg-[rgba(170,255,0,0.15)]` | `h-6 w-6 border-[rgba(170,255,0,0.3)] bg-[rgba(170,255,0,0.1)]` — larger, has a ring border |
| Rest day text | `text-[#888888]` | `text-[#777777]` — slightly more readable |
| CTA View Program | `border-[rgba(255,255,255,0.1)] font-bold text-[#777777] py-2.5` | `border-[rgba(255,255,255,0.1)] font-semibold text-[#666666] py-3 active:bg-[rgba(255,255,255,0.04)]` — taller tap target, tap feedback |
| CTA Start Workout | `<button> py-2.5 transition-opacity active:opacity-90` | **`<motion.button> whileTap={{ scale: 0.97 }} py-3`** — micro-interaction; taller tap target |

---

## Visual Decisions

**Duration instead of difficulty labels** — "Easy / Medium / Hard" implies ability level, which a duration alone cannot determine. `{min} min` is factual: the colour (green / orange / red) gives the quick visual signal the badge's position demands, while the number answers the actual user question ("how long is this workout?"). Removes the double-count with the detail row, which now shows only exercise count.

**Streak badge splits across three spans** — `<Flame /> — day streak` reads differently when `—` is in the flame's orange (`#fb923c`) vs the surrounding grey text. When real data arrives and the `—` becomes `14`, the number will already stand out visually without any code change.

**Name in accent colour** — Colouring only the first name (not the greeting prefix) creates a focal hierarchy: greeting word → accent name → emoji. It signals "this is personalised" without making the entire heading green.

**Date label matches SectionHeader** — `text-[10px] font-semibold uppercase tracking-widest text-[#444444]` is exactly the SectionHeader label style. This creates a single "meta" typographic token visible in two places, improving system coherence.

**Avatar outer glow via `-inset-2`** — The glow div must escape its parent's bounding box to produce a visible halo. `-inset-2` (Tailwind `inset: -8px`) places the glow 8 px outside the ring on all sides. The parent needs `relative` (already set) but not `overflow: hidden`, which was never applied.

**`motion.button` on Start Workout only** — The ghost "View Program" button is a secondary action; adding scale animation there would overstate its importance. The primary CTA gets the micro-interaction; the secondary stays static.

**`overflow-hidden` on motivational banner** — Ensures no content can visually bleed outside the `rounded-2xl` corners regardless of font size or emoji rendering differences across platforms.

**Muscle chip tinting** — Using the split's own accent colour for chips ties the chips visually to the split badge above them. Push (green) chips, Pull (blue) chips, Legs (red) chips. The chip opacity (`12` background, `bb` text, `28` border) keeps them clearly subordinate to the split badge, not competing with it.

---

## Motion Audit Results

All `motion.*` elements across both sections use `fadeUp` from `ui/animations.ts`:

| Component | Element | fadeUp delay |
|---|---|---|
| `HeroSection` | Avatar + greeting row | `0` |
| `HeroSection` | Badge pills | `0.10` |
| `HeroSection` | Motivational banner | `0.20` |
| `TodaySection` | Section wrapper | `0.05` |

Other sections (out of scope for 2B) were audited for compliance:

| Section | Compliance |
|---|---|
| `QuickStatsSection` | ✓ `fadeUp(0.10)` on section |
| `ProgressSection` | ✓ `fadeUp(0.15)` on section; macro bars use inline `motion.div` with `initial/animate/transition` directly (not `fadeUp`) — acceptable for bar fills |
| `RecentWorkoutSection` | ✓ `fadeUp(0.20)` on section |
| `QuickActionsSection` | ✓ `fadeUp(0.25)` on section; `DailyGoalCard` uses `{...fadeUp(delay)}`; `GoalRing` uses `motion.circle` for SVG stroke (not a section-entry animation — correct) |

No non-`fadeUp` section-entry animations found. Section delay ladder (0 → 0.05 → 0.10 → 0.15 → 0.20 → 0.25) is consistent and uniform across the dashboard.

---

## Design Consistency Audit

| Token | System rule | Status |
|---|---|---|
| Border radius (cards) | `rounded-2xl` (16 px) | ✓ Consistent across all states |
| Border radius (badges/chips) | `rounded-full` | ✓ Consistent |
| Border radius (icon containers) | `rounded-xl` (12 px) | ✓ All states now use `rounded-xl` |
| Card border | `rgba(255,255,255,0.06)` default · `rgba(170,255,0,0.2)` accent | ✓ |
| Card bg | `rgba(255,255,255,0.03)` default · `rgba(170,255,0,0.04)` accent | ✓ |
| Section padding | `px-5` on all sections | ✓ |
| Icon container size | `h-11 w-11` featured · `h-10 w-10` secondary | ✓ Standardised in TodayWorkoutCard |
| Icon size | `size={20}` in `h-11` containers · `size={18}` in `h-10` containers | ✓ |
| Primary text | `text-[#f5f5f5]` or `text-[#f0f0f0]` | ✓ |
| Secondary text | `text-[#555555]` | ✓ |
| Muted text | `text-[#444444]` or `text-[#3a3a3a]` | ✓ |
| Accent | `#aaff00` | ✓ |
| Accent muted | `text-[#aaff00]/65–80` | ✓ |
| Meta label style | `text-[10px] font-semibold uppercase tracking-widest text-[#444444]` | ✓ Now consistent between date label and SectionHeader |

---

## Remaining TODOs

- **Streak count** — `—` placeholder awaits `workout_sessions` aggregation (Sprint 3+)
- **`loading.tsx`** — `SkeletonCard` exists but dashboard loading page not yet created
- **`RecentWorkoutSection`** — Placeholder; needs `workout_sessions` data
- **`WeeklyStripSection`** — Planned in blueprint, not scaffolded
- **Hardcoded English strings** — "day streak", "View all", "+ Log weight", activity labels in `QuickActionsSection` still need i18n pass
- **`whileInView`** — Below-fold sections animate on mount; should use `whileInView + once: true` for proper scroll-triggered entry (Sprint 3 polish)
- **Stale Sprint 2A translation keys** — `difficultyEasy`, `difficultyMedium`, `difficultyHard` in all 3 locale files are now unused (replaced by the duration badge strategy); safe to remove in a future i18n cleanup pass
- **`widgets/` extraction** — Deferred until a second consumer exists for `TodayWorkoutCard`, `StatCard`, etc.

---

## Build Status

**Pending approval.** Build was not run automatically per sprint instructions.

Last verified clean build: Sprint 2A (0 errors · 0 warnings).

Changes in this sprint are additive style changes only:
- No new imports that weren't already available
- `ChevronRight` added to lucide-react import (already a project dependency)
- `motion.button` added to today-section (framer-motion already imported)
- No TypeScript type changes
- No message file changes

---

## Metrics

| Metric | Sprint 2A | Sprint 2B |
|---|---|---|
| `hero-section.tsx` lines | 97 | 98 |
| `today-section.tsx` lines | 201 | 203 |
| `motion.*` elements in Hero | 3 `motion.div` | 3 `motion.div` (unchanged) |
| `motion.*` elements in Today | 1 `motion.section` | 1 `motion.section` + 1 `motion.button` |
| Icon container sizes | 2 variants (h-10, h-11) | **1 variant (h-11)** across all Today states |
| Design token violations | 2 (inconsistent icon sizes, no outer glow) | 0 |
| Translation keys added | 4 (`viewProgram`, 3 difficulty) | 0 |
| Translation keys now unused | 0 | 3 (`difficultyEasy/Medium/Hard` — stale) |
| Animation stagger step | 0.12 s | **0.10 s** (tighter, snappier) |
