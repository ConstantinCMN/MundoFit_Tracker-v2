# Exercise Library — Full Audit (v1)

**Date:** 2026-07-04 17:49
**Scope:** All 154 exercises across `data/exercises/{chest,back,shoulders,biceps,triceps,forearms,legs}.ts`.
**Method:** Programmatic, read-only analysis (a temporary Node/tsx script imported every seed array directly, computed frequency tables and cross-checks, and printed results) plus targeted `grep` spot-checks for terminology drift. The script and its output were used only to produce this report — **no files in the repository were modified.**
**Result:** No files changed. `git status` before and after this audit is identical.

---

## Summary

The library is structurally very solid: 0 Zod validation failures, 0 duplicate slugs, 0 EN/RO/ES array-length mismatches, 0 missing descriptions, 100% `muscle_map_id` ↔ primary-muscle-group consistency, 100% kebab-case slug compliance, and 100% `gender_target: 'both'` consistency. The issues found are concentrated in a small number of specific exercises and in cross-batch terminology drift (expected, since the seven files were authored across separate sprints) rather than systemic schema problems.

| Severity | Count |
|---|---|
| Critical | 2 |
| High | 2 |
| Medium | 4 |
| Low | 2 |

---

## Critical

### C-1. True content duplicate: `face-pull` (back.ts) vs `cable-face-pull` (shoulders.ts)
Both entries describe the identical physical movement — a rope attachment pulled toward the face at a high cable pulley to target the rear delts and external rotators — and their `aliases` arrays literally cross-reference each other:
- `face-pull` (back.ts, `muscle_groups: ['back']`) has aliases `['cable face pull', 'rope face pull']`.
- `cable-face-pull` (shoulders.ts, `muscle_groups: ['shoulders']`) has aliases `['rope face pull', 'face pull']`.

The alias `"rope face pull"` is claimed by both exercises. A user searching "face pull," "cable face pull," or "rope face pull" would match two different library entries under two different primary muscle groups for what is functionally the same exercise, with near-identical instructions (only wording/hand-cross detail differs). This needs a product decision: merge into one canonical entry, or clearly differentiate them (e.g., one as "high pull, palms-in, back-biased cue" vs. an explicitly different "palms-in vs. rotate-to-external-rotation" variant) so they are not indistinguishable duplicates.

### C-2. Missing placeholder media on two flagship chest exercises
`barbell-bench-press` and `dumbbell-bench-press` (both in chest.ts) have `hero_image_url`, `demo_image_url`, and `video_url` all set to `null`, instead of following the `https://placeholder.mundofit.app/exercises/{group}/{slug}/{asset}` convention used by every other exercise in the library (152/154). These are two of the most fundamental, most-likely-to-be-viewed exercises in the entire database (the canonical barbell and dumbbell bench press), yet they are the *only* two entries that break the placeholder-media convention. Any UI component that renders a hero/demo image unconditionally (rather than guarding for `null`) would show a broken or blank state specifically for these two flagship exercises.

---

## High

### H-1. Overlapping near-duplicate: `landmine-press` (chest.ts) vs `landmine-single-arm-press` (shoulders.ts)
Both use identical equipment (`['barbell', 'landmine attachment']`), both are `unilateral: true`, `category: 'compound'`, `movement_pattern: 'push'`, `difficulty: 'intermediate'`, and — critically — each one's `aliases` array names the other:
- `landmine-press` (chest.ts) aliases include `'single-arm landmine press'`.
- `landmine-single-arm-press` (shoulders.ts) aliases include `'landmine press'` (i.e., the other exercise's exact name/slug-as-name).

The instructions do differ in a meaningful way (chest.ts version holds the bar at **chest height**; shoulders.ts version holds it at **shoulder height** on a more **diagonal** path), so these are arguably two legitimate variants with different primary-muscle emphasis. However, the alias overlap makes them indistinguishable to any alias-based search or autocomplete, and a reviewer/user has no way to tell from the names alone which is "the" landmine press. Recommend either renaming one alias set to remove the collision, or adding an explicit note in each description referencing the other as "compare to X for a different emphasis."

### H-2. Equipment/location tagging inconsistency for pure-dumbbell exercises
The rule "an exercise requiring only `['dumbbells']` (no bench/rack) is tagged `location: 'both'`" is applied consistently in `biceps.ts`, `triceps.ts`, `legs.ts`, and most of `forearms.ts` (e.g., `dumbbell-curl`, `hammer-curl`, `walking-lunge`, `dumbbell-wrist-curl` are all `'both'`). It is **not** applied in `shoulders.ts` or to one exercise in `forearms.ts`:
- `dumbbell-lateral-raise`, `dumbbell-front-raise`, `bent-over-dumbbell-rear-delt-fly` (shoulders.ts) — equipment `['dumbbells']` only, tagged `location: 'gym'`.
- `farmers-carry` (forearms.ts) — equipment `['dumbbells']` only, tagged `location: 'gym'`, while every other pure-dumbbell forearm exercise in the same file is `'both'`.

This is a self-inconsistent rule applied differently depending on which sprint/batch authored the file, and it directly affects any "home workout" filter in the app — these four exercises would be incorrectly excluded from a home-equipment filter despite requiring nothing but dumbbells.

---

## Medium

### M-1. Equipment string casing inconsistency: `"EZ bar"`
Every equipment string in the library is fully lowercase — `barbell`, `dumbbells`, `cable machine`, `smith machine`, `power rack`, `preacher bench`, `glute ham developer`, `belt squat machine`, `hand gripper`, `wrist roller`, `stability ball`, `landmine attachment`, `assisted pull-up machine`, `resistance band`, `parallel bars`, `weight plates`, `pull-up bar`, `towel` — except `"EZ bar"`, which is capitalized and used in 5 exercises (`ez-bar-curl`, `preacher-curl`, `spider-curl`, `ez-bar-skull-crusher`, `reverse-ez-bar-curl`, all in biceps.ts/triceps.ts). It is internally consistent with itself (always capitalized the same way), but it is the sole exception to an otherwise 100%-lowercase equipment-string convention across the other 21 equipment values. Any equipment-filter dropdown built by lowercasing/deduplicating strings, or any exact-match filter, would treat this as expected — but a case-sensitive display list would show one oddly-capitalized chip among 21 lowercase ones.

### M-2. Romanian ("name_ro") translation-convention split for "press" exercises
Two different Romanian conventions are used for the English word "press" depending on which batch authored the entry:
- **Noun-cognate convention** ("Presă X"): `Presă Arnold`, `Presă JM`, `Presă Tate`, `Presă la aparat pentru umeri`, `Presă landmine cu un braț`, `Presă pentru picioare`, `Presă pentru picioare, un picior`, `Presa Svend`, `Presa Spoto`.
- **Verb-phrase convention** ("Împins X"): `Împins cu bara la bancă plat`, `Împins cu bara deasupra capului`, `Împins cu gantere la umeri, șezând`, `Împins cu priză îngustă la bancă`, `Împins înclinat cu bara`, `Împins la aparat pentru piept`, `Împins landmine`, and roughly 15 more.

Both are valid Romanian, but a native-speaker reviewer would expect one consistent convention for the same underlying movement family (e.g., all bench/overhead/machine presses named the same way). As authored, the split correlates with *which sprint wrote the file* (eponymous/machine presses in later shoulders/biceps/triceps/legs batches lean "Presă"; the original chest.ts/shoulders.ts compound presses lean "Împins") rather than any semantic rule distinguishing them.

### M-3. `shoulders.ts` has zero `advanced`-difficulty exercises
Every other muscle-group file has at least one `advanced` entry (chest: 5, back: 3, legs: 8, biceps: 3, triceps: 3, forearms: 1), but `shoulders.ts` is 7 beginner / 8 intermediate / **0 advanced** across all 15 entries. This is not a data error — it simply means the shoulders batch never reached for a genuinely hard variant (e.g., no single-arm standing overhead press, no behind-the-neck press, no heavy Z-press) — but it is a coverage gap relative to every sibling file, worth a deliberate decision on whether a Part 2 shoulders batch should add an advanced movement.

### M-4. `sissy-squat` is the only isolation-category exercise using `movement_pattern: 'squat'` instead of `'isolation'`
Across all 154 exercises, every `category: 'isolation'` entry uses `movement_pattern: 'isolation'` **except** `sissy-squat` (legs.ts), which is `category: 'isolation'` + `movement_pattern: 'squat'`. This was a deliberate authoring choice (sissy squat is fundamentally a squat-pattern movement that isolates the quad rather than a single-joint curl/extension), and it's defensible, but it is the sole exception to an otherwise 100%-consistent category↔pattern pairing convention (70/70 other isolation entries pair with `'isolation'`), so it should get an explicit sign-off rather than being silently the only outlier.

---

## Low

### L-1. Heavy reuse of generic keyword phrases
Some `keywords` phrases are shared across many unrelated exercises: `"beginner friendly"` (15 exercises), `"constant tension"` (8), `"home workout"` (8), `"grip strength"` (7), `"upper chest"` (6), `"rear delts"` (6). This is expected and often desirable for a tag-based search/filter system, but a few phrases (`"beginner friendly"`, `"isolation"`) are generic enough to add little search-differentiation value on their own. No action needed unless the product intends `keywords` to be exercise-specific search terms rather than broad thematic tags — worth a one-line product decision to close out this observation either way.

### L-2. `"kettlebell"` appears exactly once, only as an alias, with no supported equipment tag
The only mention of "kettlebell" anywhere in the library is the alias `'kettlebell goblet squat'` on `goblet-squat` (legs.ts). There is no `kettlebell` equipment value anywhere in the 22 distinct equipment strings used across the library, and no dedicated kettlebell-based exercise exists. Not an error, but flags that kettlebell training — a very common piece of home/gym equipment — is not represented as a filterable equipment option despite being referenced in passing.

---

## What was checked and found clean

- **Zod validation:** all 154 entries valid against `exerciseSeedSchema`.
- **Duplicate slugs:** none, globally, across all 7 files.
- **Duplicate keyword arrays:** no exercise shares its *entire* keyword set with another.
- **Intra-exercise duplicate keywords/aliases:** none (no exercise repeats a keyword or alias within its own array).
- **Localization structural consistency:** `instructions_en/ro/es`, `mistakes_en/ro/es`, and `tips_en/ro/es` arrays have identical lengths across all three languages for every exercise; instruction `step` numbers are sequential from 1 in every language for every exercise.
- **Missing content:** no exercise is missing a description in any of the three languages.
- **`muscle_map_id` consistency:** 100% match against `{muscle_groups[0]}-primary` convention (0 mismatches across 154 entries).
- **Slug format:** 100% lowercase kebab-case ASCII compliance.
- **`gender_target`:** 100% `'both'` (no accidental gender restriction anywhere).
- **Terminology spot-checks (RO/ES):** no `genoflexiune` typo (only correct `genuflexiune`/`genuflexiuni`), no `haltere`/`mancuernas` inconsistency (dumbbells consistently `gantere`/`mancuernas`), no stray `pesas rusas` for kettlebell.
- **Equipment-vs-location logical checks:** no `bodyweight`-equipment exercise incorrectly tagged `location: 'gym'`; no gym-only-hardware exercise (barbell/machine/cable/smith/power-rack/etc.) incorrectly tagged `'home'` or `'both'`.
- **`hack-squat` (barbell, legs.ts) vs `machine-hack-squat` (machine, legs.ts):** distinct equipment and distinct slugs despite the shared "hack squat" name — already deliberately checked during authoring, confirmed not a duplicate.
- **`reverse-curl` (biceps.ts, barbell) vs `reverse-ez-bar-curl` (forearms.ts, EZ bar):** different equipment and different primary muscle group (biceps vs. forearms/brachioradialis emphasis) — overlapping movement family but not a duplicate.

---

## Recommendations (priority order)

1. Resolve C-1 (`face-pull` / `cable-face-pull`) — this is the only true duplicate-content finding and should be fixed before any production seed.
2. Backfill placeholder media for C-2 (`barbell-bench-press`, `dumbbell-bench-press`) to match the rest of the library.
3. Decide on H-1 (`landmine-press` / `landmine-single-arm-press`) — keep both with disambiguated aliases, or merge.
4. Sweep H-2's `location` field for pure-dumbbell exercises across all files for consistency (affects home-workout filtering correctness today).
5. M-1 through M-4 are cosmetic/coverage items — batch them into a future cleanup pass rather than blocking on them individually.
6. L-1/L-2 are informational; no action required unless the product owner wants stricter keyword/equipment taxonomy rules.
