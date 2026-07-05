# Exercise Library — Final QA Audit

**Date:** 2026-07-05 11:22
**Role:** QA Engineer (per `.claude/agents/qa-engineer.md`)
**Scope:** Complete, fresh audit of the feature-complete exercise library — 194 exercises across `data/exercises/{chest,back,legs,shoulders,biceps,triceps,forearms,core,cardio}.ts`, aggregated via `data/exercises/index.ts`.
**Method:** Read-only. `AGENTS.md` and `.claude/agents/mundofit-expert.md` were read first per instructions. A temporary, throwaway `tsx` script imported every per-file array plus `allExercises` directly and computed frequency tables, duplicate checks, and schema validation (`validateSeedBatch`); it was deleted immediately after use, per the qa-engineer role's own rule against leaving verification scripts in the repo. `npm run type-check` was run and is clean. **No files were modified** — no new exercises were implemented, and no data was changed, since no finding rose to a level requiring an exception to that rule.

An earlier pass (`docs/reports/exercise-library-audit-v1.md`) audited the library at 154 exercises, before `core.ts` and `cardio.ts` existed. Every finding from that pass was re-verified fresh against the current 194-exercise state rather than assumed still accurate — see "Prior Findings Re-Verified" below. All of them are still present and unchanged; none were incidentally resolved by the core/cardio additions, and none were made worse by them.

---

## Result Summary

| Severity | Count |
|---|---|
| Critical | 0 |
| High | 4 |
| Medium | 5 |
| Low | 2 |
| Suggestions | 3 |

**Total exercises: 194.** Schema validation: 194/194 valid, 0 invalid. Duplicate slugs: 0. `npm run type-check`: clean. **Production readiness: ready to seed, with two High-severity content-quality items worth a deliberate decision before or shortly after launch — nothing here blocks shipping.**

---

## Critical

None found. Every load-bearing structural check passed:

- **Schema validation** — `validateSeedBatch(allExercises)` → 194 valid, 0 invalid.
- **Duplicate slugs** — 0 across all nine files combined; `allExercises.length` (194) exactly equals the sum of the nine per-file array lengths, confirming no silent double-count or drop in the aggregation.
- **`index.ts` wiring** — every one of the nine files has a correct `import { xExercises } from './x'`, is spread into `allExercises`, and is re-exported; zero stale commented-out stubs remain (the library was fully de-stubbed as each muscle group/category was completed).
- **`muscle_map_id` consistency** — 0 mismatches against the `{muscle_groups[0]}-primary` convention across all 194 entries.
- **Localization structural parity** — `instructions_en/ro/es`, `mistakes_en/ro/es`, and `tips_en/ro/es` array lengths match across all three languages for every entry; every instruction array's `step` numbers are sequential from 1 in every language for every entry; no entry is missing a description in any of the three languages.
- **Core integration** — all 20 `core.ts` entries have `muscle_groups[0] === 'core'` and `muscle_map_id === 'core-primary'`; 0 exceptions.
- **Cardio integration** — all 20 `cardio.ts` entries have `exercise_type === 'cardio'` (the first and only file using this value — every other file uses `'strength'`); 0 exceptions on `muscle_groups`/`muscle_map_id` either. `core.ts`'s `mountain-climber` and `cardio.ts`'s `mountain-climbers-cardio` do **not** collide on slug — confirmed distinct, as designed.
- **Future seed compatibility** — every entry has a unique, schema-valid, kebab-case slug; `scripts/seed-exercises.ts`'s `onConflict: 'slug'` upsert (unchanged since it was written) would process all 194 rows cleanly with zero batch-validation failures if run.
- **Supabase/migration compatibility** — cross-checked every field `exerciseSeedSchema` (`data/exercises/_schema.ts`) allows against the actual live migration files: the base table (`supabase/migrations/20240101000000_initial_schema.sql`) plus the v2 extension (`supabase/migrations/20240107000000_extend_exercise_library.sql`, which adds exactly 19 columns — `slug`, `aliases`, `category`, `movement_pattern`, `is_unilateral`, `instructions_en/ro/es` (3), `mistakes_en/ro/es` (3), `tips_en/ro/es` (3), `keywords`, `muscle_map_id`, `hero_image_url`, `demo_image_url`, `video_url`) together provide a column for every field the seed schema produces. No field the TypeScript data relies on is missing a corresponding column in the actual migration set. (The live database's *row count* — separate from this schema-compatibility question — was already investigated and resolved in `docs/reports/exercise-count-investigation.md`/`exercise-library-migration-plan.md`; not re-litigated here per scope.)

---

## High

### H-1. True content duplicate: `face-pull` (back.ts) vs. `cable-face-pull` (shoulders.ts) — unchanged from prior audit
Both entries still describe the identical movement (a rope attachment pulled toward the face at a high cable pulley for rear-delt/external-rotator work), and their `aliases` arrays still cross-reference each other:
- `face-pull` (back.ts, `muscle_groups: ['back']`): `aliases: ['cable face pull', 'rope face pull']`
- `cable-face-pull` (shoulders.ts, `muscle_groups: ['shoulders']`): `aliases: ['rope face pull', 'face pull']`

`"rope face pull"` is still claimed by both. A user searching any of "face pull" / "cable face pull" / "rope face pull" matches two library entries for what functions as one exercise. Re-classified from Critical (prior audit) to High this pass: it doesn't break schema, seeding, or the app — it's a content-quality issue, and with no production users yet (confirmed in a prior session), the cost of leaving it unresolved through launch is lower than it would be with live user data already referencing one of the two rows. Still worth a deliberate merge-or-differentiate decision before it accumulates real usage.

### H-2. Null media on the two flagship chest exercises — unchanged from prior audit
`barbell-bench-press` and `dumbbell-bench-press` (both chest.ts) still have `hero_image_url`, `demo_image_url`, and `video_url` all `null`, versus the placeholder convention followed by the other 192 entries. Re-verified this pass that **no current UI component actually renders these fields yet** (`grep -rn "hero_image_url\|demo_image_url\|video_url" components/ app/` returns zero hits outside `lib/exercises/{queries,import,types}.ts`) — so this is not an active rendering defect today, which is why it's High rather than Critical. It remains the single largest inconsistency in the dataset precisely because it affects the two most fundamental, most-likely-to-be-viewed exercises in the whole library, and it will become an active defect the moment exercise-detail UI (currently out of scope per `docs/ARCHITECTURE.md`'s module list) is built, unless backfilled first.

### H-3. Alias/name overlap: `landmine-press` (chest.ts) vs. `landmine-single-arm-press` (shoulders.ts) — unchanged from prior audit
Same equipment (`['barbell', 'landmine attachment']`), same `unilateral: true`/`compound`/`push`/`intermediate`, and each names the other in its `aliases` (`landmine-press` includes `'single-arm landmine press'`; `landmine-single-arm-press` includes `'landmine press'`). The instructions do differ meaningfully (chest-height hold vs. shoulder-height diagonal press), so these read as legitimate distinct variants — but the alias overlap still makes them indistinguishable to alias-based search.

### H-4. Pure-dumbbell `location` tagging inconsistency — unchanged from prior audit
`dumbbell-lateral-raise`, `dumbbell-front-raise`, `bent-over-dumbbell-rear-delt-fly` (all shoulders.ts) and `farmers-carry` (forearms.ts) are equipment-`['dumbbells']`-only but tagged `location: 'gym'`, while every equivalent pure-dumbbell exercise in `biceps.ts`, `triceps.ts`, `legs.ts`, and the rest of `forearms.ts` is `location: 'both'`. This directly affects the correctness of any future "home workout" filter — these four would be wrongly excluded despite needing nothing but dumbbells. `core.ts` and `cardio.ts` were checked and introduce no new instances of this pattern.

---

## Medium

### M-1. `"EZ bar"` remains the only capitalized equipment string
Still used in exactly 5 exercises (`ez-bar-curl`, `preacher-curl`, `spider-curl`, `ez-bar-skull-crusher`, `reverse-ez-bar-curl` — all biceps.ts/triceps.ts), against 33 other equipment values that are uniformly lowercase (`barbell`, `dumbbells`, `cable machine`, `smith machine`, `stationary bike`, `assault bike`, `rowing machine`, `ski erg machine`, etc.). Internally consistent with itself; the sole exception to an otherwise 100%-lowercase convention across all 34 distinct equipment strings now in use (cardio.ts alone added 11 new equipment values: `treadmill`, `bicycle`, `stationary bike`, `rowing machine`, `elliptical machine`, `stair climber machine`, `jump rope`, `pool`, `ski erg machine`, `assault bike`, `battle ropes` — all correctly lowercase, so the new batch didn't introduce a second casing inconsistency).

### M-2. Romanian "Presă" vs. "Împins" translation-convention split — unchanged, now with one more data point
Still split between the noun-cognate convention (`Presă Arnold`, `Presă JM`, `Presă Tate`, `Presă la aparat pentru umeri`, `Presă landmine cu un braț`, `Presă pentru picioare` (×2), `Presa Svend`, `Presa Spoto`) and the verb-phrase convention (`Împins cu bara la bancă plat`, `Împins cu bara deasupra capului`, and ~15 more). `core.ts`'s new `Pallof Press` entry was translated `"Presă Pallof"`, following the noun-cognate side of the existing split rather than resolving it — a fresh, correctly-consistent-with-precedent data point, but the underlying two-convention split itself remains unresolved.

### M-3. `shoulders.ts` still has zero `advanced`-difficulty exercises
Confirmed again this pass: 7 beginner / 8 intermediate / **0 advanced** across all 15 entries, the only file among all nine with no advanced tier at all (chest: 5, back: 3, legs: 8, biceps: 3, triceps: 3, forearms: 1, core: 4, cardio: 2 all have at least one). Not a data error — a content-coverage gap.

### M-4. `sissy-squat` remains the sole isolation-category exercise paired with `movement_pattern: 'squat'`
Confirmed still the only exception: 78 of 79 non-cardio isolation-category entries pair with `movement_pattern: 'isolation'`; `sissy-squat` (legs.ts) is `isolation` + `squat`. (The full category × movement_pattern cross-tab was re-run this pass and is otherwise entirely coherent, including the newly-added `cardio | locomotion` pairing (20/20, fully consistent) and `core | isolation` / `core | rotation` (8 and 2 respectively, matching `core.ts`'s static-hold vs. rotational-drill split exactly as designed.)

### M-5. `docs/DATABASE.md`'s documented `exercises` table definition is stale relative to the actual live migration — new finding this pass
`docs/DATABASE.md`'s `### \`exercises\`` section (lines ~256–283) shows only the *original* 17-column table from `20240101000000_initial_schema.sql` and does not mention any of the 19 columns `20240107000000_extend_exercise_library.sql` actually added (`slug`, `aliases`, `category`, `movement_pattern`, `instructions_*`, `mistakes_*`, `tips_*`, `keywords`, `muscle_map_id`, `hero_image_url`, `demo_image_url`, `video_url`). This is documentation drift, not a schema defect — the real migration file has every column the seed data needs (see Critical section, "Supabase/migration compatibility") — but a reader relying on `DATABASE.md` alone would incorrectly conclude the v2 exercise fields have no backing column. This is `documentation.md`'s domain to fix, not this audit's.

---

## Low

### L-1. Heavy keyword-phrase reuse — unchanged
`"beginner friendly"` (15 exercises), `"HIIT"` (now 6, up from 0 before cardio.ts/core.ts — expected growth, not a new problem), `"constant tension"` (8), `"home workout"` (8+). Expected/desirable for a tag-based search system; flagged only as a reminder that these are broad thematic tags, not exercise-unique search terms.

### L-2. `"kettlebell"` still appears exactly once, only as an alias, with no equipment tag
Still only `'kettlebell goblet squat'` on `goblet-squat` (legs.ts). No `kettlebell` equipment value exists anywhere across the now-34 distinct equipment strings, and no dedicated kettlebell exercise exists.

---

## Suggestions

1. **Equipment-filter UI reconciliation is now a bigger job than when last flagged.** The library now spans 34 distinct equipment strings (11 of them introduced by `cardio.ts` alone: `treadmill`, `bicycle`, `stationary bike`, `rowing machine`, `elliptical machine`, `stair climber machine`, `jump rope`, `pool`, `ski erg machine`, `assault bike`, `battle ropes`). Whoever builds the exercise-library equipment filter should reconcile against this full list before shipping it, not just the strength-training subset.
2. **Muscle-group filter taxonomy still needs reconciling**, per the (unrelated, already-completed) migration investigation: the UI's `MUSCLE_FILTERS` constant in `components/workouts/exercise-library-client.tsx` is hard-coded to a legacy taxonomy (`quads`, `lats`, `abs`, `traps`, `lower_back`) that doesn't match the new data's taxonomy (`quadriceps`, `back`, `core`, `glutes`, `hamstrings`, `calves`). Since `core.ts` is now populated with `muscle_groups: ['core']`, the UI's `"abs"` filter chip should be re-pointed to `"core"` once that reconciliation happens — noted here as a concrete, now-actionable follow-up rather than a hypothetical one.
3. **Consider a future schema distinction between discrete exercises and training protocols.** `cardio.ts`'s `hiit-training` and `liss-cardio` entries are valid, schema-conformant, and intentionally equipment-agnostic (per the brief), but they're conceptually a different kind of "exercise" than a single movement like `push-ups` or `barbell-curl`. Not a defect — just a modeling nuance worth a note if the schema is ever revisited (an `architect.md`-level decision, not something to act on now).

---

## Prior Findings Re-Verified (from `docs/reports/exercise-library-audit-v1.md`, at 154 exercises)

| Finding | Status now (194 exercises) |
|---|---|
| C-1: `face-pull` / `cable-face-pull` duplicate | Still present — re-classified High this pass (see H-1); not resolved, not worsened |
| C-2: null media on 2 chest exercises | Still present — re-classified High this pass (see H-2); confirmed no UI renders it yet, so not an active defect |
| H-1: `landmine-press` / `landmine-single-arm-press` overlap | Still present, unchanged (see H-3) |
| H-2: pure-dumbbell `location` inconsistency | Still present, unchanged; checked `core.ts`/`cardio.ts` for new instances — none found (see H-4) |
| M-1: `"EZ bar"` capitalization | Still present, unchanged (see M-1); no second inconsistency introduced by cardio's 11 new equipment tags |
| M-2: RO "Presă"/"Împins" split | Still present, unchanged; one new data point (`Pallof Press`) follows the "Presă" side (see M-2) |
| M-3: `shoulders.ts` zero advanced | Still true, unchanged (see M-3) |
| M-4: `sissy-squat` sole isolation+squat pairing | Still true, unchanged (see M-4) |
| L-1: keyword reuse | Still present, expanded proportionally with new content, not disproportionately (see L-1) |
| L-2: kettlebell alias-only | Still true, unchanged (see L-2) |

None of the ten prior findings were incidentally fixed by the core/cardio additions; none were made worse. Severity re-classification (Critical → High for two items) reflects a stricter "does this actually break something today" bar applied consistently across this pass, not new information suggesting the underlying issues are less real.

---

## Production Readiness

**Ready to seed as-is.** Zero Critical findings: schema is 100% valid, slugs are 100% unique, `index.ts` wiring is complete and stub-free, core/cardio integration is clean, `npm run type-check` is clean, and the actual database migration already has every column the seed data needs. The four High findings are content-quality/consistency items worth a deliberate decision (merge-or-differentiate the two duplicate pairs, backfill two placeholder URLs, fix four `location` tags) but none of them block shipping, and per the already-approved pre-beta plan (`docs/reports/exercise-library-migration-plan.md`), there is no production data at risk from addressing them whenever the team chooses to.

No fixes were applied in this audit — every finding is reported only, per instructions.
