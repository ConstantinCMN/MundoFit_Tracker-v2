// Exercise seed script.
// Reads from data/exercises/index.ts, validates with Zod, and upserts into
// the Supabase exercises table using `slug` as the idempotency key.
//
// Usage:
//   npx tsx scripts/seed-exercises.ts
//
// Environment variables required:
//   SUPABASE_URL       — your Supabase project URL
//   SUPABASE_SERVICE_KEY — service_role key (bypasses RLS, never expose publicly)

import { createClient } from '@supabase/supabase-js';
import { allExercises } from '../data/exercises/index';
import { validateSeedBatch } from '../data/exercises/_schema';

const SUPABASE_URL        = process.env.SUPABASE_URL        ?? '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY ?? '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
  console.log(`\n── Exercise Seed ────────────────────────────────────`);
  console.log(`  Source entries : ${allExercises.length}`);

  // ── Validate ──────────────────────────────────────────────────────────────
  const { valid, invalid } = validateSeedBatch(allExercises);

  if (invalid.length > 0) {
    console.error(`\n  ✗ Validation failures (${invalid.length}):`);
    for (const { index, slug, error } of invalid) {
      console.error(`    [${index}] slug="${slug}" — ${error}`);
    }
  }

  if (valid.length === 0) {
    console.error('\n  No valid entries to seed. Aborting.');
    process.exit(1);
  }

  console.log(`  Valid entries  : ${valid.length}`);
  console.log(`  Invalid entries: ${invalid.length}`);

  // ── Upsert ────────────────────────────────────────────────────────────────
  // Upsert on slug — safe to re-run. Existing exercises are updated in place;
  // new exercises are inserted. Nothing is deleted.
  const rows = valid.map(entry => ({
    ...entry,
    is_custom:  false,
    created_by: null,
    // Normalise undefined → null so Postgres receives a clean INSERT.
    description_en:   entry.description_en   ?? null,
    description_ro:   entry.description_ro   ?? null,
    description_es:   entry.description_es   ?? null,
    category:         entry.category         ?? null,
    movement_pattern: entry.movement_pattern  ?? null,
    difficulty:       entry.difficulty        ?? null,
    exercise_type:    entry.exercise_type     ?? null,
    location:         entry.location          ?? null,
    muscle_map_id:    entry.muscle_map_id     ?? null,
    hero_image_url:   entry.hero_image_url    ?? null,
    demo_image_url:   entry.demo_image_url    ?? null,
    video_url:        entry.video_url         ?? null,
  }));

  const BATCH = 50; // Supabase recommends ≤ 500 rows per upsert call
  let inserted = 0;
  let updated  = 0;

  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);

    const { data, error } = await supabase
      .from('exercises')
      .upsert(batch, {
        onConflict:        'slug',
        ignoreDuplicates:  false, // always update existing rows
      })
      .select('id, slug');

    if (error) {
      console.error(`\n  ✗ Upsert error (batch ${i / BATCH + 1}): ${error.message}`);
      process.exit(1);
    }

    inserted += data?.length ?? 0;
    process.stdout.write('.');
  }

  console.log(`\n\n  ✓ Upserted ${inserted} exercises`);

  // ── Duplicate slug check ──────────────────────────────────────────────────
  const slugs = valid.map(e => e.slug);
  const seen  = new Set<string>();
  const dupes = slugs.filter(s => seen.has(s) || !seen.add(s));
  if (dupes.length > 0) {
    console.warn(`\n  ⚠ Duplicate slugs in source (first wins): ${dupes.join(', ')}`);
  }

  console.log(`\n── Done ─────────────────────────────────────────────\n`);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
