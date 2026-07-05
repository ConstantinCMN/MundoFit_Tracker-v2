# Exercise Library — Legs Part 1 (Quadriceps, Glutes, Compound Lower-Body)

**Date:** 2026-07-04 17:27
**Task:** Build the first half of the legs exercise library, focused on quadriceps, glutes, and compound lower-body movements. Hamstring and calf isolation work is explicitly deferred to Part 2.

---

## Summary

Created `data/exercises/legs.ts` with 20 production-ready leg exercises, all real-world, commonly used movements (no invented variations). This activates the `legs` module that was previously stubbed out (commented) in `data/exercises/index.ts`. No existing exercise entries in any other muscle group were modified.

## Exercises Added (20)

| # | Slug | Equipment | Primary Focus | Unilateral |
|---|------|-----------|----------------|------------|
| 1 | `back-squat` | barbell, power rack | quads + glutes | No |
| 2 | `front-squat` | barbell, power rack | quads | No |
| 3 | `goblet-squat` | dumbbells | quads | No |
| 4 | `hack-squat` (Barbell Hack Squat) | barbell | quads | No |
| 5 | `smith-machine-squat` | smith machine | quads + glutes | No |
| 6 | `leg-press` | machine | quads | No |
| 7 | `bulgarian-split-squat` | dumbbells, bench | glutes + quads | Yes |
| 8 | `walking-lunge` | dumbbells | glutes + quads | Yes |
| 9 | `reverse-lunge` | dumbbells | glutes + quads | Yes |
| 10 | `static-lunge` | dumbbells | glutes + quads | Yes |
| 11 | `step-up` | dumbbells, bench | glutes + quads | Yes |
| 12 | `box-step-up` | bodyweight | glutes + quads | Yes |
| 13 | `goblet-split-squat` | dumbbells | quads + glutes | Yes |
| 14 | `belt-squat` | belt squat machine | quads + glutes | No |
| 15 | `sissy-squat` | bodyweight | quads (isolation) | No |
| 16 | `zercher-squat` | barbell | quads + glutes | No |
| 17 | `cossack-squat` | bodyweight | glutes + quads | Yes |
| 18 | `machine-hack-squat` | machine | quads | No |
| 19 | `single-leg-press` | machine | quads | Yes |
| 20 | `curtsy-lunge` | dumbbells | glutes | Yes |

Coverage confirms every requested equipment category (barbell, dumbbells, smith machine, machine, bodyweight) and both bilateral (back squat, front squat, goblet squat, hack squat, smith machine squat, leg press, belt squat, sissy squat, zercher squat, machine hack squat) and unilateral (Bulgarian split squat, walking/reverse/static lunge, step-up, box step-up, goblet split squat, Cossack squat, single-leg press, curtsy lunge) patterns. All 19 explicitly named exercises from the brief are included, plus the optional Curtsy Lunge.

## Total Leg Exercises

**20** (all new — this is the first legs batch; the `legs` group was previously an empty stub in `index.ts`).

## Files Modified

- **Created:** `data/exercises/legs.ts` (20 entries)
- **Modified:** `data/exercises/index.ts` — activated the pre-existing (commented-out) `legsExercises` import, spread, and export; existing `chestExercises` / `backExercises` / `shouldersExercises` / `bicepsExercises` / `tricepsExercises` / `forearmsExercises` lines untouched
- **Not touched:** `data/exercises/chest.ts`, `data/exercises/back.ts`, `data/exercises/shoulders.ts`, `data/exercises/biceps.ts`, `data/exercises/triceps.ts`, `data/exercises/forearms.ts`

## Validation Results

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 133/133 entries valid, 0 invalid.
  - Total exercise count is now 133 (47 chest/back + 15 shoulders + 18 biceps + 18 triceps + 15 forearms + 20 legs).

## Duplicate Check

- **Within legs.ts:** No duplicate slugs among the 20 new entries. Deliberately verified `hack-squat` (Barbell Hack Squat, free-weight, behind-the-legs pattern) does not collide with `machine-hack-squat` (angled sled machine) — distinct equipment and distinct slugs despite the shared "hack squat" name.
- **Global (across chest/back/shoulders/biceps/triceps/forearms/legs):** No duplicate slugs anywhere in `allExercises` (133 unique slugs for 133 entries).

## Recommendations for Part 2

- **Hamstring isolation:** Romanian deadlift, lying leg curl, seated leg curl, nordic curl, glute-ham raise, single-leg RDL, stiff-leg deadlift.
- **Calf isolation:** standing calf raise, seated calf raise, leg press calf raise, donkey calf raise, single-leg calf raise.
- **New equipment tags introduced this batch** (`smith machine`, `belt squat machine`) are free-form strings (schema has no equipment enum) — recommend confirming these match any equipment-filter UI/dropdown values before user-facing release, consistent with prior batches' new-tag notes.
- **Muscle group granularity:** this batch used `quadriceps` / `glutes` (plus `hamstrings`/`core`/`adductors` as secondary muscles) rather than a generic `legs` tag, matching the existing plural convention already seen in `back.ts` secondary muscles (`glutes`, `hamstrings`). Part 2 should continue this granularity (`hamstrings`, `calves`) rather than introducing a catch-all `legs` muscle group.
- Legs is now the sixth populated muscle group; only core and cardio remain stubbed in `data/exercises/index.ts`.
- Placeholder `hero_image_url` / `demo_image_url` / `video_url` / `muscle_map_id` values need real assets before production seeding (same open item as prior batches).
- Seeding into Supabase itself was not run (requires `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`); validation was confirmed via a standalone script invoking `validateSeedBatch` directly, then removed.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
