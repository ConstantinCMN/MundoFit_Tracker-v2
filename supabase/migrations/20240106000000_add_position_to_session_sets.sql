-- session_sets already snapshots per-set execution data (session_id, exercise_id,
-- set_number, reps, weight_kg, ...) but has no way to order distinct exercises
-- within a session — set_number only orders sets within one exercise.
-- Adding position lets a completed session reconstruct its exact executed
-- exercise list/order independently of the live (and possibly later-edited
-- or trimmed) workout_exercises template.
ALTER TABLE session_sets ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;
