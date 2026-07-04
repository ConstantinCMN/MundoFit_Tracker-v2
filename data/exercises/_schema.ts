// Zod schema for seed entry validation.
// Run during `scripts/seed-exercises.ts` to catch bad data before it hits DB.

import { z } from 'zod';

const instructionStep = z.object({
  step: z.number().int().positive(),
  text: z.string().min(1),
});

export const exerciseSeedSchema = z.object({
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, 'slug must be lowercase kebab-case ASCII'),

  name_en: z.string().min(1),
  name_ro: z.string().min(1),
  name_es: z.string().min(1),

  description_en: z.string().nullable().optional(),
  description_ro: z.string().nullable().optional(),
  description_es: z.string().nullable().optional(),

  aliases:          z.array(z.string()).default([]),
  category:         z.enum(['compound','isolation','cardio','mobility','core','plyometric','olympic']).nullable().optional(),
  muscle_groups:    z.array(z.string()).min(1, 'at least one primary muscle required'),
  secondary_muscles: z.array(z.string()).default([]),
  equipment:        z.array(z.string()).min(1, 'at least one equipment item required'),
  difficulty:       z.enum(['beginner','intermediate','advanced']).nullable().optional(),
  exercise_type:    z.enum(['strength','cardio','flexibility','balance']).nullable().optional(),
  movement_pattern: z.enum(['push','pull','hinge','squat','carry','rotation','isolation','locomotion']).nullable().optional(),
  is_unilateral:    z.boolean().default(false),
  location:         z.enum(['gym','home','both']).nullable().optional(),
  gender_target:    z.enum(['male','female','both']).default('both'),

  instructions_en: z.array(instructionStep).default([]),
  instructions_ro: z.array(instructionStep).default([]),
  instructions_es: z.array(instructionStep).default([]),

  mistakes_en: z.array(z.string()).default([]),
  mistakes_ro: z.array(z.string()).default([]),
  mistakes_es: z.array(z.string()).default([]),

  tips_en: z.array(z.string()).default([]),
  tips_ro: z.array(z.string()).default([]),
  tips_es: z.array(z.string()).default([]),

  keywords:       z.array(z.string()).default([]),
  muscle_map_id:  z.string().nullable().optional(),
  hero_image_url: z.string().url().nullable().optional(),
  demo_image_url: z.string().url().nullable().optional(),
  video_url:      z.string().url().nullable().optional(),
});

export type ExerciseSeedEntry = z.infer<typeof exerciseSeedSchema>;

// Validates a single entry and returns typed result or throws with field path.
export function validateSeedEntry(raw: unknown): ExerciseSeedEntry {
  return exerciseSeedSchema.parse(raw);
}

// Validates an array of entries. Returns { valid, invalid } — invalid entries
// are logged but do not abort the seed so a partial run is possible.
export function validateSeedBatch(raws: unknown[]): {
  valid:   ExerciseSeedEntry[];
  invalid: { index: number; slug: unknown; error: string }[];
} {
  const valid:   ExerciseSeedEntry[] = [];
  const invalid: { index: number; slug: unknown; error: string }[] = [];

  for (let i = 0; i < raws.length; i++) {
    const result = exerciseSeedSchema.safeParse(raws[i]);
    if (result.success) {
      valid.push(result.data);
    } else {
      const raw = raws[i] as Record<string, unknown>;
      invalid.push({
        index: i,
        slug:  raw?.slug,
        error: result.error.issues.map(iss => `${iss.path.join('.')}: ${iss.message}`).join('; '),
      });
    }
  }

  return { valid, invalid };
}
