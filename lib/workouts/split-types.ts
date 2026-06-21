import { ArrowUp, ArrowDown, Footprints, ChevronsUp, ChevronsDown, Dumbbell, Sliders } from 'lucide-react';
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

export const SPLIT_ICON: Record<SplitType, typeof ArrowUp> = {
  push: ArrowUp,
  pull: ArrowDown,
  legs: Footprints,
  upper: ChevronsUp,
  lower: ChevronsDown,
  full: Dumbbell,
  custom: Sliders,
};

export const SPLIT_COLOR: Record<SplitType, string> = {
  push: '#aaff00',
  pull: '#60a5fa',
  legs: '#f87171',
  upper: '#c084fc',
  lower: '#fb923c',
  full: '#34d399',
  custom: '#888888',
};
