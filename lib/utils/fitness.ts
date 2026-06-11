import type { ActivityLevel, Gender } from '@/types/database';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  athlete: 1.9,
};

export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: Gender
): number {
  // Mifflin-St Jeor
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(
  weight_kg: number,
  height_cm: number,
  age: number,
  gender: Gender,
  activity_level: ActivityLevel
): number {
  const bmr = calculateBMR(weight_kg, height_cm, age, gender);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activity_level]);
}

export function calculateBMI(weight_kg: number, height_cm: number): number {
  const h = height_cm / 100;
  return parseFloat((weight_kg / (h * h)).toFixed(1));
}

export type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese';

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25) return 'normal';
  if (bmi < 30) return 'overweight';
  return 'obese';
}
