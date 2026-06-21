-- ─────────────────────────────────────────────────────────────────────────────
-- 004_add_split_type.sql
-- Phase 6: Split Identity Persistence.
-- Adds a nullable split_type column to workouts so the Workout Type chosen
-- in Body Hub (Push/Pull/Legs/Upper/Lower/Full/Custom) survives past the
-- generation session. NULL means no split context (e.g. workouts created
-- via direct-to-Generator entry points, or rows that predate this column).
-- No backfill — historical rows stay NULL permanently.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE workouts
  ADD COLUMN split_type text
  CHECK (split_type IN ('push','pull','legs','upper','lower','full','custom'));
