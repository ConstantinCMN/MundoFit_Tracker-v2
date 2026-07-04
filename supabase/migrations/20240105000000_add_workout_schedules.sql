-- ─────────────────────────────────────────────────────────────────────────────
-- 005_add_workout_schedules.sql
-- Workout Calendar / Program Planner (v1).
-- Fixed 14-day schedule, one active schedule per user. Each day is assigned
-- a day_type (the existing split types, plus 'rest') and optionally points
-- at a generated/saved workout once one exists for that day.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text NOT NULL,
  start_date  date NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_schedules_user_id ON workout_schedules(user_id);

-- v1 scope: exactly one active schedule per user.
CREATE UNIQUE INDEX IF NOT EXISTS uniq_workout_schedules_active_per_user
  ON workout_schedules(user_id) WHERE is_active;

ALTER TABLE workout_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_schedules_owner" ON workout_schedules
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Schedule days ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_schedule_days (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id  uuid NOT NULL REFERENCES workout_schedules(id) ON DELETE CASCADE,
  day_index    smallint NOT NULL CHECK (day_index BETWEEN 0 AND 13),
  day_type     text NOT NULL CHECK (day_type IN ('push','pull','legs','upper','lower','full','custom','rest')),
  workout_id   uuid REFERENCES workouts(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (schedule_id, day_index)
);

CREATE INDEX IF NOT EXISTS idx_workout_schedule_days_schedule ON workout_schedule_days(schedule_id);

ALTER TABLE workout_schedule_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_schedule_days_via_schedule" ON workout_schedule_days
  USING (EXISTS (SELECT 1 FROM workout_schedules ws WHERE ws.id = schedule_id AND ws.user_id = auth.uid()));

CREATE TRIGGER set_workout_schedules_updated_at BEFORE UPDATE ON workout_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at();
