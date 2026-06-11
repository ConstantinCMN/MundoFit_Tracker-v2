export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Enum types ──────────────────────────────────────────────────────────────

export type Gender = 'male' | 'female';
export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athlete';
export type TrainingLocation = 'gym' | 'home' | 'both';
export type Goal =
  | 'lose_weight'
  | 'build_muscle'
  | 'improve_endurance'
  | 'stay_healthy'
  | 'athletic_performance';
export type Locale = 'ro' | 'en' | 'es';
export type UnitSystem = 'metric' | 'imperial';
export type PhotoAngle = 'front' | 'back' | 'side_left' | 'side_right' | 'custom';
export type GoalType =
  | 'weight_target'
  | 'measurement_target'
  | 'workout_frequency'
  | 'strength_target'
  | 'custom';
export type GoalStatus = 'active' | 'completed' | 'abandoned';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType = 'strength' | 'cardio' | 'flexibility' | 'balance';
export type WorkoutType = 'custom' | 'generated' | 'recommended';
export type GenderTarget = 'male' | 'female' | 'both';
export type PreferredWorkoutStyle = 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'mixed';

// ─── Database type ────────────────────────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          gender: Gender | null;
          age: number | null;
          height_cm: number | null;
          weight_kg: number | null;
          activity_level: ActivityLevel | null;
          training_location: TrainingLocation | null;
          goal: Goal | null;
          preferred_workout_style: PreferredWorkoutStyle | null;
          onboarding_completed: boolean;
          locale: Locale;
          unit_system: UnitSystem;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          gender?: Gender | null;
          age?: number | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          activity_level?: ActivityLevel | null;
          training_location?: TrainingLocation | null;
          goal?: Goal | null;
          preferred_workout_style?: PreferredWorkoutStyle | null;
          onboarding_completed?: boolean;
          locale?: Locale;
          unit_system?: UnitSystem;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };

      weight_logs: {
        Row: {
          id: string;
          user_id: string;
          weight_kg: number;
          logged_at: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          weight_kg: number;
          logged_at?: string;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['weight_logs']['Insert']>;
        Relationships: [];
      };

      measurements: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          chest_cm: number | null;
          waist_cm: number | null;
          hips_cm: number | null;
          left_arm_cm: number | null;
          right_arm_cm: number | null;
          left_thigh_cm: number | null;
          right_thigh_cm: number | null;
          left_calf_cm: number | null;
          right_calf_cm: number | null;
          neck_cm: number | null;
          shoulders_cm: number | null;
          body_fat_pct: number | null;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at?: string;
          chest_cm?: number | null;
          waist_cm?: number | null;
          hips_cm?: number | null;
          left_arm_cm?: number | null;
          right_arm_cm?: number | null;
          left_thigh_cm?: number | null;
          right_thigh_cm?: number | null;
          left_calf_cm?: number | null;
          right_calf_cm?: number | null;
          neck_cm?: number | null;
          shoulders_cm?: number | null;
          body_fat_pct?: number | null;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['measurements']['Insert']>;
        Relationships: [];
      };

      progress_photos: {
        Row: {
          id: string;
          user_id: string;
          storage_path: string;
          thumbnail_path: string | null;
          angle: PhotoAngle | null;
          logged_at: string;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          storage_path: string;
          thumbnail_path?: string | null;
          angle?: PhotoAngle | null;
          logged_at?: string;
          note?: string | null;
        };
        Update: Partial<Database['public']['Tables']['progress_photos']['Insert']>;
        Relationships: [];
      };

      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          goal_type: GoalType;
          target_value: number | null;
          target_unit: string | null;
          start_value: number | null;
          current_value: number | null;
          target_date: string | null;
          status: GoalStatus;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          goal_type: GoalType;
          target_value?: number | null;
          target_unit?: string | null;
          start_value?: number | null;
          current_value?: number | null;
          target_date?: string | null;
          status?: GoalStatus;
          completed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['goals']['Insert']>;
        Relationships: [];
      };

      tdee_settings: {
        Row: {
          id: string;
          user_id: string;
          tdee_kcal: number | null;
          target_kcal: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          calculation_method: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tdee_kcal?: number | null;
          target_kcal?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          calculation_method?: string;
        };
        Update: Partial<Database['public']['Tables']['tdee_settings']['Insert']>;
        Relationships: [];
      };

      exercises: {
        Row: {
          id: string;
          name_ro: string;
          name_en: string;
          name_es: string;
          description_ro: string | null;
          description_en: string | null;
          description_es: string | null;
          muscle_groups: string[];
          secondary_muscles: string[] | null;
          equipment: string[];
          difficulty: Difficulty | null;
          exercise_type: ExerciseType | null;
          location: TrainingLocation | null;
          gender_target: GenderTarget;
          is_custom: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name_ro: string;
          name_en: string;
          name_es: string;
          description_ro?: string | null;
          description_en?: string | null;
          description_es?: string | null;
          muscle_groups: string[];
          secondary_muscles?: string[] | null;
          equipment: string[];
          difficulty?: Difficulty | null;
          exercise_type?: ExerciseType | null;
          location?: TrainingLocation | null;
          gender_target?: GenderTarget;
          is_custom?: boolean;
          created_by?: string | null;
        };
        Update: Partial<Database['public']['Tables']['exercises']['Insert']>;
        Relationships: [];
      };

      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          workout_type: WorkoutType;
          location: TrainingLocation | null;
          target_muscles: string[] | null;
          estimated_duration_min: number | null;
          is_template: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          workout_type?: WorkoutType;
          location?: TrainingLocation | null;
          target_muscles?: string[] | null;
          estimated_duration_min?: number | null;
          is_template?: boolean;
        };
        Update: Partial<Database['public']['Tables']['workouts']['Insert']>;
        Relationships: [];
      };

      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          position: number;
          sets: number | null;
          reps: number | null;
          duration_sec: number | null;
          rest_sec: number | null;
          weight_kg: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          position?: number;
          sets?: number | null;
          reps?: number | null;
          duration_sec?: number | null;
          rest_sec?: number | null;
          weight_kg?: number | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['workout_exercises']['Insert']>;
        Relationships: [];
      };

      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string | null;
          name: string;
          started_at: string;
          ended_at: string | null;
          duration_sec: number | null;
          total_volume_kg: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id?: string | null;
          name: string;
          started_at: string;
          ended_at?: string | null;
          duration_sec?: number | null;
          total_volume_kg?: number | null;
          notes?: string | null;
        };
        Update: Partial<Database['public']['Tables']['workout_sessions']['Insert']>;
        Relationships: [];
      };

      session_sets: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          set_number: number;
          reps: number | null;
          weight_kg: number | null;
          duration_sec: number | null;
          rest_sec: number | null;
          rpe: number | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_id: string;
          set_number: number;
          reps?: number | null;
          weight_kg?: number | null;
          duration_sec?: number | null;
          rest_sec?: number | null;
          rpe?: number | null;
          completed?: boolean;
        };
        Update: Partial<Database['public']['Tables']['session_sets']['Insert']>;
        Relationships: [];
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
