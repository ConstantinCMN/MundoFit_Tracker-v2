# Exercise Count Investigation — 154 (source) vs. 95 (displayed)

**Date:** 2026-07-04 18:01
**Task:** Determine why the app displays only 95 exercises while `data/exercises/*` now contains 154. Read-only investigation — no files were modified.

---

## Root cause (confirmed)

**The live Supabase `exercises` table has only ever received 95 rows, seeded by two legacy hand-written SQL migrations. The 154-entry TypeScript seed data in `data/exercises/*.ts` has never been executed against the real database.** The count does not "drop" anywhere in a query, filter, or pagination sense — every layer of the app faithfully reads and displays whatever is actually in the database, and that number has always been 95, independent of how large `data/exercises/` has grown.

```
73 rows  (supabase/migrations/20240102000000_seed_exercises.sql)
+ 22 rows  (supabase/migrations/20240103000000_seed_exercises_phase3.sql)
─────────
  95 rows  ← exact match to the displayed count
```

`data/exercises/index.ts` (154 entries) and the live database (95 rows) are **two completely disconnected data sources**. The application was never wired to see the newer number because the one script that would bridge them, `scripts/seed-exercises.ts`, has never been run against production — a fact the project's own sprint reports state explicitly and repeatedly (see Evidence, below).

---

## Complete data flow trace

### 1. `data/exercises/*.ts` → `data/exercises/index.ts` (154 entries — correct, not the problem)
`data/exercises/index.ts:9-31` imports all seven per-muscle-group arrays and spreads them into `allExercises` with no filtering, slicing, or limiting:
```ts
export const allExercises: ExerciseSeedEntry[] = [
  ...chestExercises, ...backExercises, ...legsExercises,
  ...shouldersExercises, ...bicepsExercises, ...tricepsExercises, ...forearmsExercises,
];
```
Verified count: 154. This stage is not where the discrepancy originates.

### 2. `scripts/seed-exercises.ts` (never executed against the live database)
This script reads `allExercises` (line 13), validates every entry with `validateSeedBatch` (Zod), then upserts in batches of 50 on `onConflict: 'slug'` (lines 51-92). The `BATCH = 50` constant is only a chunk size for the upsert loop (`for (let i = 0; i < rows.length; i += BATCH)`) — every chunk is sent, so running this script would not silently drop any of the 154 rows.

**However, it has never actually been run against the shared Supabase project.** Every phase report from this sprint series says so directly:

> *"Seed validation: ✅ no duplicate slugs across the full `allExercises` set; live Supabase upsert (`scripts/seed-exercises.ts`) was **not** executed, since it writes to the shared database and requires explicit confirmation"*
> — `docs/reports/exercise-database-phase-2d.md` (identical wording in phases 1c, 1d, 1e, 2a, 2b, 2c)

> *"Live database seeding has still not been run for any Chest or Back batch — `data/exercises/` continues to be ahead of whatever is upserted in Supabase."*
> — same reports

This confirms the seed script was treated as a deliberate manual/gated step, never triggered as part of any of the sprints that built up `data/exercises/` from 27 → 47 → 62 → 80 → 98 → 113 → 133 → 154 entries.

### 3. The live Supabase database (confirmed: 95 rows, from two unrelated legacy migrations)
- `supabase/migrations/20240102000000_seed_exercises.sql` — 73 `INSERT` rows (verified by direct count), dated June 12.
- `supabase/migrations/20240103000000_seed_exercises_phase3.sql` — 22 `INSERT` rows (verified by direct count), dated June 21, header comment: *"Purely additive — 22 new rows"*.
- Both use `ON CONFLICT DO NOTHING`, and since no `slug`/unique-content constraint existed yet at the time they ran, all 95 rows inserted cleanly with no conflicts or silent drops.
- `supabase/migrations/20240107000000_extend_exercise_library.sql` (dated June 30) adds the v2 columns needed by the new schema — `slug`, `aliases`, `category`, `movement_pattern`, `instructions_*`, `mistakes_*`, `tips_*`, `keywords`, `muscle_map_id`, `hero_image_url`, `demo_image_url`, `video_url` — via `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`. This migration is **strictly additive: no `UPDATE`, `INSERT`, or `DELETE` statement touches the pre-existing 95 rows.** Their `slug` column (and every other newly added column) is left at its default (`NULL` / `'{}'` / `'[]'`) for all 95 legacy rows.
- Net effect: today, the live `exercises` table contains exactly 95 rows, none of which have ever been touched or supplemented by the new TypeScript seed data.

### 4. Query / repository layer — two parallel modules exist; only the old one is wired up
Two independent `getExercises` implementations exist in the codebase:

- **`lib/exercises/queries.ts`** — a newer, well-built, paginated query (`page`, `perPage = 50`, `.range(...)`, `count: 'exact'`, rich filters). This was built as part of the "Exercise Library Architecture" work but is **dead code**: `grep -rn "lib/exercises/queries"` across the entire repo returns zero import sites outside the file itself.
- **`lib/actions/exercises.ts:16-50`** — the older Server Action actually used by the app:
  ```ts
  export async function getExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
    const supabase = await createClient();
    let query = supabase.from('exercises').select('*').order('name_ro', { ascending: true });
    // ...filters only applied if explicitly passed...
    const { data, error } = await query;
    if (error) { console.error('getExercises error:', error.message); return []; }
    return data ?? [];
  }
  ```
  There is **no `.limit()` or `.range()` anywhere in this function** — it returns every row in the table when called with no filters.

### 5. API/page wiring — confirms the old, unpaginated action is what's live
`app/[locale]/(app)/workouts/library/page.tsx:2,17`:
```ts
import { getExercises } from '@/lib/actions/exercises';
...
const exercises = await getExercises();
```
The page calls the old action with zero arguments, so no filters are applied — it returns literally every row present in the `exercises` table (today: 95). The page also sets `export const dynamic = 'force-dynamic'` (line 5), which rules out stale ISR/route caching as a contributing factor — every request re-queries the database fresh, and the database itself is what's stuck at 95.

### 6. UI layer — passes the count straight through, no additional filtering by default
`components/workouts/exercise-library-client.tsx:49-65` computes `filtered` via `useMemo` over the `exercises` prop:
```ts
const filtered = useMemo(() => {
  const q = search.toLowerCase();
  return exercises.filter(ex => {
    if (q) { /* name search */ }
    if (muscle && !ex.muscle_groups.includes(muscle)) return false;
    if (difficulty && ex.difficulty !== difficulty) return false;
    if (location && location !== 'both') { /* ... */ }
    return true;
  });
}, [exercises, search, muscle, difficulty, location]);
```
`search`, `difficulty`, and `location` default to empty/`null`, and `muscle` defaults to `null` unless a `?muscle=` query param is present in the URL. With no active filters (the default library view), `filtered.length === exercises.length`. That number is displayed directly at line 85: `t('exerciseCount', { count: filtered.length })`. No hidden default filter reduces the count further — the UI is simply echoing what the server action returned.

---

## Exactly where the count "drops"

It doesn't drop within the application at all — **there is no code path anywhere (seed script, query layer, API, or UI) that clips a 154-row result down to 95.** The 95 figure is the raw size of the live `exercises` table, unchanged since June 21 (the last legacy SQL seed migration), because the mechanism that would grow it — `scripts/seed-exercises.ts` reading the now-154-entry `allExercises` — has been deliberately withheld from execution throughout every sprint that built up `data/exercises/`.

---

## Ruled out (checked directly, not just assumed)

- **Seed script batching/slicing** — read `scripts/seed-exercises.ts` in full; `BATCH = 50` only chunks the upsert loop, all rows are processed across chunks. Not a cause (and moot, since the script has never run against prod anyway).
- **RLS policy filtering rows** — the `exercises` read policy (`NOT is_custom OR created_by = auth.uid()`, per `docs/DATABASE.md`) applies identically to both the legacy 95 rows and would apply identically to the 154 TS rows if they existed in the DB (all `is_custom: false`). Not a differentiating mechanism.
- **`.limit()` / `.range()` capping results at 95** — `lib/actions/exercises.ts` (the function actually wired into the live page) has no limit/range at all; `lib/exercises/queries.ts` does have real pagination (`perPage = 50`) but is unreachable dead code with zero importers. No code path caps a large result set at exactly 95 — 95 is the true, uncapped table size.
- **Stale cache / ISR** — the library page declares `export const dynamic = 'force-dynamic'`, forcing a fresh query on every request. No caching layer is involved.
- **Default UI filters silently excluding rows** — `ExerciseLibraryClient`'s filters (`search`, `muscle`, `difficulty`, `location`) all default to empty/`null` on the base library view, so `filtered.length` equals the full server-returned array length with no reduction.
- **"95" as a coincidental earlier snapshot of `data/exercises/`** — the actual historical progression of `allExercises` across this sprint series was 27 → 47 → 62 → 80 → 98 → 113 → 133 → 154; **95 was never one of those milestones**. This rules out "the UI is just showing an old build" and confirms 95 is specifically the legacy-SQL-migration total (73 + 22), a number that exists only in the database, not in any past state of the TypeScript source.

---

## Key files/lines cited

| File | Relevance |
|---|---|
| `data/exercises/index.ts:9-31` | Aggregates 154 entries, no filtering — confirmed not the problem |
| `scripts/seed-exercises.ts:13,51-92` | Reads `allExercises`, batched upsert on `slug` — correct logic, never executed against prod |
| `supabase/migrations/20240102000000_seed_exercises.sql` | 73-row legacy SQL seed |
| `supabase/migrations/20240103000000_seed_exercises_phase3.sql` | 22-row legacy SQL seed (73+22=95) |
| `supabase/migrations/20240107000000_extend_exercise_library.sql:9-61` | Adds v2 columns, additive only, no backfill of the 95 legacy rows |
| `lib/actions/exercises.ts:16-50` | Live, unpaginated `getExercises` — no `.limit()`/`.range()`, returns raw table contents |
| `lib/exercises/queries.ts` | Newer paginated query module — built but never imported anywhere; dead code |
| `app/[locale]/(app)/workouts/library/page.tsx:2,5,17` | Calls the old action with no filters; `force-dynamic` rules out caching |
| `components/workouts/exercise-library-client.tsx:49-65,85` | Displays `filtered.length`, which equals the full prop length under default (no) filters |
| `docs/reports/exercise-database-phase-2d.md` (and 1c/1d/1e/2a/2b/2c) | Explicit, repeated confirmation that the live upsert was never executed |

---

## Note

Per instructions, nothing was changed to fix this — this report is diagnostic only. Two independent decisions would be needed to actually resolve the discrepancy (not attempted here): (1) whether/how to run `scripts/seed-exercises.ts` against the live database, given the 95 legacy rows have no `slug` populated and would not be matched or deduplicated by the script's `onConflict: 'slug'` upsert as currently written, and (2) whether to keep `app/[locale]/(app)/workouts/library/page.tsx` on `lib/actions/exercises.ts` or migrate it to the already-built (but unwired) paginated `lib/exercises/queries.ts` module.
