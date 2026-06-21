import type { MuscleId } from '@/components/workouts/muscle-map';

export type SplitType = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full' | 'custom';

export const SPLIT_TYPES: SplitType[] = ['push', 'pull', 'legs', 'upper', 'lower', 'full', 'custom'];

export const SPLIT_MUSCLE_MAP: Record<SplitType, MuscleId[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['lats', 'traps', 'biceps', 'forearms'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
  upper: ['chest', 'shoulders', 'biceps', 'triceps', 'forearms', 'lats', 'traps'],
  lower: ['quads', 'hamstrings', 'glutes', 'calves', 'lower_back'],
  full: ['chest', 'lats', 'shoulders', 'quads', 'hamstrings'],
  custom: [],
};

export function isSplitType(value: string | null): value is SplitType {
  return value != null && (SPLIT_TYPES as string[]).includes(value);
}
