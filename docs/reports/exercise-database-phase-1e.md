# Exercise Database — Phase 1E (Chest Final Batch)

## Sprint
Development Sprint — Exercise Database Phase 1E (Chest Final Batch)

## Exercises added
5 new chest exercises appended to `data/exercises/chest.ts` (existing 22 entries untouched), chosen to fill remaining movement-pattern and equipment gaps rather than duplicate existing variations:

1. `floor-press` — Floor Press (barbell, floor-limited range of motion, no bench)
2. `plyometric-push-ups` — Plyometric Push-Ups (first `plyometric` category chest exercise in the library)
3. `standing-cable-chest-press` — Standing Cable Chest Press (a standing cable *press*, distinct from the existing cable *flye* variations)
4. `spoto-press` — Spoto Press (paused/dead-stop technique variant, advanced)
5. `archer-push-ups` — Archer Push-Ups (unilateral-emphasis bodyweight push-up, first unilateral bodyweight chest movement)

## Total Chest exercises
27 (22 existing from Phases 1A-1D + 5 new)

## Files modified
- `data/exercises/chest.ts` — appended 5 new `ExerciseSeedEntry` objects (append-only, no edits/removals of existing entries)
- `data/exercises/index.ts` — no change needed (already imports/aggregates `chestExercises`)

No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 27/27 entries valid, 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set (27 total, all chest); live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` remain placeholder values across all 27 chest entries and must be replaced with real media assets and muscle-map IDs before production use.
- Live database seeding has still not been run for any Phase 1A-1E batch — `data/exercises/chest.ts` continues to be ahead of whatever is upserted in Supabase.
- All 27 entries currently share the single `muscle_map_id: 'chest-primary'` placeholder — once real muscle-map assets exist, some entries (e.g. incline/decline variants) likely warrant more specific map IDs (upper-chest, lower-chest) rather than one shared value.
- The library now has some fairly niche/advanced movements (Spoto Press, Archer Push-Ups, Guillotine Press) that may need clearer skill-progression tagging in the UI so beginners aren't steered toward them by default.

## Recommendation
The Chest exercise library is now complete for v1 (27 exercises spanning compound/isolation/plyometric categories, all equipment types, and beginner-to-advanced difficulty). Recommend:
1. Move to Phase 2 — Back exercise library, using the same batch-of-5 append pattern.
2. Schedule a dedicated sprint to replace placeholder media/muscle-map IDs and run the live seed upsert for all 27 accumulated chest entries.
