// ── Enum types ────────────────────────────────────────────────────────────────

export type Difficulty       = 'beginner' | 'intermediate' | 'advanced';
export type ExerciseType     = 'strength' | 'cardio' | 'flexibility' | 'balance';
export type GenderTarget     = 'male' | 'female' | 'both';
export type TrainingLocation = 'gym' | 'home' | 'both';

export type ExerciseCategory =
  | 'compound'
  | 'isolation'
  | 'cardio'
  | 'mobility'
  | 'core'
  | 'plyometric'
  | 'olympic';

export type MovementPattern =
  | 'push'        // horizontal or vertical pressing
  | 'pull'        // rows, pull-ups, pull-downs
  | 'hinge'       // deadlifts, Romanian deadlifts, good mornings
  | 'squat'       // squats, lunges, step-ups
  | 'carry'       // farmer's walk, suitcase carry
  | 'rotation'    // woodchops, cable rotations
  | 'isolation'   // curls, extensions, flyes — single-joint
  | 'locomotion'; // running, sled, cycling

// ── Content types ─────────────────────────────────────────────────────────────

export type InstructionStep = {
  step: number;
  text: string;
};

// Localised multilingual content block — one per locale per exercise.
export type ExerciseContent = {
  instructions: InstructionStep[];
  mistakes:     string[];
  tips:         string[];
};

// ── Exercise shapes ───────────────────────────────────────────────────────────

// ExerciseSummary — minimal projection for search results and list cards.
// Suitable for paginated lists of 1000+ exercises.
export type ExerciseSummary = {
  id:               string;
  slug:             string | null;
  name_en:          string;
  name_ro:          string;
  name_es:          string;
  aliases:          string[];
  category:         ExerciseCategory | null;
  muscle_groups:    string[];
  secondary_muscles: string[];
  equipment:        string[];
  difficulty:       Difficulty | null;
  exercise_type:    ExerciseType | null;
  movement_pattern: MovementPattern | null;
  is_unilateral:    boolean;
  location:         TrainingLocation | null;
  gender_target:    GenderTarget;
  is_custom:        boolean;
  demo_image_url:   string | null;
  hero_image_url:   string | null;
};

// ExerciseRich — full record including localised content and media.
// Used for detail views, exercise sheets, and export.
export type ExerciseRich = ExerciseSummary & {
  description_en:   string | null;
  description_ro:   string | null;
  description_es:   string | null;
  instructions_en:  InstructionStep[];
  instructions_ro:  InstructionStep[];
  instructions_es:  InstructionStep[];
  mistakes_en:      string[];
  mistakes_ro:      string[];
  mistakes_es:      string[];
  tips_en:          string[];
  tips_ro:          string[];
  tips_es:          string[];
  keywords:         string[];
  muscle_map_id:    string | null;
  video_url:        string | null;
  created_at:       string;
  updated_at:       string;
};

// ExerciseWithFavorite — ExerciseSummary + per-user favorite state.
// Returned by queries that JOIN user_exercise_favorites for the current user.
export type ExerciseWithFavorite = ExerciseSummary & {
  is_favorite: boolean;
};

// ExerciseLocale — resolved, single-locale content.
// Use this when rendering content for a specific user locale.
export type ExerciseLocale = ExerciseSummary & {
  name:         string;
  description:  string | null;
  instructions: InstructionStep[];
  mistakes:     string[];
  tips:         string[];
};

// ── Seed & import types ───────────────────────────────────────────────────────

// ExerciseSeedEntry — the shape authored in data/exercises/*.ts files.
// slug is the stable upsert key. All content fields are optional so authors
// can add them incrementally without breaking validation.
export type ExerciseSeedEntry = {
  slug:             string;
  name_en:          string;
  name_ro:          string;
  name_es:          string;
  description_en?:  string | null;
  description_ro?:  string | null;
  description_es?:  string | null;
  aliases?:         string[];
  category?:        ExerciseCategory | null;
  muscle_groups:    string[];
  secondary_muscles?: string[];
  equipment:        string[];
  difficulty?:      Difficulty | null;
  exercise_type?:   ExerciseType | null;
  movement_pattern?: MovementPattern | null;
  is_unilateral?:   boolean;
  location?:        TrainingLocation | null;
  gender_target?:   GenderTarget;
  instructions_en?: InstructionStep[];
  instructions_ro?: InstructionStep[];
  instructions_es?: InstructionStep[];
  mistakes_en?:     string[];
  mistakes_ro?:     string[];
  mistakes_es?:     string[];
  tips_en?:         string[];
  tips_ro?:         string[];
  tips_es?:         string[];
  keywords?:        string[];
  muscle_map_id?:   string | null;
  hero_image_url?:  string | null;
  demo_image_url?:  string | null;
  video_url?:       string | null;
};

// ExerciseImportRow — shape accepted by the bulk-import endpoint.
// Identical to ExerciseSeedEntry but slug is optional; a slug is generated
// from name_en if omitted.
export type ExerciseImportRow = Omit<ExerciseSeedEntry, 'slug'> & {
  slug?: string;
};

// ── Filter types ──────────────────────────────────────────────────────────────

export type ExerciseFilters = {
  search?:          string;
  muscle?:          string;
  secondary?:       string;
  equipment?:       string;
  difficulty?:      Difficulty;
  exercise_type?:   ExerciseType;
  category?:        ExerciseCategory;
  movement_pattern?: MovementPattern;
  location?:        TrainingLocation;
  is_unilateral?:   boolean;
  is_favorite?:     boolean;
  is_custom?:       boolean;
};

export type ExerciseSortKey = 'name' | 'difficulty' | 'category' | 'muscle';
export type SortDir         = 'asc' | 'desc';

export type ExerciseSort = {
  key: ExerciseSortKey;
  dir: SortDir;
};
