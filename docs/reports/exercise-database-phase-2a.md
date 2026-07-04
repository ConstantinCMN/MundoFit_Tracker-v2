# Exercise Database — Phase 2A (Back Batch 1)

## Sprint
Development Sprint — Exercise Database Phase 2A (Back Batch 1)

## Exercises added
5 foundational Back exercises, seeding a brand-new `data/exercises/back.ts` module:

1. `barbell-bent-over-row` — Barbell Bent-Over Row
2. `pull-up` — Pull-Up
3. `lat-pulldown` — Lat Pulldown
4. `seated-cable-row` — Seated Cable Row
5. `chest-supported-row` — Chest-Supported Row

All 5 match the suggested examples from the brief exactly.

## Total Back exercises
5 (new library — this is the first Back batch)

## Files modified
- `data/exercises/back.ts` — **new file**, created following the same structure/convention as `chest.ts` (one file per muscle group, exporting `{group}Exercises`)
- `data/exercises/index.ts` — uncommented the existing `backExercises` import and spread (the scaffolding for this was already present, commented out, from the original architecture)

No Chest exercises were modified — `data/exercises/chest.ts` was untouched (still 27 entries). No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 32/32 entries valid (27 chest + 5 back), 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` are placeholder values (all 5 entries share `muscle_map_id: 'back-primary'`) and must be replaced with real media assets and differentiated muscle-map IDs before production use — same pattern as the Chest library.
- `equipment` introduces the new free-text term `'pull-up bar'` for `pull-up`, not previously used anywhere in the Chest library. Equipment is unconstrained free text in the schema (no enum), so this is valid, but worth keeping an eye on for spelling/naming consistency as more muscle groups are added (e.g. avoid later accidentally introducing `'pullup bar'` or `'chin-up bar'` as a synonym-duplicate term).
- Live database seeding has still not been run for any Chest or Back batch — `data/exercises/` continues to be ahead of whatever is upserted in Supabase.

## Next recommended sprint
Phase 2B — Back Batch 2, covering remaining fundamental variations (e.g. T-Bar Row, Single-Arm Dumbbell Row, Wide-Grip Pulldown, Straight-Arm Pulldown, Deadlift-adjacent back work), following the same batch-of-5 append pattern used for Chest. In parallel, consider scheduling the deferred sprint to replace placeholder media/muscle-map IDs and run the live seed upsert for all accumulated Chest + Back entries.
