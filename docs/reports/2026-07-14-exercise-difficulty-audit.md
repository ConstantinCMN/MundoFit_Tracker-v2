# Exercise Difficulty Audit

**Date:** 2026-07-14  
**Status:** Complete  
**Scope:** Read-only audit of difficulty distribution across the 194-exercise seed and current Supabase records.

## Executive Summary

The Advanced filter is sparse because the source data is sparse, not because Advanced records are hidden by a case-sensitivity or difficulty-mapping bug.

- Seed total: 194 exercises.
- Supabase total: 194 exercises.
- Seed vs Supabase slug comparison: 0 missing in either direction.
- Audited field mismatches by slug: 0 across `name_en`, `muscle_groups`, `equipment`, `difficulty`, `location`, `category`, `movement_pattern`, `exercise_type`, `is_unilateral`, and `gender_target`.
- Difficulty totals are identical in seed and Supabase: 88 Beginner, 77 Intermediate, 29 Advanced.
- `shoulders` has 15 exercises and 0 Advanced entries in both seed and Supabase.
- `calves` also has 0 Advanced entries.
- The UI difficulty values are correct lowercase enum values: `beginner`, `intermediate`, `advanced`.
- A separate UI muscle taxonomy mismatch exists: the Exercise Library muscle chips include legacy values like `abs`, `quads`, `lats`, `traps`, and `lower_back`, while seed primary muscle groups include `core`, `quadriceps`, `back`, and `cardio`.

No application code or exercise data was changed.

## Sources Inspected

- `data/exercises/index.ts`
- `data/exercises/_schema.ts`
- `data/exercises/*.ts`
- Current Supabase `exercises` records, read via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `types/database.ts`
- `supabase/migrations/20240101000000_initial_schema.sql`
- `lib/actions/exercises.ts`
- `lib/exercises/queries.ts`
- `lib/exercises/search.ts`
- `components/workouts/exercise-library-client.tsx`
- `messages/ro.json`
- `messages/en.json`
- `messages/es.json`
- `docs/reports/exercise-library-data-source.md`
- `docs/reports/exercise-library-seed-execution.md`
- `docs/reports/exercise-library-final-fixes.md`
- `docs/reports/exercise-library-final-qa.md`

## Exact Distribution Tables

### Seed Difficulty Totals

| beginner | intermediate | advanced | null |
| --- | ---: | ---: | ---: |
| 88 | 77 | 29 | 0 |

### Supabase Difficulty Totals

| beginner | intermediate | advanced | null |
| --- | ---: | ---: | ---: |
| 88 | 77 | 29 | 0 |

### Seed Muscle Groups by Difficulty

| muscle group | beginner | intermediate | advanced | null | total |
| --- | ---: | ---: | ---: | ---: | ---: |
| back | 9 | 8 | 3 | 0 | 20 |
| biceps | 10 | 5 | 3 | 0 | 18 |
| calves | 5 | 1 | 0 | 0 | 6 |
| cardio | 8 | 10 | 2 | 0 | 20 |
| chest | 8 | 14 | 5 | 0 | 27 |
| core | 9 | 7 | 4 | 0 | 20 |
| forearms | 10 | 4 | 1 | 0 | 15 |
| glutes | 9 | 7 | 3 | 0 | 19 |
| hamstrings | 4 | 2 | 4 | 0 | 10 |
| quadriceps | 8 | 7 | 4 | 0 | 19 |
| shoulders | 7 | 8 | 0 | 0 | 15 |
| triceps | 6 | 9 | 3 | 0 | 18 |

Supabase muscle-group counts are identical to the seed table.

### Seed Equipment by Difficulty

| equipment | beginner | intermediate | advanced | null | total |
| --- | ---: | ---: | ---: | ---: | ---: |
| ab wheel | 0 | 0 | 1 | 0 | 1 |
| assault bike | 0 | 1 | 0 | 0 | 1 |
| assisted pull-up machine | 1 | 0 | 0 | 0 | 1 |
| barbell | 3 | 22 | 8 | 0 | 33 |
| battle ropes | 0 | 1 | 0 | 0 | 1 |
| belt squat machine | 0 | 1 | 0 | 0 | 1 |
| bench | 10 | 18 | 5 | 0 | 33 |
| bicycle | 1 | 0 | 0 | 0 | 1 |
| bodyweight | 15 | 10 | 7 | 0 | 32 |
| cable machine | 13 | 12 | 1 | 0 | 26 |
| dumbbells | 23 | 16 | 3 | 0 | 42 |
| elliptical machine | 1 | 0 | 0 | 0 | 1 |
| EZ bar | 1 | 4 | 0 | 0 | 5 |
| glute ham developer | 0 | 0 | 1 | 0 | 1 |
| hand gripper | 1 | 0 | 0 | 0 | 1 |
| jump rope | 0 | 1 | 0 | 0 | 1 |
| landmine attachment | 0 | 4 | 0 | 0 | 4 |
| machine | 17 | 2 | 0 | 0 | 19 |
| parallel bars | 0 | 0 | 2 | 0 | 2 |
| pool | 0 | 1 | 0 | 0 | 1 |
| power rack | 0 | 2 | 2 | 0 | 4 |
| preacher bench | 0 | 1 | 0 | 0 | 1 |
| pull-up bar | 1 | 1 | 4 | 0 | 6 |
| resistance band | 1 | 0 | 0 | 0 | 1 |
| rowing machine | 0 | 1 | 0 | 0 | 1 |
| ski erg machine | 0 | 1 | 0 | 0 | 1 |
| smith machine | 2 | 0 | 0 | 0 | 2 |
| stability ball | 2 | 0 | 1 | 0 | 3 |
| stair climber machine | 0 | 1 | 0 | 0 | 1 |
| stationary bike | 0 | 1 | 0 | 0 | 1 |
| towel | 0 | 0 | 1 | 0 | 1 |
| treadmill | 3 | 0 | 0 | 0 | 3 |
| weight plates | 2 | 1 | 0 | 0 | 3 |
| wrist roller | 0 | 1 | 0 | 0 | 1 |

Supabase equipment counts are identical to the seed table.

### Seed Location by Difficulty

| location | beginner | intermediate | advanced | null | total |
| --- | ---: | ---: | ---: | ---: | ---: |
| both | 38 | 16 | 12 | 0 | 66 |
| gym | 47 | 58 | 14 | 0 | 119 |
| home | 3 | 3 | 3 | 0 | 9 |

Supabase location counts are identical to the seed table.

## Seed vs Supabase Comparison

| Check | Result |
| --- | --- |
| Seed validation | 194 valid, 0 invalid |
| Seed rows | 194 |
| Supabase rows | 194 |
| Missing in Supabase by slug | 0 |
| Missing in seed by slug | 0 |
| Audited field mismatches | 0 |
| Null difficulty values | 0 |
| Non-enum difficulty values | 0 |

Advanced records are not missing from Supabase relative to seed. Supabase exactly mirrors the current seed distribution.

## Filter and Query Findings

### Difficulty Enum and Schema

Difficulty is consistently defined as lowercase enum values:

- `beginner`
- `intermediate`
- `advanced`

Confirmed in:

- `data/exercises/_schema.ts`
- `types/database.ts`
- `lib/exercises/types.ts`
- `supabase/migrations/20240101000000_initial_schema.sql`

No case-sensitivity mismatch was found for difficulty.

### Current Exercise Library Data Flow

The current Exercise Library page calls `getExercises()` with no filters in `app/[locale]/(app)/workouts/library/page.tsx`. The active page therefore loads all Supabase rows server-side and filters in `components/workouts/exercise-library-client.tsx`.

The client filter uses exact value checks:

- Muscle: `ex.muscle_groups.includes(muscle)`
- Difficulty: `ex.difficulty === difficulty`
- Location: exact `location`, with `both` included for `gym` or `home`

This means Advanced + Shoulders returns zero because no row has both:

- `muscle_groups` containing `shoulders`
- `difficulty` equal to `advanced`

### Server Query Logic

`lib/actions/exercises.ts` and `lib/exercises/queries.ts` also use exact lowercase difficulty filters:

- `.eq('difficulty', filters.difficulty)`

No query normalization issue was found for difficulty.

### UI Filter Values and Translations

The Exercise Library difficulty chip values are:

- `beginner`
- `intermediate`
- `advanced`

Translations exist in all supported locales:

| Key | RO | EN | ES |
| --- | --- | --- | --- |
| `beginner` | Incepator | Beginner | Principiante |
| `intermediate` | Intermediar | Intermediate | Intermedio |
| `advanced` | Avansat | Advanced | Avanzado |

The translation labels do not affect filtering because the filter stores and compares enum values, not translated labels.

### Muscle Taxonomy Mismatch

The UI muscle chips are:

`chest`, `shoulders`, `biceps`, `triceps`, `forearms`, `abs`, `quads`, `hamstrings`, `glutes`, `calves`, `lats`, `traps`, `lower_back`

The current primary seed muscle groups are:

`back`, `biceps`, `calves`, `cardio`, `chest`, `core`, `forearms`, `glutes`, `hamstrings`, `quadriceps`, `shoulders`, `triceps`

Primary seed groups missing from the UI chips:

- `back`
- `cardio`
- `core`
- `quadriceps`

UI chips without matching primary seed data:

- `abs`
- `quads`
- `lats`
- `traps`
- `lower_back`

This is a real filter taxonomy issue, but it is not the cause of Advanced + Shoulders. The `shoulders` key matches between UI and data.

## Muscle Groups with Insufficient Advanced Coverage

### Zero Advanced

| muscle group | total exercises | advanced |
| --- | ---: | ---: |
| calves | 6 | 0 |
| shoulders | 15 | 0 |

### Fewer Than 3 Advanced

| muscle group | total exercises | advanced |
| --- | ---: | ---: |
| calves | 6 | 0 |
| cardio | 20 | 2 |
| forearms | 15 | 1 |
| shoulders | 15 | 0 |

### Advanced Slugs by Muscle Group

| muscle group | advanced slugs |
| --- | --- |
| back | `pull-up`, `pendlay-row`, `renegade-row` |
| biceps | `bayesian-cable-curl`, `drag-curl`, `chin-up` |
| calves | None |
| cardio | `sprinting`, `hiit-training` |
| chest | `chest-dips`, `guillotine-press`, `plyometric-push-ups`, `spoto-press`, `archer-push-ups` |
| core | `hanging-leg-raise`, `ab-wheel-rollout`, `dragon-flag`, `stir-the-pot` |
| forearms | `towel-pull-up-hold` |
| glutes | `zercher-squat`, `cossack-squat`, `glute-ham-raise` |
| hamstrings | `single-leg-romanian-deadlift`, `good-morning`, `nordic-curl`, `glute-ham-raise` |
| quadriceps | `front-squat`, `sissy-squat`, `zercher-squat`, `cossack-squat` |
| shoulders | None |
| triceps | `triceps-dip`, `jm-press`, `tate-press` |

## Suspiciously Imbalanced Distributions

- Overall Advanced coverage is 29 of 194 exercises, approximately 15%. This is low but not automatically wrong if the classification standard is strict.
- `shoulders` has 0 Advanced out of 15 despite having several technically demanding vertical-press and stabilization patterns.
- `calves` has 0 Advanced out of 6. This may be legitimate if current calf entries are mostly standard raise variations, but it leaves the filter empty.
- `forearms` has 1 Advanced out of 15. Grip training has genuinely advanced options, but most current entries are simple wrist-curl or hold patterns.
- `cardio` has 2 Advanced out of 20. This is not necessarily wrong because the current cardio list has many general modalities, but advanced conditioning coverage is thin.
- `machine` equipment has 0 Advanced out of 19, which is plausible because machines reduce stability demands.
- `cable machine` has 1 Advanced out of 26, which may indicate conservative classification rather than a bug.
- `dumbbells` has 3 Advanced out of 42; this may be low given unilateral stability and coordination demands in some dumbbell patterns.
- `landmine attachment` has 0 Advanced out of 4; this may be acceptable if current landmine entries are intended as joint-friendly intermediate movements.

## Suspect Classifications

These are review candidates only. No difficulty should be changed without Product Owner approval and content review.

| Exercise | Current | Audit note | Recommendation |
| --- | --- | --- | --- |
| `barbell-overhead-press` | Intermediate | Requires overhead mobility, bracing, bar path control, and full-body stability. | Review. Could remain Intermediate if treated as foundational, but it is the strongest existing Shoulder candidate for Advanced. |
| `dumbbell-arnold-press` | Intermediate | Rotational press with independent dumbbells and shoulder-control demand. | Review. Possible Intermediate+ rather than clearly Advanced. |
| `pike-push-up` | Intermediate | Current base version is intermediate; feet-elevated or handstand versions would be Advanced. | Prefer adding an Advanced variant instead of reclassifying the base movement. |
| `landmine-single-arm-press` | Intermediate | Unilateral bracing and diagonal press path, but landmine path reduces complexity. | Keep Intermediate unless Product Owner wants a stricter shoulder progression. |
| `barbell-upright-row` | Intermediate | Shoulder-risk concerns do not equal Advanced complexity. | Do not promote only to fill coverage. |
| `cable-face-pull` | Beginner | Setup and external-rotation cueing may be more technical than Beginner. | Review for Intermediate, not Advanced. |
| `dumbbell-bench-press` | Beginner | Independent dumbbells require more stabilization than machine/barbell variants for new users. | Review for Intermediate. |
| `single-arm-dumbbell-row` | Beginner | Requires hinge/bracing but is commonly taught early. | Keep Beginner or review for Intermediate. |
| `single-leg-calf-raise` | Beginner | Unilateral balance and full range may be more demanding than Beginner. | Review for Intermediate; not a strong Advanced candidate. |
| `burpees` | Intermediate | Coordination and conditioning load are high, but the movement is broad and scalable. | Keep Intermediate or add a harder Advanced variation. |

## Recommended Corrections

1. Do not mass-promote exercises just to make Advanced counts look balanced.
2. Run a Product Owner content review for the suspect classifications above.
3. Treat Advanced as a movement-quality classification based on technical demand, stability requirements, coordination, mobility, prerequisite strength, and risk of form breakdown.
4. Fix the Exercise Library muscle taxonomy separately so UI chips match primary seed groups:
   - `abs` should map to or be replaced by `core`.
   - `quads` should map to or be replaced by `quadriceps`.
   - `back` should be exposed as a primary filter if the data uses `back`.
   - `cardio` should be exposed if cardio entries remain in the same library.
   - `lats`, `traps`, and `lower_back` need either data support as primary groups or a secondary-muscle filtering design.
5. If any difficulty changes are approved, update seed data first, then reseed/update Supabase through an approved database-writing workflow.

## Recommended New Exercises

Only add Advanced coverage where the movement is genuinely advanced. These are recommendations, not implemented changes.

### Shoulders

- `wall-handstand-push-up`: true advanced bodyweight vertical press requiring prerequisite strength, inversion tolerance, bracing, and balance.
- `feet-elevated-pike-push-up`: stronger Advanced progression than the existing base `pike-push-up`.
- `barbell-push-press`: advanced coordination and power transfer, if the product wants strength-power movements in the library.

### Calves

- `single-leg-deficit-calf-raise`: higher range of motion, unilateral stability, and stricter control than current calf raise entries.
- `single-leg-pogo-hop`: plyometric ankle stiffness and landing-control demand; only if plyometric calf work fits the approved exercise scope.
- `loaded-standing-calf-raise-deficit`: advanced only if specified with strict deficit range and load-control standard, not just heavy weight.

### Forearms

- `one-arm-dead-hang`: high prerequisite grip strength and shoulder stability.
- `false-grip-hang`: advanced wrist/forearm position and prerequisite tissue tolerance.
- `plate-pinch-carry`: progression from static pinch hold into loaded gait and grip endurance.

### Cardio

- `hill-sprints`: advanced intensity and tissue-loading demand.
- `shuttle-runs`: acceleration, deceleration, coordination, and conditioning demand.
- `tempo-interval-running`: advanced only if defined as structured interval work, not generic jogging.

## Verification Answers

| Question | Finding |
| --- | --- |
| Are Advanced records missing from seed data? | Not globally. There are 29 Advanced seed records. Advanced coverage is absent for `shoulders` and `calves`. |
| Does Supabase differ from seed? | No. Supabase matches seed exactly for the audited rows and fields. |
| Is a mapping or case-sensitivity bug hiding Advanced records? | No difficulty mapping or case issue was found. |
| Do filters combine values incorrectly? | No for difficulty + muscle. The active UI uses exact AND filtering, which correctly returns zero when no row matches both filters. |
| Is difficulty classification underdeveloped? | Yes. Several groups have thin or zero Advanced coverage, and some existing classifications deserve Product Owner review. |

## Risks

- Promoting exercises only to fill a filter would degrade content trust.
- Adding new Advanced exercises without a progression standard may create the same imbalance later.
- Fixing UI muscle taxonomy can change visible filter behavior and should be handled as a separate, focused task.
- Supabase updates require an approved database-writing workflow; this audit intentionally did not write data.
- The current working tree contains unrelated uncommitted component/report changes, so validation was run against the whole current tree but this audit did not alter those files.

## Proposed Implementation Plan

1. Product Owner reviews and approves the difficulty standard for Advanced.
2. Product Owner reviews suspect classifications and decides which existing exercises, if any, should change.
3. Add genuinely advanced exercises for `shoulders` and `calves` rather than inflating existing entries.
4. Add targeted advanced options for `forearms` and optionally `cardio`.
5. Update seed data in one focused content task.
6. Validate seed with Zod and exact count tables.
7. Apply approved Supabase update/reseed through the existing database workflow.
8. Separately fix Exercise Library muscle taxonomy so UI filters align with the seed.
9. Re-run Exercise Library manual QA for Advanced + each muscle group, search + difficulty, and clear-filter behavior.

## Validation

| Check | Command | Result |
| --- | --- | --- |
| ESLint | `npm run lint` | BLOCKED by PowerShell execution policy for `npm.ps1`; rerun as `npm.cmd run lint`: PASS |
| TypeScript | `npx tsc --noEmit` | BLOCKED by PowerShell execution policy for `npx.ps1`; rerun as `npx.cmd tsc --noEmit`: PASS |
| Diff whitespace | `git diff --check` | PASS with line-ending warnings on pre-existing modified files |
| Seed validation | `validateSeedBatch(allExercises)` | PASS, 194 valid / 0 invalid |
| Supabase read audit | read-only `select` from `exercises` | PASS, 194 rows |

## Files Created

- `docs/reports/2026-07-14-exercise-difficulty-audit.md`

## Files Modified

- None.

## Files Deleted

- None.

## Production-Readiness Verdict

The audit is complete and production-ready as a report. The exercise difficulty taxonomy is not yet content-complete for production because `shoulders` and `calves` have zero Advanced coverage and several groups have fewer than three Advanced options. No data changes should be made until Product Owner approval confirms the difficulty standard and selected corrections.
