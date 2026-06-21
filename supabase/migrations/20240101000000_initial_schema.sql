-- MundoFit Tracker V2 — Initial Schema
-- Apply via Supabase SQL Editor or `supabase db push`

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS profiles (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  first_name               text,
  display_name             text,
  avatar_url               text,

  gender                   text CHECK (gender IN ('male', 'female')),
  age                      smallint CHECK (age BETWEEN 10 AND 120),
  height_cm                numeric(5,1) CHECK (height_cm BETWEEN 50 AND 300),
  weight_kg                numeric(5,2) CHECK (weight_kg BETWEEN 20 AND 500),
  activity_level           text CHECK (activity_level IN ('sedentary','lightly_active','moderately_active','very_active','athlete')),
  training_location        text CHECK (training_location IN ('gym','home','both')),
  goal                     text CHECK (goal IN ('lose_weight','build_muscle','improve_endurance','stay_healthy','athletic_performance')),
  preferred_workout_style  text CHECK (preferred_workout_style IN ('strength','cardio','hiit','flexibility','mixed')),
  onboarding_completed     boolean NOT NULL DEFAULT false,

  locale                   text NOT NULL DEFAULT 'ro' CHECK (locale IN ('ro','en','es')),
  unit_system              text NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric','imperial')),

  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_owner" ON profiles
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ─── Weight logs ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS weight_logs (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg  numeric(5,2) NOT NULL CHECK (weight_kg BETWEEN 20 AND 500),
  logged_at  timestamptz NOT NULL DEFAULT now(),
  note       text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_user_id ON weight_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_weight_logs_logged_at ON weight_logs(user_id, logged_at DESC);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "weight_logs_owner" ON weight_logs USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Measurements ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS measurements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logged_at       timestamptz NOT NULL DEFAULT now(),
  chest_cm        numeric(5,1),
  waist_cm        numeric(5,1),
  hips_cm         numeric(5,1),
  left_arm_cm     numeric(5,1),
  right_arm_cm    numeric(5,1),
  left_thigh_cm   numeric(5,1),
  right_thigh_cm  numeric(5,1),
  left_calf_cm    numeric(5,1),
  right_calf_cm   numeric(5,1),
  neck_cm         numeric(5,1),
  shoulders_cm    numeric(5,1),
  body_fat_pct    numeric(4,1) CHECK (body_fat_pct BETWEEN 1 AND 70),
  note            text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_measurements_user_id ON measurements(user_id, logged_at DESC);

ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "measurements_owner" ON measurements USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Progress photos ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS progress_photos (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path   text NOT NULL,
  thumbnail_path text,
  angle          text CHECK (angle IN ('front','back','side_left','side_right','custom')),
  logged_at      timestamptz NOT NULL DEFAULT now(),
  note           text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_photos_user_id ON progress_photos(user_id, logged_at DESC);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "progress_photos_owner" ON progress_photos USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Goals ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS goals (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  goal_type     text NOT NULL CHECK (goal_type IN ('weight_target','measurement_target','workout_frequency','strength_target','custom')),
  target_value  numeric,
  target_unit   text,
  start_value   numeric,
  current_value numeric,
  target_date   date,
  status        text NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','abandoned')),
  completed_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals(user_id, status);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_owner" ON goals USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── TDEE settings ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tdee_settings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tdee_kcal            integer,
  target_kcal          integer,
  protein_g            numeric(6,1),
  carbs_g              numeric(6,1),
  fat_g                numeric(6,1),
  calculation_method   text NOT NULL DEFAULT 'mifflin_st_jeor',
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tdee_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdee_settings_owner" ON tdee_settings USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Exercises ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS exercises (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ro           text NOT NULL,
  name_en           text NOT NULL,
  name_es           text NOT NULL,
  description_ro    text,
  description_en    text,
  description_es    text,
  muscle_groups     text[] NOT NULL DEFAULT '{}',
  secondary_muscles text[],
  equipment         text[] NOT NULL DEFAULT '{}',
  difficulty        text CHECK (difficulty IN ('beginner','intermediate','advanced')),
  exercise_type     text CHECK (exercise_type IN ('strength','cardio','flexibility','balance')),
  location          text CHECK (location IN ('gym','home','both')),
  gender_target     text NOT NULL DEFAULT 'both' CHECK (gender_target IN ('male','female','both')),
  is_custom         boolean NOT NULL DEFAULT false,
  created_by        uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercises_muscle_groups ON exercises USING GIN(muscle_groups);
CREATE INDEX IF NOT EXISTS idx_exercises_custom ON exercises(created_by) WHERE is_custom = true;

ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exercises_read" ON exercises FOR SELECT USING (NOT is_custom OR created_by = auth.uid());
CREATE POLICY "exercises_custom_write" ON exercises FOR ALL USING (is_custom AND created_by = auth.uid());

-- ─── Workouts ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workouts (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                     text NOT NULL,
  description              text,
  workout_type             text NOT NULL DEFAULT 'custom' CHECK (workout_type IN ('custom','generated','recommended')),
  location                 text CHECK (location IN ('gym','home','both')),
  target_muscles           text[],
  estimated_duration_min   integer,
  is_template              boolean NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON workouts(user_id);

ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workouts_owner" ON workouts USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Workout exercises ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_exercises (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id   uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position     smallint NOT NULL DEFAULT 0,
  sets         smallint,
  reps         smallint,
  duration_sec integer,
  rest_sec     integer,
  weight_kg    numeric(6,2),
  notes        text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout ON workout_exercises(workout_id);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_exercises_via_workout" ON workout_exercises
  USING (EXISTS (SELECT 1 FROM workouts w WHERE w.id = workout_id AND w.user_id = auth.uid()));

-- ─── Workout sessions ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS workout_sessions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_id       uuid REFERENCES workouts(id) ON DELETE SET NULL,
  name             text NOT NULL,
  started_at       timestamptz NOT NULL,
  ended_at         timestamptz,
  duration_sec     integer,
  total_volume_kg  numeric(10,2),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_id ON workout_sessions(user_id, started_at DESC);

ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workout_sessions_owner" ON workout_sessions USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ─── Session sets ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS session_sets (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id   uuid NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
  exercise_id  uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  set_number   smallint NOT NULL,
  reps         smallint,
  weight_kg    numeric(6,2),
  duration_sec integer,
  rest_sec     integer,
  rpe          smallint CHECK (rpe BETWEEN 1 AND 10),
  completed    boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_sets_session ON session_sets(session_id);

ALTER TABLE session_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "session_sets_via_session" ON session_sets
  USING (EXISTS (SELECT 1 FROM workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid()));

-- ─── Auto-update trigger ──────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_weight_logs_updated_at BEFORE UPDATE ON weight_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_measurements_updated_at BEFORE UPDATE ON measurements FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_progress_photos_updated_at BEFORE UPDATE ON progress_photos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_tdee_settings_updated_at BEFORE UPDATE ON tdee_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_exercises_updated_at BEFORE UPDATE ON exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_workouts_updated_at BEFORE UPDATE ON workouts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_workout_sessions_updated_at BEFORE UPDATE ON workout_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Profile auto-creation trigger ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, locale)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'locale', 'ro')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
