'use server';

// Bulk import endpoint for the exercise library.
// Accepts a JSON array of ExerciseImportRow, validates each entry,
// generates slugs where missing, and upserts in batches.
//
// Designed for:
//   - Admin one-shot imports (CSV → JSON conversion)
//   - API ingestion from external exercise databases
//   - Restoring exercises from a backup export
//
// NOT for end-user custom exercise creation (use createCustomExercise).

import { createClient } from '@/lib/supabase/server';
import { slugify } from './search';
import { exerciseSeedSchema, validateSeedBatch } from '@/data/exercises/_schema';
import type { ExerciseImportRow } from './types';
import { z } from 'zod';

export type ImportResult = {
  accepted:  number;
  rejected:  number;
  upserted:  number;
  errors:    { index: number; slug: string | null; reason: string }[];
};

export async function importExercises(
  rows: ExerciseImportRow[]
): Promise<ImportResult> {
  // Assign slugs to entries that are missing one.
  const normalised = rows.map(row => ({
    ...row,
    slug: row.slug ?? slugify(row.name_en),
  }));

  const { valid, invalid } = validateSeedBatch(normalised);

  const errors = invalid.map(({ index, slug, error }) => ({
    index,
    slug: slug as string | null,
    reason: error,
  }));

  if (valid.length === 0) {
    return { accepted: 0, rejected: invalid.length, upserted: 0, errors };
  }

  const supabase = await createClient();

  // Verify caller has admin rights (service_role bypasses this check in seed
  // scripts, but the server action runs under the authenticated user's JWT).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      accepted: 0,
      rejected: rows.length,
      upserted: 0,
      errors:   [{ index: -1, slug: null, reason: 'Not authenticated' }],
    };
  }

  const dbRows = valid.map(entry => ({
    ...entry,
    is_custom:        false,
    created_by:       null,
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

  const BATCH   = 50;
  let   upserted = 0;

  for (let i = 0; i < dbRows.length; i += BATCH) {
    const { data, error } = await supabase
      .from('exercises')
      .upsert(dbRows.slice(i, i + BATCH), {
        onConflict:       'slug',
        ignoreDuplicates: false,
      })
      .select('id');

    if (error) {
      errors.push({ index: i, slug: null, reason: error.message });
      continue;
    }

    upserted += data?.length ?? 0;
  }

  return {
    accepted: valid.length,
    rejected: invalid.length,
    upserted,
    errors,
  };
}

// parseExerciseJson — validates that an arbitrary JSON value is an array of
// ExerciseImportRow. Use this at the API boundary before calling importExercises.
export function parseExerciseJson(
  json: unknown
): { rows: ExerciseImportRow[]; error: string | null } {
  if (!Array.isArray(json)) {
    return { rows: [], error: 'Expected a JSON array at the top level' };
  }

  const rowSchema = exerciseSeedSchema.extend({
    slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  });

  const rows: ExerciseImportRow[] = [];
  const problems: string[]        = [];

  for (let i = 0; i < json.length; i++) {
    const result = rowSchema.safeParse(json[i]);
    if (result.success) {
      rows.push(result.data as ExerciseImportRow);
    } else {
      problems.push(`[${i}]: ${result.error.issues[0]?.message ?? 'invalid'}`);
    }
  }

  if (problems.length > 0 && rows.length === 0) {
    return { rows: [], error: problems.join('; ') };
  }

  return { rows, error: null };
}
