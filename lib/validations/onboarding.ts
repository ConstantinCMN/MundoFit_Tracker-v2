import { z } from 'zod';

export const onboardingSchema = z.object({
  first_name: z.string().min(1).max(50),
  gender: z.enum(['male', 'female']),
  age: z.number().int().min(10).max(120),
  height_cm: z.number().min(50).max(300),
  weight_kg: z.number().min(20).max(500),
  activity_level: z.enum(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'athlete']),
  training_location: z.enum(['gym', 'home', 'both']),
  goal: z.enum(['lose_weight', 'build_muscle', 'improve_endurance', 'stay_healthy', 'athletic_performance']),
  preferred_workout_style: z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'mixed']),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
