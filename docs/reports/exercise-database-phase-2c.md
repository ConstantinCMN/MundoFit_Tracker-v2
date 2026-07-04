# Exercise Database — Phase 2C (Back Batch 3)

## Sprint
Development Sprint — Exercise Database Phase 2C (Back Batch 3)

## Exercises added
5 new Back exercises appended to `data/exercises/back.ts` (existing 10 entries untouched), matching the suggested list exactly:

1. `deadlift` — Deadlift
2. `rack-pull` — Rack Pull
3. `meadows-row` — Meadows Row
4. `reverse-grip-barbell-row` — Reverse-Grip Barbell Row
5. `face-pull` — Face Pull

**Movement-pattern note:** `deadlift` and `rack-pull` are both classified as `movement_pattern: 'hinge'` — a new pattern for this library (all 10 prior Back entries were `pull` or `isolation`). They are legitimately distinct exercises (full range vs. partial range, different training purpose — total posterior-chain strength vs. upper-back/grip overload) rather than a duplicate, so both were kept per the suggested list. `face-pull` was classified as `movement_pattern: 'isolation'` (matching how `straight-arm-cable-pulldown` was categorized) rather than `pull`, to maximize pattern diversity across the batch — final mix is 2 hinge, 2 pull, 1 isolation.

## Total Back exercises
15 (10 existing from Phases 2A-2B + 5 new)

## Files modified
- `data/exercises/back.ts` — appended 5 new `ExerciseSeedEntry` objects (append-only, no edits/removals of existing Back entries)
- `data/exercises/index.ts` — no change needed (already imports/aggregates `backExercises`)

No Chest exercises were modified — `data/exercises/chest.ts` remains untouched at 27 entries. No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 42/42 entries valid (27 chest + 15 back), 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` remain placeholder values across all 15 Back entries (all sharing `muscle_map_id: 'back-primary'`) and must be replaced with real media assets and differentiated muscle-map IDs before production use — same outstanding gap as the Chest library.
- `deadlift` and `rack-pull` classify `muscle_groups: ['back']` per this file's convention (one file per primary muscle group), with `glutes`/`hamstrings` as secondary muscles. In reality these are whole-posterior-chain lifts that many exercise libraries file under "Legs" or a separate "Full Body" category instead of "Back" — worth a product decision on whether cross-listing under a future Legs library (once it exists) makes sense, since the schema's `muscle_groups` field is already an array and could support `['back', 'legs']` type dual-classification if desired.
- `rack-pull` introduces the new equipment term `'power rack'`, not previously used anywhere in Chest or Back. Equipment remains unconstrained free text in the schema, so this is valid, but worth watching for future naming drift (e.g. `'power rack'` vs `'squat rack'` vs `'rig'`).
- Live database seeding has still not been run for any Chest or Back batch — `data/exercises/` continues to be ahead of whatever is upserted in Supabase.

## Next recommended sprint
Phase 2D — Back Batch 4 to round out remaining fundamental variations (e.g. Sumo Deadlift, Pendlay Row, Wide-Grip Seated Cable Row, Assisted Pull-Up, Renegade Row), or a QA sprint mirroring the Chest Library QA Review to audit all 15 Back entries for consistency now that the library has meaningful volume. In parallel, consider scheduling the deferred sprint to replace placeholder media/muscle-map IDs and run the live seed upsert for all accumulated Chest + Back entries.
