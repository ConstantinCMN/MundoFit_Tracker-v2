# Exercise Database — Phase 2B (Back Batch 2)

## Sprint
Development Sprint — Exercise Database Phase 2B (Back Batch 2)

## Exercises added
5 new Back exercises appended to `data/exercises/back.ts` (existing 5 entries untouched):

1. `t-bar-row` — T-Bar Row
2. `single-arm-dumbbell-row` — Single-Arm Dumbbell Row
3. `close-grip-lat-pulldown` — Close-Grip Lat Pulldown
4. `straight-arm-cable-pulldown` — Straight-Arm Cable Pulldown
5. `inverted-row` — Inverted Row

**Substitution note:** "Wide-Grip Lat Pulldown" from the suggested list was skipped as a duplicate — the existing `lat-pulldown` entry (Phase 2A) already lists `'wide-grip lat pulldown'` as an alias and its instructions describe exactly that wide-overhand-grip movement. `Close-Grip Lat Pulldown` (V-bar, neutral grip, lower-lat emphasis) was substituted instead, since it's a genuinely distinct grip/attachment variation with no overlap.

## Total Back exercises
10 (5 existing from Phase 2A + 5 new)

## Files modified
- `data/exercises/back.ts` — appended 5 new `ExerciseSeedEntry` objects (append-only, no edits/removals of existing Back entries)
- `data/exercises/index.ts` — no change needed (already imports/aggregates `backExercises` from Phase 2A)

No Chest exercises were modified — `data/exercises/chest.ts` remains untouched at 27 entries. No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 37/37 entries valid (27 chest + 10 back), 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` remain placeholder values across all 10 Back entries (all sharing `muscle_map_id: 'back-primary'`) and must be replaced with real media assets and differentiated muscle-map IDs before production use — same outstanding gap as the Chest library.
- `t-bar-row` reuses the `'landmine attachment'` equipment term introduced by Chest's `landmine-press` — consistent within the codebase, but worth double-checking equipment display/filtering copy reads naturally for a landmine-anchored row vs. a landmine-anchored press.
- `is_unilateral: true` is used again here (`single-arm-dumbbell-row`), consistent with the Chest library's existing unilateral entries — no new pattern introduced, just confirming continued correctness.
- Live database seeding has still not been run for any Chest or Back batch — `data/exercises/` continues to be ahead of whatever is upserted in Supabase.

## Next recommended sprint
Phase 2C — Back Batch 3 (remaining variations, e.g. Deadlift, Meadows Row, Reverse-Grip Bent-Over Row, Face Pull, Rack Pull) to round out the Back library toward completeness, following the same batch-of-5 append pattern used for Chest. In parallel, consider scheduling the deferred sprint to replace placeholder media/muscle-map IDs and run the live seed upsert for all accumulated Chest + Back entries.
