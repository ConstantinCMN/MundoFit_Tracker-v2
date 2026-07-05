# Exercise Library — Legs Part 2 (Hamstrings, Calves, Posterior Chain)

**Date:** 2026-07-04 17:41
**Task:** Complete the legs exercise library by adding hamstring, calf, and posterior-chain/glute exercises. No additional quadriceps-focused work was added, per instructions.

---

## Summary

Appended 21 production-ready exercises to the end of `data/exercises/legs.ts`, after the 20 quadriceps/glute/compound entries from Part 1. All entries are real-world, commonly used movements matching the brief's named list exactly (no invented variations). `data/exercises/index.ts` required no changes — `legsExercises` was already wired in from Part 1, so this batch is a pure append to the existing file.

## Exercises Added (21)

**Hamstrings (10):**

| # | Slug | Equipment | Pattern |
|---|------|-----------|---------|
| 1 | `romanian-deadlift` | barbell | hinge |
| 2 | `stiff-leg-deadlift` | barbell | hinge (from floor) |
| 3 | `single-leg-romanian-deadlift` | dumbbells | hinge (unilateral) |
| 4 | `good-morning` | barbell, power rack | hinge |
| 5 | `lying-leg-curl` | machine | isolation |
| 6 | `seated-leg-curl` | machine | isolation |
| 7 | `standing-leg-curl` | machine | isolation (unilateral) |
| 8 | `nordic-curl` | bodyweight | isolation (eccentric) |
| 9 | `glute-ham-raise` | glute ham developer | hinge/compound |
| 10 | `stability-ball-leg-curl` | stability ball | isolation |

**Glutes / Posterior Chain (5):**

| # | Slug | Equipment | Pattern |
|---|------|-----------|---------|
| 11 | `hip-thrust` | dumbbells, bench | hinge |
| 12 | `barbell-hip-thrust` | barbell, bench | hinge (heavy progression) |
| 13 | `glute-bridge` | bodyweight | hinge |
| 14 | `single-leg-glute-bridge` | bodyweight | hinge (unilateral) |
| 15 | `cable-pull-through` | cable machine | hinge |

**Calves (6):**

| # | Slug | Equipment | Pattern |
|---|------|-----------|---------|
| 16 | `standing-calf-raise` | machine | isolation |
| 17 | `seated-calf-raise` | machine | isolation (soleus emphasis) |
| 18 | `donkey-calf-raise` | machine | isolation |
| 19 | `leg-press-calf-raise` | machine | isolation |
| 20 | `single-leg-calf-raise` | bodyweight | isolation (unilateral) |
| 21 | `smith-machine-calf-raise` | smith machine | isolation |

All 21 named exercises from the brief are present under matching slugs. `hip-thrust` (dumbbell/bodyweight-loadable, bench-supported) and `barbell-hip-thrust` (heavy barbell progression) were deliberately differentiated as distinct real-world exercises rather than duplicated content, matching how gyms and programs distinguish the two.

## Total Leg Exercises

`data/exercises/legs.ts` now contains **41 exercises** total (20 from Part 1 + 21 from Part 2). Combined with all other muscle groups, `allExercises` totals **154**.

## Files Modified

- **Modified:** `data/exercises/legs.ts` — appended 21 new entries after the existing 20 Part 1 entries (append-only; Part 1 entries byte-identical)
- **Not touched:** `data/exercises/index.ts` (no change needed — `legsExercises` wiring already existed from Part 1), `data/exercises/chest.ts`, `data/exercises/back.ts`, `data/exercises/shoulders.ts`, `data/exercises/biceps.ts`, `data/exercises/triceps.ts`, `data/exercises/forearms.ts`

## Validation Results

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 154/154 entries valid, 0 invalid.

## Duplicate Check

- **Within legs.ts:** No duplicate slugs among all 41 entries (Part 1 + Part 2 combined).
- **Global (across all seven muscle-group files):** No duplicate slugs anywhere in `allExercises` (154 unique slugs for 154 entries).
- Confirmed no naming collisions between this batch's `hip-thrust` / `barbell-hip-thrust` / `glute-bridge` / `single-leg-glute-bridge` and Part 1's glute-tagged exercises (`bulgarian-split-squat`, `walking-lunge`, etc.) — distinct movement families and distinct slugs.

## Production Readiness

- **Data completeness:** Every entry has all required fields populated — tri-lingual name/description/instructions/mistakes/tips, aliases, keywords, equipment, difficulty, category, movement pattern, location, and `muscle_map_id`.
- **Not yet production-ready:** placeholder `hero_image_url` / `demo_image_url` / `video_url` values (following the established `https://placeholder.mundofit.app/...` convention) and `muscle_map_id` values (`hamstrings-primary`, `glutes-primary`, `calves-primary`) need real media assets and confirmed body-map IDs before going live, consistent with every prior batch in this sprint series.
- **New equipment tags introduced:** `glute ham developer`, `stability ball` — free-form strings (schema has no equipment enum), consistent with prior batches' `smith machine` / `belt squat machine` additions. Recommend a pass to confirm all introduced equipment tags across the full exercise library match the equipment-filter UI/dropdown values before user-facing release.
- **Muscle group coverage:** the legs region now spans `quadriceps`, `glutes`, `hamstrings`, and `calves` as distinct `muscle_groups` values (plus `core`/`adductors` as secondary muscles), completing the granular tagging approach started in Part 1 rather than falling back to a generic `legs` tag.
- **Database seeding:** not run in this task (requires `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`); Zod validation was confirmed via a standalone script invoking `validateSeedBatch` directly against the full seed set, then removed.
- **Remaining stubs:** only `core` and `cardio` muscle groups remain commented out in `data/exercises/index.ts` — the legs library (quadriceps + glutes + hamstrings + calves) is now considered complete per this two-part sprint.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
