# Exercise Library — Biceps (Complete)

**Date:** 2026-07-04 14:22
**Task:** Build out the complete biceps exercise library in a single sprint, covering barbell, EZ bar, dumbbell, cable, machine, and bodyweight variations across unilateral/bilateral and supinated/neutral/reverse-grip patterns.

---

## Summary

Created `data/exercises/biceps.ts` with 18 production-ready biceps exercises, matching every named variation requested (Barbell Curl, EZ Bar Curl, Dumbbell Curl, Alternating Dumbbell Curl, Incline Dumbbell Curl, Hammer Curl, Cross-Body Hammer Curl, Concentration Curl, Preacher Curl, Machine Preacher Curl, Cable Curl, Bayesian Cable Curl, High Cable Curl, Spider Curl, Drag Curl, Reverse Curl, Chin-Up (Biceps Emphasis), Machine Bicep Curl). Wired the new file into `data/exercises/index.ts` alongside the existing chest/back/shoulders modules. No existing exercise entries (chest, back, or shoulders) were modified.

## Exercises Added (18)

| # | Slug | Equipment | Grip | Type |
|---|------|-----------|------|------|
| 1 | `barbell-curl` | barbell | supinated | bilateral, compound-adjacent isolation |
| 2 | `ez-bar-curl` | EZ bar | supinated (angled) | bilateral |
| 3 | `dumbbell-curl` | dumbbells | supinated | bilateral |
| 4 | `alternating-dumbbell-curl` | dumbbells | supinated | unilateral (alternating) |
| 5 | `incline-dumbbell-curl` | dumbbells, bench | supinated | bilateral, long-head stretch |
| 6 | `hammer-curl` | dumbbells | neutral | bilateral |
| 7 | `cross-body-hammer-curl` | dumbbells | neutral | unilateral |
| 8 | `concentration-curl` | dumbbells, bench | supinated | unilateral |
| 9 | `preacher-curl` | EZ bar, preacher bench | supinated | bilateral |
| 10 | `machine-preacher-curl` | machine | supinated (fixed) | bilateral |
| 11 | `cable-curl` | cable machine | supinated | bilateral |
| 12 | `bayesian-cable-curl` | cable machine | supinated | unilateral, stretch-loaded |
| 13 | `high-cable-curl` | cable machine | supinated | bilateral, peak-contraction |
| 14 | `spider-curl` | EZ bar, bench | supinated | bilateral, chest-supported |
| 15 | `drag-curl` | barbell | supinated | bilateral |
| 16 | `reverse-curl` | barbell | reverse/pronated | bilateral |
| 17 | `chin-up` | pull-up bar | supinated | bilateral, compound bodyweight |
| 18 | `machine-bicep-curl` | machine | fixed | bilateral |

Coverage confirms all requested dimensions: barbell, EZ bar, dumbbells, cable, machine, and bodyweight equipment; unilateral (alternating curl, cross-body hammer, concentration curl, Bayesian cable curl) and bilateral movements; supinated (majority), neutral (hammer variations), and reverse/pronated grip (reverse curl).

## Total Biceps Exercises

**18** (all new — this is the first biceps batch; prior groups were chest, back, shoulders only).

## Files Modified

- **Created:** `data/exercises/biceps.ts` (18 entries)
- **Modified:** `data/exercises/index.ts` — added `bicepsExercises` import, spread into `allExercises`, and named export (append-only edit; existing `chestExercises` / `backExercises` / `shouldersExercises` lines untouched)
- **Not touched:** `data/exercises/chest.ts`, `data/exercises/back.ts`, `data/exercises/shoulders.ts`

## Validation Results

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
  - Caught and fixed one bug during authoring: an unescaped apostrophe in a `tips_en` string (`the machine's fixed path`) that broke the string literal — corrected to `machine\'s`.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 80/80 entries valid, 0 invalid.
  - Total exercise count is now 80 (47 chest/back + 15 shoulders + 18 biceps).

## Duplicate Check

- **Within biceps.ts:** No duplicate slugs among the 18 new entries.
- **Global (across chest/back/shoulders/biceps):** No duplicate slugs anywhere in `allExercises` (80 unique slugs for 80 entries).
- Slug names were checked against back.ts's existing pull-up variants (`pull-up`, `assisted-pull-up`) before adding `chin-up` — distinct exercise (supinated grip, biceps-focused) with no naming collision.

## Remaining Recommendations

- **Equipment tags introduced:** `EZ bar`, `preacher bench` are new equipment strings (schema allows free-form strings, no enum constraint) — recommend confirming these match any equipment-filter UI/dropdown values elsewhere in the app before user-facing release.
- **Triceps and forearms** are the natural next arm-group batches to complete the "arms" region (the `index.ts` stub previously named this group `arms`; it was replaced with a dedicated `biceps` module per the sprint's explicit "Biceps library" scope — a symmetrical `triceps.ts` and/or `forearms.ts` should follow the same one-file-per-muscle-group convention).
- Legs, core, and cardio groups remain stubbed in `data/exercises/index.ts`.
- Placeholder `hero_image_url` / `demo_image_url` / `video_url` / `muscle_map_id` values need real assets before production seeding (same open item as prior batches).
- Seeding into Supabase itself was not run (requires `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`); validation was confirmed via a standalone script invoking `validateSeedBatch` directly, then removed.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
