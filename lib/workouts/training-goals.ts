export type Goal = 'hypertrophy' | 'strength' | 'fatLoss' | 'endurance';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export const GOALS: Goal[] = ['hypertrophy', 'strength', 'fatLoss', 'endurance'];

export const EXPERIENCE_LEVELS: ExperienceLevel[] = ['beginner', 'intermediate', 'advanced'];

export const GOAL_SCHEME: Record<Goal, { sets: number; reps: number; rest_sec: number }> = {
  hypertrophy: { sets: 4, reps: 10, rest_sec: 75 },
  strength:    { sets: 5, reps: 5,  rest_sec: 150 },
  fatLoss:     { sets: 3, reps: 15, rest_sec: 35 },
  endurance:   { sets: 3, reps: 20, rest_sec: 30 },
};

export const DEFAULT_GOAL: Goal = 'hypertrophy';
export const DEFAULT_LEVEL: ExperienceLevel = 'intermediate';

// Difficulty sort priority (0 = preferred first) per chosen experience level.
export const DIFFICULTY_PRIORITY_BY_LEVEL: Record<ExperienceLevel, Record<string, number>> = {
  beginner:     { beginner: 0, intermediate: 1, advanced: 2 },
  intermediate: { intermediate: 0, beginner: 1, advanced: 2 },
  advanced:     { advanced: 0, intermediate: 1, beginner: 2 },
};
