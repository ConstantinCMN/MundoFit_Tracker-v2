# Exercise Database — Phase 1D (Chest Batch 4)

## Sprint
Development Sprint — Exercise Database Phase 1D (Chest Batch 4)

## Date
2026-07-01

## Exercises added
5 new chest exercises appended to `data/exercises/chest.ts` (existing 17 entries untouched):

1. `landmine-press` — Landmine Press
2. `single-arm-dumbbell-press` — Single-Arm Dumbbell Press
3. `resistance-band-chest-press` — Resistance Band Chest Press
4. `guillotine-press` — Guillotine Press
5. `incline-dumbbell-flyes` — Incline Dumbbell Flyes

Chest library now totals 22 entries.

Note: "Plate Press" from the suggested examples was skipped as a duplicate — the existing `svend-press` entry (Phase 1C) already covers this exact movement (plate-squeeze press), including "plate press" as an alias. Incline Dumbbell Flyes was substituted to keep the batch at 5 non-overlapping variations.

## Files modified
- `data/exercises/chest.ts` — appended 5 new `ExerciseSeedEntry` objects (append-only, no edits to existing entries)
- `data/exercises/index.ts` — no change needed (already imports/aggregates `chestExercises`)

No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 22/22 entries valid, 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` remain placeholder values across all 22 chest entries and must be replaced with real media assets and muscle-map IDs before production use.
- Live database seeding has still not been run for any Phase 1A/1B/1C/1D batch — `data/exercises/chest.ts` continues to be ahead of whatever is upserted in Supabase.
- `is_unilateral: true` is now used for the first time (landmine-press, single-arm-dumbbell-press) — worth spot-checking downstream UI/filtering that consumes this flag still behaves correctly with real unilateral entries present.

## Next recommended sprint
The Chest library (22 entries) is now broad enough to consider it feature-complete for v1. Recommend moving to Phase 2 — Back exercise library — using the same batch-of-5 append pattern, plus a dedicated sprint to replace placeholder media/muscle-map IDs and run the live seed upsert for all accumulated chest entries.
