// Re-export database types
export type {
  Database,
  Json,
  Gender,
  ActivityLevel,
  TrainingLocation,
  Goal,
  Locale,
  UnitSystem,
  PhotoAngle,
  GoalType,
  GoalStatus,
  MealType,
  Difficulty,
  ExerciseType,
  WorkoutType,
  GenderTarget,
  PreferredWorkoutStyle,
} from './database';

// Convenience row types
import type { Database } from './database';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type WeightLog = Database['public']['Tables']['weight_logs']['Row'];
export type Measurement = Database['public']['Tables']['measurements']['Row'];
export type ProgressPhoto = Database['public']['Tables']['progress_photos']['Row'];
export type UserGoal = Database['public']['Tables']['goals']['Row'];
export type TdeeSettings = Database['public']['Tables']['tdee_settings']['Row'];
export type Exercise = Database['public']['Tables']['exercises']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type WorkoutExercise = Database['public']['Tables']['workout_exercises']['Row'];
export type WorkoutSession = Database['public']['Tables']['workout_sessions']['Row'];
export type SessionSet = Database['public']['Tables']['session_sets']['Row'];

// ─── Server action result type ────────────────────────────────────────────────

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
