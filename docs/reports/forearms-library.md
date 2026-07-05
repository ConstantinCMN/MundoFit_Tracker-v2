# Exercise Library — Forearms (Complete)

**Date:** 2026-07-04 17:14
**Task:** Build out the complete forearms exercise library, favoring real-world, commonly used exercises over inventing obscure variations, covering wrist flexion/extension, reverse curl, hammer grip, pinch grip, static holds, farmer's carry, plate holds, wrist roller, cable/dumbbell/barbell variations, grip strength, and pronation/supination.

---

## Summary

Created `data/exercises/forearms.ts` with 15 production-ready forearm exercises — all standard, widely recognized movements (no invented variations added just to pad the count). Wired the new file into `data/exercises/index.ts` alongside the existing chest/back/shoulders/biceps/triceps modules. No existing exercise entries in any other muscle group were modified.

## Exercises Added (15)

| # | Slug | Equipment | Category Covered |
|---|------|-----------|-------------------|
| 1 | `barbell-wrist-curl` | barbell | wrist flexion |
| 2 | `reverse-barbell-wrist-curl` | barbell | wrist extension |
| 3 | `dumbbell-wrist-curl` | dumbbells | wrist flexion (unilateral) |
| 4 | `reverse-dumbbell-wrist-curl` | dumbbells | wrist extension (unilateral) |
| 5 | `behind-the-back-wrist-curl` | barbell | wrist flexion (standing, extended range) |
| 6 | `wrist-roller` | wrist roller | grip/forearm endurance |
| 7 | `farmers-carry` | dumbbells | farmer's carry, grip strength |
| 8 | `plate-pinch-hold` | weight plates | pinch grip, static hold |
| 9 | `reverse-ez-bar-curl` | EZ bar | reverse curl, pronation |
| 10 | `dumbbell-hammer-hold` | dumbbells | hammer grip, static hold |
| 11 | `towel-pull-up-hold` | pull-up bar, towel | grip strength, static hold |
| 12 | `cable-wrist-curl` | cable machine | wrist flexion, cable variation |
| 13 | `cable-reverse-wrist-curl` | cable machine | wrist extension, cable variation |
| 14 | `dumbbell-wrist-rotation` | dumbbells | pronation/supination |
| 15 | `hand-gripper-squeeze` | hand gripper | dedicated grip strength |

Coverage confirms every requested category: wrist flexion (1, 3, 5), wrist extension (2, 4), reverse curl (9), hammer grip (10), pinch grip (8), static holds (8, 10, 11), farmer's carry (7), plate holds (8), wrist roller (6), cable variations (12, 13), dumbbell variations (3, 4, 7, 10, 14), barbell variations (1, 2, 5), grip strength (7, 8, 11, 15), and pronation/supination (9, 14). All named examples from the brief are present under matching or equivalent slugs (e.g., "Reverse EZ Bar Curl" → `reverse-ez-bar-curl`; "Hammer Hold" → `dumbbell-hammer-hold`; "Wrist Rotation" → `dumbbell-wrist-rotation`).

## Total Forearm Exercises

**15** (all new — this is the first forearms batch; prior groups were chest, back, shoulders, biceps, triceps).

## Files Modified

- **Created:** `data/exercises/forearms.ts` (15 entries)
- **Modified:** `data/exercises/index.ts` — added `forearmsExercises` import, spread into `allExercises`, and named export (append-only edit; existing `chestExercises` / `backExercises` / `shouldersExercises` / `bicepsExercises` / `tricepsExercises` lines untouched)
- **Not touched:** `data/exercises/chest.ts`, `data/exercises/back.ts`, `data/exercises/shoulders.ts`, `data/exercises/biceps.ts`, `data/exercises/triceps.ts`

## Validation Results

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 113/113 entries valid, 0 invalid.
  - Total exercise count is now 113 (47 chest/back + 15 shoulders + 18 biceps + 18 triceps + 15 forearms).

## Duplicate Check

- **Within forearms.ts:** No duplicate slugs among the 15 new entries.
- **Global (across chest/back/shoulders/biceps/triceps/forearms):** No duplicate slugs anywhere in `allExercises` (113 unique slugs for 113 entries).
- Verified `reverse-ez-bar-curl` (forearm/brachioradialis-focused) does not collide with biceps.ts's `reverse-curl` (barbell, biceps-focused) — distinct slugs and distinct primary muscle group despite similar movement family.

## Remaining Recommendations

- **New equipment tags introduced:** `wrist roller`, `hand gripper`, `towel` — all free-form strings (schema has no equipment enum), but recommend confirming these match any equipment-filter UI/dropdown values before user-facing release, same as the `EZ bar` / `preacher bench` tags introduced in the biceps batch.
- This completes the "arms" region as three dedicated muscle-group files (biceps, triceps, forearms), consistent with the one-file-per-muscle-group convention established by chest/back/shoulders.
- Legs, core, and cardio groups remain stubbed in `data/exercises/index.ts`.
- Placeholder `hero_image_url` / `demo_image_url` / `video_url` / `muscle_map_id` values need real assets before production seeding (same open item as prior batches).
- Seeding into Supabase itself was not run (requires `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`); validation was confirmed via a standalone script invoking `validateSeedBatch` directly, then removed.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
