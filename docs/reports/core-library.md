# Exercise Library — Core (Complete)

**Date:** 2026-07-04 18:28
**Task:** Build out the complete core exercise library, covering rectus abdominis, obliques, transverse abdominis, anti-extension, anti-rotation, anti-lateral flexion, and stability work — favoring real-world, commonly used exercises over inventing variations.

---

## Summary

Created `data/exercises/core.ts` with 20 production-ready core exercises, matching every named movement from the brief exactly (Crunch, Reverse Crunch, Bicycle Crunch, Dead Bug, Hollow Hold, Plank, Side Plank, Bird Dog, Hanging Knee Raise, Hanging Leg Raise, Cable Crunch, Ab Wheel Rollout, Dragon Flag, Pallof Press, Mountain Climber, V-Up, Russian Twist, Toe Touch, Stability Ball Crunch, Stir the Pot). This activates the `core` module that was previously stubbed out (commented) in `data/exercises/index.ts`. No existing exercise entries in any other muscle group were modified.

## Exercises Added (20)

| # | Slug | Equipment | Focus | Pattern |
|---|------|-----------|-------|---------|
| 1 | `crunch` | bodyweight | rectus abdominis (flexion) | isolation |
| 2 | `reverse-crunch` | bodyweight | rectus abdominis, lower | isolation |
| 3 | `bicycle-crunch` | bodyweight | rectus abdominis + obliques | rotation |
| 4 | `dead-bug` | bodyweight | transverse abdominis, anti-extension | isolation |
| 5 | `hollow-hold` | bodyweight | rectus abdominis, anti-extension (static) | isolation |
| 6 | `plank` | bodyweight | transverse abdominis, anti-extension (static) | isolation |
| 7 | `side-plank` | bodyweight | obliques, anti-lateral flexion (static, unilateral) | isolation |
| 8 | `bird-dog` | bodyweight | anti-rotation, stability (unilateral) | isolation |
| 9 | `hanging-knee-raise` | pull-up bar | rectus abdominis, lower | isolation |
| 10 | `hanging-leg-raise` | pull-up bar | rectus abdominis, advanced | isolation |
| 11 | `cable-crunch` | cable machine | rectus abdominis, loaded | isolation |
| 12 | `ab-wheel-rollout` | ab wheel | anti-extension, whole-core | isolation |
| 13 | `dragon-flag` | bench | anti-extension, elite whole-core | isolation |
| 14 | `pallof-press` | cable machine | anti-rotation, obliques (unilateral) | rotation |
| 15 | `mountain-climber` | bodyweight | dynamic core stability | isolation |
| 16 | `v-up` | bodyweight | rectus abdominis, full-body | isolation |
| 17 | `russian-twist` | bodyweight | obliques, rotation | rotation |
| 18 | `toe-touch` | bodyweight | rectus abdominis, upper | isolation |
| 19 | `stability-ball-crunch` | stability ball | rectus abdominis, extended ROM | isolation |
| 20 | `stir-the-pot` | stability ball | anti-rotation + anti-extension, advanced | rotation |

Coverage confirms every requested focus area: rectus abdominis (crunch, reverse crunch, hanging knee/leg raise, cable crunch, v-up, toe touch, stability ball crunch), obliques (bicycle crunch, side plank, russian twist, pallof press), transverse abdominis (dead bug, plank), anti-extension (dead bug, hollow hold, plank, ab wheel rollout, dragon flag), anti-rotation (bird dog, pallof press, stir the pot), anti-lateral flexion (side plank), and stability (dead bug, bird dog, mountain climber, stir the pot).

## Total Core Exercises

**20** (all new — this is the first core batch; prior groups were chest, back, shoulders, biceps, triceps, forearms, legs).

## Files Modified

- **Created:** `data/exercises/core.ts` (20 entries)
- **Modified:** `data/exercises/index.ts` — activated the pre-existing (commented-out) `coreExercises` import, spread, and export; existing `chestExercises` / `backExercises` / `legsExercises` / `shouldersExercises` / `bicepsExercises` / `tricepsExercises` / `forearmsExercises` lines untouched
- **Not touched:** `data/exercises/chest.ts`, `data/exercises/back.ts`, `data/exercises/legs.ts`, `data/exercises/shoulders.ts`, `data/exercises/biceps.ts`, `data/exercises/triceps.ts`, `data/exercises/forearms.ts`

## Validation Results

- **TypeScript** (`npm run type-check`): ✅ Pass, no errors.
- **Zod** (`validateSeedBatch` against full `allExercises`): ✅ 174/174 entries valid, 0 invalid.
  - Total exercise count is now 174 (47 chest/back + 15 shoulders + 18 biceps + 18 triceps + 15 forearms + 41 legs + 20 core).

## Duplicate Check

- **Within core.ts:** No duplicate slugs, no duplicate keywords within any single exercise, no duplicate aliases within any single exercise, among all 20 new entries.
- **Global (across all eight muscle-group files):** No duplicate slugs anywhere in `allExercises` (174 unique slugs for 174 entries).
- Checked `dead-bug`, `plank`, `mountain-climber`, and `stir-the-pot` against every existing `movement_pattern`/`equipment` combination in the library before finalizing — no naming or content overlap with any prior batch.

## Production Readiness

- **Data completeness:** every entry has all required fields populated — tri-lingual name/description/instructions/mistakes/tips, aliases, keywords, equipment, difficulty, category, movement pattern, location, and `muscle_map_id`.
- **New taxonomy note:** all 20 entries use `muscle_groups: ['core']` as the primary tag (matching the file/stub name, consistent with the one-file-per-muscle-group convention), with `obliques` introduced as a `secondary_muscles` value for rotation/anti-rotation-focused entries (bicycle crunch, side plank, russian twist, pallof press, ab wheel rollout, stir the pot). This is a new secondary-muscle tag not previously used in the library — flagged for awareness, not a defect, consistent with the audit-plan pattern of calling out new vocabulary.
- **`category: 'core'` used for the first time:** the `_schema.ts` enum has included `'core'` as a valid `category` value since the schema was written, but no prior batch had used it. This batch applies it to the anti-extension/anti-rotation/anti-lateral-flexion/stability drills (dead bug, hollow hold, plank, side plank, bird dog, ab wheel rollout, dragon flag, pallof press, mountain climber, stir the pot) to distinguish them from straightforward spinal-flexion isolation movements (crunch-family exercises, which keep `category: 'isolation'`).
- **New equipment tag introduced:** `ab wheel` — a free-form string (schema has no equipment enum), consistent with prior batches' new-tag additions (`smith machine`, `belt squat machine`, `glute ham developer`, `stability ball`, `hand gripper`, `wrist roller`). Recommend the same equipment-filter UI/dropdown reconciliation pass already flagged in prior reports.
- **Not yet production-ready:** placeholder `hero_image_url` / `demo_image_url` / `video_url` values (following the established `https://placeholder.mundofit.app/...` convention) and `muscle_map_id` (`core-primary`) need real media assets and a confirmed body-map region before going live, consistent with every prior batch in this sprint series.
- **Database seeding:** not run in this task (per the separately-approved pre-beta migration plan, the live Supabase table is expected to be truncated and reseeded from `allExercises` before beta — this batch simply keeps the TypeScript source complete and ready for that reseed). Zod validation was confirmed via a standalone script invoking `validateSeedBatch` directly against the full 174-entry seed set, then removed.
- **Remaining stub:** only `cardio` remains commented out in `data/exercises/index.ts` — chest, back, shoulders, biceps, triceps, forearms, legs, and now core are all populated.

## Build Status

- **TypeScript:** ✅ Pass (`tsc --noEmit`, no errors)
- **ESLint:** Not run (no lint script invoked for this data-only change)
- **Production Build:** Not run (no build-affecting code changed; seed data only)
