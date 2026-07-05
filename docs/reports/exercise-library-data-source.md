# Exercise Library — Where the UI Actually Gets Its Data

**Date:** 2026-07-05 11:57
**Role:** MundoFit Expert (per `.claude/agents/mundofit-expert.md`)
**Task:** Trace the complete data flow for the Exercise Library page, from UI to source, and determine why it shows 95 exercises instead of 194. Read-only — no files modified.

This restates and re-verifies (fresh against the current repo, not from memory) the same conclusion already reached in `docs/reports/exercise-count-investigation.md`, since nothing in the relevant code paths has changed since that investigation.

---

## 1. Does the UI read from Supabase or from `data/exercises`?

**Supabase.** The `data/exercises/*.ts` files (194 entries via `data/exercises/index.ts`'s `allExercises`) are seed *source* data — they are not imported by any page or component. Confirmed by grep: the only file anywhere in `app/`, `components/`, or `lib/` that references `data/exercises` is `lib/exercises/import.ts` (a bulk-import Server Action that is itself never called from anywhere in the app — `grep -rn "importExercises"` returns only its own definition). The Exercise Library page has no code path that reads `data/exercises/` at all.

## 2. Which file performs the query?

`lib/actions/exercises.ts:16-50`, function `getExercises`:

```ts
export async function getExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
  const supabase = await createClient();
  let query = supabase.from('exercises').select('*').order('name_ro', { ascending: true });
  // ...filters applied only if explicitly passed...
  const { data, error } = await query;
  if (error) { console.error('getExercises error:', error.message); return []; }
  return data ?? [];
}
```

No `.limit()`, no `.range()` — it returns every row currently in the Supabase `exercises` table. It's wired in at `app/[locale]/(app)/workouts/library/page.tsx:2,17`:

```ts
import { getExercises } from '@/lib/actions/exercises';
...
const exercises = await getExercises();
```

called with zero arguments, so no filter narrows the result — whatever is in the table is what renders. The page also sets `export const dynamic = 'force-dynamic'` (line 5), ruling out a stale cache as a contributing factor.

Note there is a second, newer, better-built query module — `lib/exercises/queries.ts`, a paginated `getExercises(filters, page, perPage=50)` — but it has zero importers anywhere in the repo (`grep -rn "lib/exercises/queries"` returns only its own file). It is dead code, not the one the page actually uses.

## 3. Why does the UI still show 95 instead of 194?

The live Supabase `exercises` table has only ever received 95 rows, from two legacy hand-written SQL migrations:
- `supabase/migrations/20240102000000_seed_exercises.sql` — 73 rows
- `supabase/migrations/20240103000000_seed_exercises_phase3.sql` — 22 rows
- 73 + 22 = **95**

The bridge that would grow it — `scripts/seed-exercises.ts`, which reads `allExercises` (now 194, confirmed fresh this pass) and upserts on `slug` — has never been executed against the live database. This isn't a code defect: the script is correct, and every sprint report across the exercise-library series states this was a deliberate, gated omission (*"live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation"* — repeated verbatim across 9 report files, reconfirmed present this pass). The 194-entry TypeScript source and the 95-row live table are simply two disconnected data sources, and the page reads only the latter.

## 4. What is the next required implementation step?

Run `scripts/seed-exercises.ts` against the live Supabase project (`SUPABASE_URL` / `SUPABASE_SERVICE_KEY` set) to actually seed the 194 exercises.

This is a database-writing, execution-gated action — per `AGENTS.md`, changes of this kind need explicit approval/confirmation before running, not a unilateral action. The approach itself is already decided: `docs/reports/exercise-library-migration-plan.md`, given the confirmed absence of any production users or real workout data, concluded that a **truncate + reseed** is now the correct pre-beta path (superseding that report's original more cautious match-and-update plan, which was designed to protect production data that turned out not to exist). The next concrete step is executing that approved plan — truncate the `exercises` table, then run `scripts/seed-exercises.ts` — not re-deciding the strategy again.

Two secondary follow-ups noted for completeness, not blocking the reseed itself:
- `lib/actions/exercises.ts`'s `getExercises` has no pagination; at 194 rows this is not yet a problem, but the already-built, unused `lib/exercises/queries.ts` exists for when it becomes one.
- The `location`/muscle-taxonomy fixes already applied to the TypeScript source (`docs/reports/exercise-library-final-fixes.md`) will only reach the live table once this reseed runs.

---

## Current data source
The Exercise Library page (`app/[locale]/(app)/workouts/library/page.tsx`) reads from **Supabase** via `lib/actions/exercises.ts`'s `getExercises()` — an unpaginated `select('*')` on the `exercises` table — not from `data/exercises/*.ts`.

## Root cause
The live Supabase `exercises` table still holds only the 95 rows seeded by two legacy SQL migrations (73 + 22); `scripts/seed-exercises.ts`, which would upsert the current 194-entry `data/exercises/` source into that table, has never been executed against it.

## Next step
Execute the already-approved pre-beta plan (`docs/reports/exercise-library-migration-plan.md`): truncate the `exercises` table and run `scripts/seed-exercises.ts` against the live database to seed all 194 exercises. This requires explicit approval/execution — it's a database-writing action, not something to run unilaterally.
