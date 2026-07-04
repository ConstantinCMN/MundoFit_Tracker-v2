# Exercise Database — Phase 2D (Back Batch 4)

## Sprint
Development Sprint — Exercise Database Phase 2D (Back Batch 4)

## Exercises added
5 new Back exercises appended to `data/exercises/back.ts` (existing 15 entries untouched), matching the suggested list exactly:

1. `pendlay-row` — Pendlay Row
2. `assisted-pull-up` — Assisted Pull-Up
3. `wide-grip-seated-cable-row` — Wide-Grip Seated Cable Row
4. `renegade-row` — Renegade Row
5. `machine-high-row` — Machine High Row

Each was checked against the existing 15 entries for overlap before being added:
- `wide-grip-seated-cable-row` is distinct from the existing `seated-cable-row` (which uses a close, neutral-grip handle) — a wide overhand grip on a straight bar shifts emphasis toward the upper back/rear delts, the mirror image of how `close-grip-lat-pulldown` was a legitimate non-duplicate of `lat-pulldown` in Phase 2B.
- `machine-high-row` fills a genuine equipment gap — no prior Back entry used plain `'machine'` equipment (existing entries use cable machine, landmine, barbell, dumbbells, bodyweight, or pull-up bar).

**Movement-pattern note:** all 5 suggested exercises are inherently `movement_pattern: 'pull'` — rows and pull-up variants have no legitimate hinge/isolation framing the way Phase 2C's Deadlift/Rack Pull did. The "avoid duplicate movement patterns whenever possible" guidance was honored at the level of *equipment and grip variation* (barbell/dead-stop, machine-assisted, cable-wide-grip, dumbbell-plank, selectorized-machine) since the pattern itself is constrained by the suggested list.

## Total Back exercises
20 (15 existing from Phases 2A-2C + 5 new)

## Files modified
- `data/exercises/back.ts` — appended 5 new `ExerciseSeedEntry` objects (append-only, no edits/removals of existing Back entries)
- `data/exercises/index.ts` — no change needed (already imports/aggregates `backExercises`)

No Chest exercises were modified — `data/exercises/chest.ts` remains untouched at 27 entries. No changes made to database schema, types, UI, or architecture.

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 47/47 entries valid (27 chest + 20 back), 0 invalid
- **Seed validation**: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation

## Known issues
- `hero_image_url`, `demo_image_url`, `video_url`, and `muscle_map_id` remain placeholder values across all 20 Back entries (all sharing `muscle_map_id: 'back-primary'`) and must be replaced with real media assets and differentiated muscle-map IDs before production use — same outstanding gap as the Chest library.
- `assisted-pull-up` introduces the new equipment term `'assisted pull-up machine'`, not previously used anywhere in Chest or Back. Equipment remains unconstrained free text in the schema, so this is valid, but adds to the growing set of gym-specific equipment terms (`'power rack'`, `'landmine attachment'`, `'assisted pull-up machine'`) worth eventually normalizing if the app ever needs a fixed equipment filter list.
- The Back library (20 entries) is now large enough, and has accumulated additions across 4 separate sprints, that it's due for the same kind of dedicated QA pass performed on Chest — this phase did not include one.
- Live database seeding has still not been run for any Chest or Back batch — `data/exercises/` continues to be ahead of whatever is upserted in Supabase.

## Next recommended sprint
A QA sprint mirroring the Chest Library QA Review — auditing all 20 Back entries for duplicate movements, naming/alias consistency, muscle/equipment classification accuracy, movement_pattern consistency, and translation quality, now that 4 batches have accumulated without a review pass. After that, Phase 2E could round out any remaining fundamental Back variations if the QA pass surfaces gaps, or the project could move on to a new muscle group (Legs/Shoulders). Separately, still recommend scheduling the deferred sprint to replace placeholder media/muscle-map IDs and run the live seed upsert for all accumulated Chest + Back entries.
