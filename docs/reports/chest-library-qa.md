# Chest Library QA Report

## Sprint
QA Sprint — Chest Library Review (full quality audit of all 27 Chest exercises produced across Phases 1A-1E)

## Overall quality score: 91/100

The library is well-structured and internally consistent: all 27 entries correctly classify `chest` as the sole primary muscle group, `is_unilateral` is accurate on every entry (only the 3 genuinely single-arm movements are flagged true), `category`/`movement_pattern` values are valid against the schema enum and consistently paired (isolation↔isolation, compound/plyometric↔push), and every entry has full EN/RO/ES coverage for name, description, instructions, mistakes, tips, and keywords. The deductions below reflect a handful of small but real content-quality defects (now fixed) and known, pre-existing gaps that are out of scope for a content-only QA pass (media/muscle-map placeholders).

## Issues found

1. **Equipment/content mismatch (incorrect equipment):** `floor-press` described itself as "a barbell or dumbbell press" and its instructions explicitly covered a dumbbell option, but `equipment` only listed `['barbell']`, silently excluding the dumbbell variant from equipment-based filtering.
2. **Translation typo (RO):** `pec-deck-machine` mistakes_ro contained a misspelling, `perniițele` (should be `pernițele`) — an extra "i" not present anywhere else the same word is used in the file.
3. **Inconsistent secondary_muscles ordering:** 25 of 27 compound-press entries list `['triceps', 'shoulders', ...]`, but `landmine-press` and `guillotine-press` reversed the order to `['shoulders', 'triceps', ...]` with no functional reason for the deviation.
4. **Ambiguous alias — `barbell-bench-press`:** the bare alias `'chest press'` is generic enough to also describe `machine-chest-press`, a completely different equipment/movement entry. Since aliases imply strong equivalence (unlike keywords, which are loose associations), this risked steering searches for "chest press" exclusively toward the barbell version.
5. **Ambiguous alias — `cable-crossover`:** the bare alias `'cable fly'` is equally true of `low-to-high-cable-fly`, but only `cable-crossover` claimed it, creating an asymmetric/incomplete alias claim between two entries that are both legitimately "a cable fly."
6. **Redundant coaching content:** `push-ups` included the tip "Elevate your feet on a box to increase upper-chest emphasis and difficulty" — this is the entire premise of the separately authored `decline-push-ups` exercise, creating unnecessary content overlap between two library entries instead of adding new value to `push-ups`.

### Reviewed, no change made
- **"Decline" naming direction:** for barbell/dumbbell presses, "decline" = lower-chest emphasis (feet-up bench); for push-ups, "decline" (feet-elevated) = *upper*-chest emphasis. Both usages match real-world, industry-standard terminology exactly as written — this is a well-known quirk of fitness naming conventions, not a defect in this library, so no renaming was made (renaming would actually reduce real-world searchability).
- **`dumbbell-pullover` secondary_muscles uses `'back'`** where other entries never use this term (only triceps/shoulders/core appear elsewhere). This is defensible at the current granularity of the taxonomy and matches its `keywords` field (`'lats'`), so left as-is.
- **`location: 'gym'` on all free-weight/machine entries**, even though some (e.g. dumbbell presses) are plausibly home-gym-compatible. This is a product/taxonomy policy question, not a data error, and is called out below as a recommendation rather than fixed unilaterally.

## Changes made
All changes are content-only edits to existing entries in `data/exercises/chest.ts` — no exercises were added, removed, or renamed, and `hero_image_url` / `demo_image_url` / `video_url` / `muscle_map_id` placeholders were left untouched per instructions.

1. `floor-press`: added `'dumbbells'` to `equipment`, and added `'dumbbell floor press'` to `aliases` to match the existing description/instructions.
2. `pec-deck-machine`: fixed RO typo `perniițele` → `pernițele`.
3. `landmine-press`: reordered `secondary_muscles` to `['triceps', 'shoulders', 'core']`.
4. `guillotine-press`: reordered `secondary_muscles` to `['triceps', 'shoulders']`.
5. `barbell-bench-press`: removed the ambiguous `'chest press'` alias (retained as a `keyword`, where the looser association is appropriate).
6. `cable-crossover`: renamed the alias `'cable fly'` → `'high-to-low cable fly'` for clarity against `low-to-high-cable-fly`.
7. `push-ups`: replaced the tip that duplicated `decline-push-ups`' premise with a distinct tempo-based coaching tip (EN/RO/ES).

## Validation results
- **TypeScript** (`tsc --noEmit`): ✅ pass, no errors
- **Zod** (`validateSeedBatch` from `data/exercises/_schema.ts`): ✅ 27/27 entries valid, 0 invalid
- **Seed validation**: ✅ no duplicate slugs; entry count unchanged at 27 (append-only rule respected — no exercises added or removed)

## Remaining recommendations
1. Replace the shared `muscle_map_id: 'chest-primary'` placeholder with differentiated IDs (upper/lower/inner-chest emphasis) once real muscle-map assets exist — flagged in every prior phase report and still outstanding.
2. Replace all placeholder `hero_image_url` / `demo_image_url` / `video_url` values with real media before production launch.
3. Decide product policy on `location` for free-weight exercises that are plausibly home-compatible (e.g. dumbbell presses/flyes) — currently uniformly `'gym'`.
4. Consider a lightweight periodic QA pass (like this one) after each future batch-append sprint, since all issues found here originated in earlier phases and went undetected until this dedicated review.

## Final production readiness
**Not production-ready on media/muscle-map assets** (all placeholders, expected and tracked separately), but **content is production-ready** — after this pass, all 27 Chest entries have accurate muscle/equipment/category classification, consistent secondary-muscle ordering, unambiguous aliases, and no redundant or duplicated coaching content. Recommend clearing the media/muscle-map placeholder backlog before flipping the library live, but no further content blockers remain.
