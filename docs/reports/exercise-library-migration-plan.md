# Exercise Library Migration Plan

**Date:** 2026-07-04 18:08
**Task:** Design (do not execute) the safest strategy for migrating the live `exercises` table from the legacy 95-row dataset to the 154-entry TypeScript library in `data/exercises/*.ts`. This document is a plan only — no files were modified, no migration was run, no database was touched.

**Builds on:** `docs/reports/exercise-count-investigation.md` (root cause: the live table has never received the new TS seed data) and `docs/reports/exercise-library-audit-v1.md` (content-quality findings within the 154 new entries).

---

## Decision: **Option C — matched update + net-new insert + soft-deprecation** (not A, not plain B)

**Do not truncate. Do not blindly reseed. Do not run the existing seed script as-is against the untouched table.** The recommended strategy is a hybrid: identify which of the 95 legacy rows correspond to which of the 154 new entries, update those in place (preserving their database `id`), insert the genuinely new entries, and soft-deprecate (never hard-delete) any legacy row that has no new-format counterpart. Reasoning follows below, but the short version: **truncation is unsafe because of `ON DELETE CASCADE` foreign keys that would silently destroy real user workout data**, and **a naive reseed would create duplicates because the legacy rows have no `slug` to upsert-match against.**

---

## Why Option A (truncate + reseed) is rejected as the default approach

### Referential integrity risk (the decisive factor)
Three tables have foreign keys to `exercises.id`, and **all three cascade on delete**:

```sql
-- supabase/migrations/20240101000000_initial_schema.sql:204
exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE   -- workout_exercises

-- supabase/migrations/20240101000000_initial_schema.sql:247
exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE   -- session_sets

-- supabase/migrations/20240107000000_extend_exercise_library.sql:78
exercise_id uuid        NOT NULL REFERENCES exercises(id)  ON DELETE CASCADE   -- user_exercise_favorites
```

`workout_exercises` holds every exercise assigned to every user-built or generated workout template. `session_sets` holds every logged set from every completed workout session (per project memory, the Workout Session Engine — Phase 11 — is already active and is the current development focus, meaning real session data may already exist). `user_exercise_favorites` holds per-user favorites.

A `TRUNCATE exercises` (or `DELETE FROM exercises`) would cascade-delete every row in these three tables that references any of the 95 legacy exercise IDs — silently erasing real users' workout templates, their entire logged session history for those exercises, and their favorites, with no warning and no partial-failure signal. This is not a hypothetical edge case; it is the literal, documented behavior of the schema as written. A production-safe migration cannot risk this without first proving the blast radius is zero (see Phase 0 below), and even then, the safer path (Option C) makes the question moot rather than betting on an unverified assumption.

### Secondary reason: taxonomy mismatch would break the muscle-filter UI
The legacy 95 rows use a **different, finer-grained muscle-group taxonomy** than the new TypeScript data. Confirmed directly from the legacy seed SQL:

```
Legacy muscle_groups values (from supabase/migrations/20240102000000_seed_exercises.sql
and 20240103000000_seed_exercises_phase3.sql):
  quads, lats, abs, traps, lower_back, chest, shoulders, biceps, triceps,
  hamstrings, glutes, calves, forearms
```

versus the new TS taxonomy (`data/exercises/*.ts`):

```
chest, back, shoulders, biceps, triceps, forearms, quadriceps, glutes, hamstrings, calves
(core exists only as a secondary_muscles value so far — no dedicated core.ts file yet)
```

The library UI's muscle filter chips are hard-coded to the **legacy** taxonomy:

```ts
// components/workouts/exercise-library-client.tsx:25-29
const MUSCLE_FILTERS = [
  'chest', 'shoulders', 'biceps', 'triceps', 'forearms',
  'abs', 'quads', 'hamstrings', 'glutes', 'calves',
  'lats', 'traps', 'lower_back',
] as const;
```

If the legacy rows are truncated and replaced wholesale by the new rows, the "Quads," "Lats," "Traps," "Lower Back," and "Abs" filter chips would return **zero results** (the new schema uses `quadriceps` not `quads`, a unified `back` not `lats`/`traps`/`lower_back`, and has no `abs`/`core` primary-group exercises authored yet at all). This is a real UX regression, not just a data-hygiene concern, and it is orthogonal to the FK-safety issue above — even in a world with zero user data, Option A would still ship a broken filter UI on day one. This taxonomy reconciliation must happen regardless of which migration strategy is chosen; it is called out here because Option A gives no natural point in the process to address it, whereas Option C's matching phase does.

---

## Why plain Option B ("just update the existing 95 rows") does not work as literally stated

Updating rows in place is directionally correct (it's the core of the recommended Option C), but it cannot be done as a single blind operation for three concrete reasons:

1. **Count mismatch.** 95 legacy rows vs. 154 new entries. There is no 1:1 correspondence to "just update row N with entry N" — some legacy rows have no new-format counterpart (e.g., the ~8 legacy "abs" exercises — there is no `core.ts` yet), and the majority of the 154 new entries (all of shoulders, biceps, triceps, forearms, legs — 107 exercises) are net-new with no legacy row to update at all.
2. **No matching key exists yet.** The existing upsert logic in `scripts/seed-exercises.ts` and `lib/exercises/import.ts` both key on `onConflict: 'slug'`. The legacy rows' `slug` column was added by `supabase/migrations/20240107000000_extend_exercise_library.sql` as `ADD COLUMN IF NOT EXISTS slug text UNIQUE` with **no backfill** — every legacy row's `slug` is `NULL` today. Since `NULL` never matches `NULL` in a unique-conflict comparison, running the seed script unmodified against the untouched table would **not** update any of the 95 legacy rows — it would insert all 154 new rows as brand-new records, leaving the 95 legacy rows untouched and duplicated in spirit (e.g., "Barbell Bench Press" would exist twice: once as a rich, content-complete new row, once as the old thin legacy row with `null` media and empty `instructions`/`keywords`/`aliases` arrays). This is precisely the "avoiding duplicate data" risk called out in the task.
3. **Taxonomy mismatch (again).** Even where a legacy row and a new entry clearly describe the same movement, their `muscle_groups` values use different vocabularies (`quads` vs `quadriceps`), so a value-level `UPDATE ... WHERE muscle_groups = ...` match would silently fail even for true duplicates.

So "update existing rows" is the right instinct, but only once each legacy row has been explicitly matched to its corresponding new-entry slug — which is exactly what Option C's matching phase does before any update runs.

---

## The recommended approach in detail (Option C)

### Phase 0 — Non-destructive audit and backup (must run first, changes nothing)
1. **Reference audit (read-only):** count rows in `workout_exercises`, `session_sets`, and `user_exercise_favorites` that reference any of the 95 legacy exercise IDs. This establishes the actual blast radius before any other decision is finalized. If this comes back as zero across the board (plausible if the app is still pre-launch with no real user activity yet), the risk profile changes and a faster path becomes defensible — but the audit must be run and its result recorded, not assumed.
2. **Full backup:** take a Supabase point-in-time snapshot or `pg_dump` of at minimum the `exercises`, `workout_exercises`, `session_sets`, and `user_exercise_favorites` tables before touching anything. This is the rollback anchor (see Rollback Strategy below) regardless of what Phase 0's audit finds.
3. **Environment check:** confirm whether a staging/branch Supabase project exists. If so, the entire plan below should be rehearsed there first, with row-count and spot-check verification, before touching the production project.

### Phase 1 — Taxonomy reconciliation (decision, not code change here)
Adopt the new, coarser TypeScript taxonomy (`chest`, `back`, `shoulders`, `biceps`, `triceps`, `forearms`, `quadriceps`, `glutes`, `hamstrings`, `calves`, with `core`/`abs` deferred until a `core.ts` file exists) as canonical going forward. This plan does not modify `components/workouts/exercise-library-client.tsx`, but flags as a **required follow-up** (tracked separately, executed only after this migration lands): update `MUSCLE_FILTERS` to drop `quads`/`lats`/`traps`/`lower_back`/`abs` and align with the new vocabulary, so the filter UI matches whatever taxonomy actually ends up in the table. Until a `core.ts` batch exists, the "Abs" filter chip will have no corresponding new-schema content no matter what — that is a content gap, not a migration bug, and should be tracked as a roadmap item (a future core/abs sprint), not solved by this migration.

### Phase 2 — Matching pass (read-only analysis, produces a mapping artifact, not a DB write)
For each of the 95 legacy rows, attempt to identify its corresponding new-entry slug:
- Compute `slugify(legacy.name_en)` (the existing utility in `lib/exercises/search.ts:8-16`) and check for an exact match against the 154 new slugs. This is expected to resolve a meaningful fraction automatically, especially for **chest and back exercises** — per project memory, `data/exercises/chest.ts` and `back.ts` were explicitly authored to be the tri-lingual, structured replacement for the old ad-hoc SQL seed data covering those same muscle groups, so the highest-confidence, highest-value matches are concentrated there.
- For anything that doesn't resolve via exact `slugify` match (different equipment framing, reworded name, or a legacy row whose muscle group doesn't exist in the new schema yet — e.g. all `abs` rows), fall back to a manual, human-reviewed mapping rather than fuzzy/approximate auto-matching. **A wrong automatic match is worse than a duplicate**, because it would silently attach a real user's workout history to the wrong exercise's rich content (e.g., mismatching "Barbell Row" history onto "Barbell Curl"). Any ambiguous case (multiple plausible candidates, or no candidate above a confidence threshold) is routed to manual review, not auto-resolved.
- Output of this phase: a mapping table of `{ legacy_id, legacy_name_en, matched_slug | null, confidence, reviewed_by }`. Rows with `matched_slug: null` after manual review are the confirmed "unmatched legacy" set handled in Phase 5.

### Phase 3 — Slug backfill (single, reversible, transaction-wrapped UPDATE)
For every row in the Phase 2 mapping with a confirmed `matched_slug`, run:
```sql
UPDATE exercises SET slug = $matched_slug WHERE id = $legacy_id;
```
wrapped in a single transaction, preceded by a dry-run `SELECT` diff (old row vs. what the new content will look like) for manual sign-off. This step only ever touches the `slug` column — no content is overwritten yet, and no row identity changes, so nothing downstream (FKs) is affected at all by this step in isolation.

### Phase 4 — Run the existing seed script (now safe to execute as-is)
With slugs backfilled, `scripts/seed-exercises.ts` — whose upsert-on-`slug` logic (lines 51-92, `onConflict: 'slug'`, batches of 50) was already correctly written, just never executed against production — now behaves exactly as intended:
- The ~N legacy rows with a freshly-backfilled matching slug get **updated in place**: their `id` is preserved (so every `workout_exercises`/`session_sets`/`user_exercise_favorites` row that references them stays valid with zero cascade risk), while every content column (`aliases`, `category`, `movement_pattern`, `instructions_*`, `mistakes_*`, `tips_*`, `keywords`, `muscle_map_id`, `hero_image_url`, `demo_image_url`, `video_url`, and the corrected `muscle_groups` taxonomy) is replaced with the rich, production-ready new content.
- The remaining new entries with no legacy counterpart (net-new shoulders/biceps/triceps/forearms/legs exercises, plus any genuinely new chest/back entries) are **inserted** as fresh rows, exactly as the script already does for any unmatched slug.
- No duplicate content results, because every new slug that has a legacy counterpart now resolves to an `UPDATE` of that same row rather than a second `INSERT`.

### Phase 5 — Soft-deprecate (never hard-delete) unmatched legacy rows
For legacy rows confirmed in Phase 2 to have no new-format counterpart (expected: the ~8 "abs" rows, since no `core.ts` exists yet, plus any other stragglers):
- Add a small, purely additive migration introducing `is_active boolean NOT NULL DEFAULT true` (or `deprecated_at timestamptz`) on `exercises`.
- Set `is_active = false` on the confirmed-unmatched rows. This removes them from the default library view (once `lib/actions/exercises.ts`'s `getExercises` is updated to filter `is_active = true` — a follow-up code change, not part of this migration's DB step) **without deleting the row**, so any historical `workout_exercises`/`session_sets`/`user_exercise_favorites` reference remains fully valid.
- Hard deletion of these deprecated rows is explicitly **out of scope** for this migration. It becomes safe to consider only after (a) a fresh Phase-0-style reference audit on those specific rows comes back zero, and (b) a defined grace period has passed (e.g., one full release cycle) — tracked as a separate, later, low-risk cleanup task.

### Phase 6 — Post-migration verification (read-only)
- Confirm `exercises` row count equals `154 + (count of unmatched, now-deprecated legacy rows)`, with zero net content duplication (no two rows sharing a `name_en` + `muscle_groups` combination that should have been merged).
- Confirm `workout_exercises`, `session_sets`, and `user_exercise_favorites` row counts are **identical** before and after the migration — this is the concrete proof that no cascade deletion occurred.
- Re-run a slug-uniqueness and Zod-shape check (reusing the same validation approach as `scripts/seed-exercises.ts` and the exercise-library audit) directly against the live table's contents.
- Smoke-test every entry in the (updated) `MUSCLE_FILTERS` list against the live table to confirm each filter returns at least one result (or is deliberately empty, e.g., "Abs" until `core.ts` exists, and that emptiness is a known, accepted state rather than a silent regression).

---

## Preserving schema

No destructive schema change is required or recommended. The `exercises` table already has every column the new content needs (added by `20240107000000_extend_exercise_library.sql`, additive-only, already live). The only schema addition this plan introduces is the optional `is_active`/`deprecated_at` column in Phase 5, which is itself purely additive (`ADD COLUMN IF NOT EXISTS ... DEFAULT true`), non-breaking, and trivially reversible (`ALTER TABLE exercises DROP COLUMN is_active`, safe since nothing else would yet depend on it if the migration were aborted early).

## Avoiding duplicate data

Handled structurally by Phase 2 (matching) + Phase 3 (slug backfill) before Phase 4 (seed) ever runs: every new-entry slug that has a legacy counterpart resolves to an `UPDATE`, not an `INSERT`, because the upsert's `onConflict: 'slug'` will now find a matching row. This is the direct fix for the count-mismatch/no-matching-key problem identified above under "why plain Option B doesn't work."

## Maintaining referential integrity

Handled structurally by never deleting a legacy row that has live FK references (Phase 5's soft-deprecation instead of hard delete), and by preserving `id` continuity for every matched row (Phase 3/4 update `slug` and content in place, never re-insert-then-delete). The only genuinely destructive operation this plan ever contemplates (hard-deleting confirmed-orphaned, unmatched legacy rows) is explicitly deferred to a separate, later, audited cleanup step outside this migration's scope.

## Future seed updates

Once Phase 3's slug backfill lands, `scripts/seed-exercises.ts`'s existing upsert-on-slug logic becomes a safe, idempotent, repeatable operation for all future sprints (a future `core.ts`, `cardio.ts`, or additional batches to any existing file). Recommend the seed script graduate from "manually gated, explicit-confirmation-required, never actually run" (its status throughout every sprint report in this series) to a standing, documented step in the release checklist for any change under `data/exercises/`, since after this migration it can no longer duplicate or destroy data by construction — every future run either inserts a genuinely new slug or updates an existing one in place.

## Production safety

- Rehearse the entire plan against a staging/branch Supabase project first, if one exists (Phase 0, step 3).
- Every content-mutating step (Phase 3's slug backfill, Phase 4's seed run, Phase 5's deprecation flag) runs inside an explicit transaction with a pre-commit dry-run diff.
- `scripts/seed-exercises.ts` requires `SUPABASE_SERVICE_KEY` (bypasses RLS) — this remains a privileged, manually-run operation, never exposed to client-side or end-user code paths.
- Row-count and FK-reference invariants (Phase 6) are checked and recorded before considering the migration complete.

## Rollback strategy

Because this plan is built around `UPDATE`-in-place rather than `DELETE`+`INSERT`, rollback is simple and low-risk at every phase:
- **Phase 3 (slug backfill) or Phase 4 (content seed) needs reverting:** restore just the affected rows' pre-migration column values from the Phase 0 backup — since `id`s were never changed and no rows were deleted, this is a targeted `UPDATE ... FROM backup_snapshot` rather than a full destructive table restore.
- **Phase 5 (deprecation flag) needs reverting:** trivial — `UPDATE exercises SET is_active = true WHERE id IN (...)`, no data was ever destroyed.
- **Worst case, full rollback:** restore the Phase 0 snapshot wholesale. Because no cascade deletes ever occurred under this plan (unlike Option A), the restore only needs to touch the `exercises` table itself — `workout_exercises`, `session_sets`, and `user_exercise_favorites` were never modified by this migration and need no separate restoration.

This is the single biggest practical advantage of Option C over Option A: **truncate+reseed's rollback would require restoring not just `exercises` but every cascade-affected table, and any writes that happened to those tables between the truncate and the restore would be unrecoverable**; Option C never puts those tables at risk in the first place, so there is nothing to roll back in them.

---

## Summary table

| Consideration | Option A (truncate + reseed) | Option B (naive update) | **Option C (recommended)** |
|---|---|---|---|
| Preserves schema | Yes | Yes | Yes (one small additive column) |
| Removes legacy rows | Yes (destructively) | No | Deprecates (soft), defers hard-delete |
| Avoids duplicate data | Yes, but only by destroying history | **No** — slug is NULL on legacy rows, causes duplicate inserts | Yes, via matched slug backfill |
| Referential integrity | **Broken — cascades delete user data** | Preserved, but only where update happens to hit the right row | Preserved — every matched row keeps its `id` |
| Future seed updates | Works, but repeats this risk every time schema/data reshuffles | N/A (not a repeatable process) | Becomes safe and idempotent forever after |
| Production safety | Unacceptable without proven zero-reference guarantee | Insufficient on its own | Backed by audit, transactions, staged rehearsal |
| Rollback | Requires restoring 4 tables, unrecoverable writes in between | Ambiguous (which rows changed?) | Simple, targeted, `exercises`-only |

**Decision: Option C.**
