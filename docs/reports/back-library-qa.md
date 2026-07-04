# Back Library QA Report

## Sprint
QA Sprint — Back Library Review (full quality audit of all 20 Back exercises produced across Phases 2A-2D)

## Overall quality score: 92/100

The library is well-structured and internally consistent: all 20 entries correctly classify `back` as the sole primary muscle group, `is_unilateral` is accurate on every entry (only the 3 genuinely single-arm-per-rep movements — `single-arm-dumbbell-row`, `meadows-row`, `renegade-row` — are flagged true), `category`/`movement_pattern` pairings are valid and consistent (isolation↔isolation for `straight-arm-cable-pulldown` and `face-pull`, compound↔hinge for `deadlift`/`rack-pull`, compound↔pull for the remaining 16), and every entry has full EN/RO/ES coverage for name, description, instructions, mistakes, tips, and keywords. No equipment/instruction mismatches were found (unlike the one found in the Chest QA pass), and no translation typos or duplicate words were found. The deductions below reflect a handful of small but real consistency defects (now fixed) and known, pre-existing gaps out of scope for a content-only QA pass (media/muscle-map placeholders).

## Issues found

1. **Inconsistent secondary_muscles ordering:** 18 of 20 entries list biceps before shoulders where both apply (`['biceps', 'shoulders', ...]`), but `wide-grip-seated-cable-row` and `machine-high-row` reversed the order to `['shoulders', 'biceps']` with no functional reason for the deviation — the same class of issue found and fixed in the Chest QA pass.
2. **Inconsistent `location` for identical equipment:** `pull-up` (equipment: `['pull-up bar']`) was classified `'gym'` while `inverted-row` (identical equipment: `['pull-up bar']`) was classified `'home'`, with no stated reason for the split. A pull-up bar is equally common in a home doorframe or a gym rig, so the same equipment should not silently imply two different locations.
3. **Ambiguous alias — `t-bar-row`:** the bare alias `'landmine row'` is equally true of `meadows-row` (also a landmine-anchored row), but only `t-bar-row` claimed it — the same asymmetric-alias pattern found and fixed on `cable-crossover` in the Chest QA pass.
4. **Ambiguous/redundant alias — `single-arm-dumbbell-row`:** the bare alias `'dumbbell row'` is equally true of `chest-supported-row` and `renegade-row` (both also use dumbbells for rowing), and was redundant alongside the entry's own more specific `'one-arm dumbbell row'` alias.

### Reviewed, no change made
- **`meadows-row` description claims a "neutral grip"** while gripping a bare barbell sleeve near a landmine attachment. Real-world coaching sources are genuinely split on whether this is best described as neutral or overhand/pronated depending on hand position — this is a debatable coaching-cue nuance, not a confirmable factual error, so it was left as-is rather than guessed at.
- **`t-bar-row`'s alias `'t-bar row machine'`** describes a dedicated chest-supported T-bar row machine, while the entry itself describes the DIY landmine-anchored straddle version. These are colloquially used interchangeably by lifters and gym-goers industry-wide (the same way "bench press" defaults to barbell flat bench), so this was left as-is rather than treated as a naming defect.
- **`deadlift` and `rack-pull` classify `muscle_groups: ['back']`** per this file's one-file-per-muscle-group convention, with `glutes`/`hamstrings` as secondary muscles. This was already flagged as a known/tracked issue in the Phase 2C report (some libraries file these under "Legs" instead) and is a product classification question, not a QA-fixable data error.

## Changes made
All changes are content-only edits to existing entries in `data/exercises/back.ts` — no exercises were added, removed, or renamed, and `hero_image_url` / `demo_image_url` / `video_url` / `muscle_map_id` placeholders were left untouched per instructions.

1. `wide-grip-seated-cable-row`: reordered `secondary_muscles` to `['biceps', 'shoulders']`.
2. `machine-high-row`: reordered `secondary_muscles` to `['biceps', 'shoulders']`.
3. `pull-up`: changed `location` from `'gym'` to `'both'`.
4. `inverted-row`: changed `location` from `'home'` to `'both'`, matching `pull-up`'s identical equipment.
5. `t-bar-row`: renamed the alias `'landmine row'` → `'landmine t-bar row'` for clarity against `meadows-row`.
6. `single-arm-dumbbell-row`: removed the ambiguous, redundant alias `'dumbbell row'` (kept as a `keyword`, where the looser association is appropriate; `'one-arm dumbbell row'` already covers this precisely).

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 47/47 entries valid (27 chest + 20 back), 0 invalid
- **Seed validation**: ✅ no duplicate slugs; entry count unchanged at 20 Back / 47 total (no exercises added, removed, or renamed)

## Remaining recommendations
1. Replace the shared `muscle_map_id: 'back-primary'` placeholder with differentiated IDs (lats/upper-back/lower-back/posterior-chain emphasis) once real muscle-map assets exist — same outstanding item already tracked for Chest.
2. Replace all placeholder `hero_image_url` / `demo_image_url` / `video_url` values with real media before production launch.
3. Resolve the `deadlift`/`rack-pull` muscle-group classification question (Back vs Legs vs dual-listing) as a product decision once a Legs library exists — the schema's array-typed `muscle_groups` field already supports `['back', 'legs']` if cross-listing is desired.
4. Consider running this same lightweight QA pass after future Back batches (or any new muscle-group library), since — as with Chest — all issues found here originated in earlier phases and went undetected until this dedicated review.

## Final production readiness
**Not production-ready on media/muscle-map assets** (all placeholders, expected and tracked separately), but **content is production-ready** — after this pass, all 20 Back entries have accurate muscle/equipment/category classification, consistent secondary-muscle ordering, consistent location classification for identical equipment, and unambiguous aliases. Recommend clearing the media/muscle-map placeholder backlog (shared with Chest) before flipping the library live, but no further content blockers remain.
