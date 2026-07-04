# Exercise Library Foundation — Architecture Sprint

**Date:** 2026-06-30  
**Type:** Architecture / Infrastructure  
**Status:** COMPLETE — foundation only, no exercise content added  

---

## Executive Summary

The exercise library has been re-architected from a flat SQL seed table into a scalable, type-safe, content-rich system capable of holding 1 000+ exercises without structural changes. The existing ~100 seeded exercises are untouched. The new schema adds 17 columns to the `exercises` table (all additive, no breaking changes), introduces a `user_exercise_favorites` join table, and establishes a TypeScript-first authoring workflow where exercise content is written in `.ts` files, validated with Zod, and upserted via a single seed script. A bulk-import path accepts external JSON and validates it through the same schema before writing to the database.

---

## What Was Built

| Artifact | Path | Purpose |
|---|---|---|
| DB migration | `supabase/migrations/20240107000000_extend_exercise_library.sql` | Adds 17 columns + user_exercise_favorites table |
| Type system | `lib/exercises/types.ts` | All domain types: enums, shapes, filters, sort |
| Server queries | `lib/exercises/queries.ts` | Paginated list, rich single, favorites, custom CRUD |
| Client search | `lib/exercises/search.ts` | Pure filter/sort/slug/locale utilities |
| Seed schema | `data/exercises/_schema.ts` | Zod schema + batch validation |
| Example data | `data/exercises/chest.ts` | 2 fully-populated exercises proving the shape |
| Aggregator | `data/exercises/index.ts` | Single import point for all exercise modules |
| Seed script | `scripts/seed-exercises.ts` | CLI runner: validate → upsert on `slug` |
| Import module | `lib/exercises/import.ts` | Server action for JSON bulk import |
| DB types | `types/database.ts` | Updated Row/Insert + user_exercise_favorites |

---

## Database Schema Changes

### `exercises` table — new columns

| Column | Type | Purpose |
|---|---|---|
| `slug` | `text UNIQUE` | Stable upsert key. Kebab-case ASCII. e.g. `barbell-bench-press` |
| `aliases` | `text[]` | Alternative names included in search |
| `category` | `text` | Functional classification: compound, isolation, cardio, mobility, core, plyometric, olympic |
| `movement_pattern` | `text` | Kinetic chain loading: push, pull, hinge, squat, carry, rotation, isolation, locomotion |
| `is_unilateral` | `boolean` | True when each side trains independently |
| `instructions_en/ro/es` | `jsonb` | `[{step: N, text: "..."}]` per locale |
| `mistakes_en/ro/es` | `jsonb` | `["mistake 1", "mistake 2"]` per locale |
| `tips_en/ro/es` | `jsonb` | `["tip 1", "tip 2"]` per locale |
| `keywords` | `text[]` | Free-form search terms — GIN indexed |
| `muscle_map_id` | `text` | Maps to `public/exercises/muscle-maps/{id}.svg` |
| `hero_image_url` | `text` | Supabase Storage path or CDN URL |
| `demo_image_url` | `text` | Supabase Storage path or CDN URL |
| `video_url` | `text` | Reserved — YouTube/Vimeo URL or Storage path |

### New table: `user_exercise_favorites`

```sql
CREATE TABLE user_exercise_favorites (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id)  ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);
```

RLS: owner-only read/write. GIN index on `user_id`. No cascade delete of the exercise — removing a library exercise soft-removes favorites via `ON DELETE CASCADE` on `exercise_id`.

### New indexes

| Index | Type | Column(s) |
|---|---|---|
| `idx_exercises_slug` | btree | `slug` |
| `idx_exercises_category` | btree | `category` |
| `idx_exercises_movement` | btree | `movement_pattern` |
| `idx_exercises_keywords` | GIN | `keywords` |
| `idx_exercises_aliases` | GIN | `aliases` |

---

## Type System

### Enum types (`lib/exercises/types.ts`)

```typescript
type ExerciseCategory = 'compound' | 'isolation' | 'cardio' | 'mobility' | 'core' | 'plyometric' | 'olympic';
type MovementPattern  = 'push' | 'pull' | 'hinge' | 'squat' | 'carry' | 'rotation' | 'isolation' | 'locomotion';
```

### Shape hierarchy

```
ExerciseSummary          — 20 fields, minimal. For paginated lists of 1000+ rows.
  └── ExerciseWithFavorite  — + is_favorite boolean. Join with user_exercise_favorites.
  └── ExerciseLocale        — + resolved single-locale name/description/content.

ExerciseRich             — ExerciseSummary + all content + media. For detail views.
  └── ExerciseSeedEntry    — ExerciseRich without id/created_at/updated_at. For authoring.
  └── ExerciseImportRow    — ExerciseSeedEntry with optional slug. For bulk import.
```

**Key design decision:** list queries select only `ExerciseSummary` columns, never fetching instructions/tips/mistakes. A detail view fetches `ExerciseRich` by ID or slug. This keeps list queries fast even at 1 000+ exercises.

### Filter & sort types

`ExerciseFilters` covers all 12 filterable dimensions (search, muscle, equipment, difficulty, category, movement pattern, location, unilateral, favorite, custom, secondary muscle, exercise type).

---

## Folder Structure

```
lib/
  exercises/
    types.ts          ← all domain types (no imports from supabase)
    queries.ts        ← 'use server' — Supabase reads/writes
    search.ts         ← pure client-side filter/sort/slug utilities
    import.ts         ← 'use server' — bulk JSON import action

data/
  exercises/
    _schema.ts        ← Zod validation schema + validateSeedBatch()
    chest.ts          ← chest exercises (2 fully populated, rest to follow)
    index.ts          ← aggregator — one import point for all modules

scripts/
  seed-exercises.ts   ← CLI: validate → upsert exercises to Supabase

public/
  exercises/
    muscle-maps/      ← SVG files, keyed by muscle_map_id
    heroes/           ← hero background images (webp, keyed by slug)
    demos/            ← demo images (webp, keyed by slug)
```

---

## Seed Strategy

Exercises are authored as TypeScript objects in `data/exercises/{muscle-group}.ts`. Each object is typed as `ExerciseSeedEntry` and validated with Zod before writing to the database.

### Upsert key: `slug`

`slug` is the stable idempotency key. It is:
- authored by hand (`barbell-bench-press`)
- assigned via `slugify(name_en)` when importing externally
- used in `ON CONFLICT (slug)` upsert so the seed script is safe to re-run

### Running the seed

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_KEY=eyJhbGci... \
npx tsx scripts/seed-exercises.ts
```

Output:
```
── Exercise Seed ─────────────────────────────────────
  Source entries : 2
  Valid entries  : 2
  Invalid entries: 0
..
  ✓ Upserted 2 exercises
── Done ─────────────────────────────────────────────
```

### Adding a new muscle group

1. Create `data/exercises/legs.ts` — export `legsExercises: ExerciseSeedEntry[]`
2. Uncomment the import line in `data/exercises/index.ts`
3. Run the seed script

No schema changes, no migration needed.

### Incremental content authoring

Every content field (`instructions_*`, `mistakes_*`, `tips_*`, `video_url`, `hero_image_url`) is optional in `ExerciseSeedEntry`. A minimal exercise entry requires only: `slug`, `name_*`, `muscle_groups`, `equipment`. Content can be enriched in subsequent seed runs — the upsert overwrites all fields.

---

## Import Strategy

### External JSON import

`lib/exercises/import.ts` exposes two server actions:

**`parseExerciseJson(json: unknown)`**  
Validates that an arbitrary JSON value is a valid array of exercise rows. Use at the API boundary before calling `importExercises`.

**`importExercises(rows: ExerciseImportRow[])`**  
Validates, normalises (generates slugs where missing), and upserts in batches of 50. Returns `{ accepted, rejected, upserted, errors }`.

### Batch size

50 rows per Supabase upsert call. At 1 000 exercises, this is 20 calls — fast and within Supabase's request limits.

### Slug collision

If two import rows produce the same slug (from different `name_en` values), the second row overwrites the first. The seed script logs a warning. Authors must ensure slug uniqueness within a batch.

### Future: REST import endpoint

Wire `parseExerciseJson` → `importExercises` behind a protected API route:

```
POST /api/admin/exercises/import
Content-Type: application/json
Authorization: Bearer <service_key>

[{ "slug": "...", "name_en": "...", ... }]
```

---

## Scalability Analysis

| Concern | Approach |
|---|---|
| 1 000+ rows in list | Paginated server queries (50/page), summary projection only |
| Full-text search | GIN on `keywords` + `aliases` for array-contains queries; `ilike` on names for substring |
| Multilingual content | Columns per locale for names (fast indexed); JSONB per locale for rich content (no index needed — only fetched on detail view) |
| Media assets | URL references only — files live in Supabase Storage or CDN. DB stores the path, not the bytes |
| SVG muscle maps | `muscle_map_id` → `public/exercises/muscle-maps/{id}.svg`. Multiple exercises share one map — keeps file count low |
| Custom exercises | `is_custom = true`, `created_by = user.id`. RLS separates library from user exercises. Same table, same types |
| Favorites | Separate `user_exercise_favorites` join table. Hydrated post-query on list results. Avoids a LEFT JOIN on every list page load |

---

## What Was NOT Built

- Exercise content beyond 2 chest examples — intentionally deferred
- Exercise detail UI — out of scope for this sprint
- Muscle map SVG files — paths established, files not yet created
- REST import API route — logic is in `lib/exercises/import.ts`, route not wired
- Search index / full-text search (PostgreSQL `tsvector`) — GIN on keyword arrays is sufficient for phase 1; `tsvector` is the upgrade path when substring search becomes a bottleneck
- Admin panel — deferred

---

## Migration Execution

```bash
# Apply via Supabase SQL Editor or CLI
supabase db push

# Or paste migration content directly into Supabase SQL Editor:
# supabase/migrations/20240107000000_extend_exercise_library.sql
```

The migration is additive — all new columns have defaults, so existing rows receive valid values without a backfill.

---

## Build Status

- **TypeScript:** ✅ Clean (`tsc --noEmit` — no output, exit 0)
