# Exercise Database — Phase 1C (Chest Batch 3)

## Sprint
Development Sprint — Exercise Database Phase 1C (Chest Batch 3)

## Date
2026-07-01

## Exercises added
5 new chest exercises appended to `data/exercises/chest.ts` (existing 12 entries untouched):

1. `decline-dumbbell-press` — Decline Dumbbell Press
2. `smith-machine-bench-press` — Smith Machine Bench Press
3. `decline-push-ups` — Decline Push-Ups
4. `svend-press` — Svend Press
5. `dumbbell-pullover` — Dumbbell Pullover

Chest library now totals 17 entries.

## Files modified
- `data/exercises/chest.ts` — appended 5 new `ExerciseSeedEntry` objects (append-only, no edits to existing entries)
- `data/exercises/index.ts` — no change needed (already imports/aggregates `chestExercises`)

No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 17/17 entries valid, 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` are placeholder values (`https://placeholder.mundofit.app/...` and `'chest-primary'`) and must be replaced with real media assets and muscle-map IDs before this batch is production-ready.
- Live database seeding has not been run for any of Phase 1A/1B/1C batches — `data/exercises/chest.ts` is currently ahead of whatever is upserted in Supabase.

## Next recommended sprint
Phase 1D — Chest Batch 4 (remaining variations, e.g. single-arm dumbbell press, resistance-band press, landmine press) or begin Phase 2 (Back exercise library), plus a dedicated sprint to replace chest placeholder media/muscle-map IDs and run the live seed upsert.
