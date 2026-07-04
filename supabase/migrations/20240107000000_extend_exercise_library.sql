-- ─────────────────────────────────────────────────────────────────────────────
-- 20240107000000_extend_exercise_library.sql
-- Extend the exercises table with the full v2 library metadata.
-- Additive only — no columns removed, no existing data touched.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── New enum types ────────────────────────────────────────────────────────────

ALTER TABLE exercises
  -- Stable slug used as the upsert key in seed scripts and external imports.
  -- Format: kebab-case, ASCII, e.g. 'barbell-bench-press'.
  ADD COLUMN IF NOT EXISTS slug              text UNIQUE,

  -- Human-readable alternative names (e.g. 'Flat Bench', 'Chest Press').
  -- Included in full-text keyword search.
  ADD COLUMN IF NOT EXISTS aliases          text[]  NOT NULL DEFAULT '{}',

  -- Functional classification.
  -- 'compound' = multi-joint, 'isolation' = single-joint, etc.
  ADD COLUMN IF NOT EXISTS category         text
    CHECK (category IN ('compound','isolation','cardio','mobility','core','plyometric','olympic')),

  -- How the exercise loads the body's kinetic chain.
  ADD COLUMN IF NOT EXISTS movement_pattern text
    CHECK (movement_pattern IN ('push','pull','hinge','squat','carry','rotation','isolation','locomotion')),

  -- True when the movement trains one side at a time (e.g. single-arm row).
  ADD COLUMN IF NOT EXISTS is_unilateral    boolean NOT NULL DEFAULT false,

  -- Ordered step-by-step instructions per locale.
  -- Shape: [{ "step": 1, "text": "..." }, ...]
  ADD COLUMN IF NOT EXISTS instructions_en  jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS instructions_ro  jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS instructions_es  jsonb   NOT NULL DEFAULT '[]',

  -- Common form errors, ordered by frequency.
  -- Shape: ["mistake 1", "mistake 2", ...]
  ADD COLUMN IF NOT EXISTS mistakes_en      jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS mistakes_ro      jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS mistakes_es      jsonb   NOT NULL DEFAULT '[]',

  -- Performance and safety tips, ordered by importance.
  -- Shape: ["tip 1", "tip 2", ...]
  ADD COLUMN IF NOT EXISTS tips_en          jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tips_ro          jsonb   NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS tips_es          jsonb   NOT NULL DEFAULT '[]',

  -- Free-form search keywords: common cues, muscle nicknames, equipment variants.
  -- GIN-indexed for fast array-contains queries.
  ADD COLUMN IF NOT EXISTS keywords         text[]  NOT NULL DEFAULT '{}',

  -- Identifier that maps to a muscle-highlight SVG in public/exercises/muscle-maps/.
  -- Multiple exercises can share a map (e.g. all horizontal pushing exercises).
  ADD COLUMN IF NOT EXISTS muscle_map_id    text,

  -- Supabase Storage paths (or external CDN URLs) for media assets.
  ADD COLUMN IF NOT EXISTS hero_image_url   text,
  ADD COLUMN IF NOT EXISTS demo_image_url   text,

  -- Reserved for future video support (YouTube / Vimeo URL or Storage path).
  ADD COLUMN IF NOT EXISTS video_url        text;

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_exercises_slug     ON exercises(slug);
CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category);
CREATE INDEX IF NOT EXISTS idx_exercises_movement ON exercises(movement_pattern);
CREATE INDEX IF NOT EXISTS idx_exercises_keywords ON exercises USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_exercises_aliases  ON exercises USING GIN(aliases);

-- ── User exercise favorites ───────────────────────────────────────────────────
-- Per-user, per-exercise. Separate table so favorites work for both
-- library exercises (is_custom = false) and user-created ones.

CREATE TABLE IF NOT EXISTS user_exercise_favorites (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id uuid        NOT NULL REFERENCES exercises(id)  ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (user_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_user_exercise_favorites_user ON user_exercise_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_exercise_favorites_ex   ON user_exercise_favorites(exercise_id);

ALTER TABLE user_exercise_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_exercise_favorites_owner" ON user_exercise_favorites
  USING     (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
