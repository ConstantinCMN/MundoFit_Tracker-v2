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

// Share of selected muscles that fall outside the split's canonical muscle set.
export function getSplitDivergence(muscleIds: string[], split: SplitType): number {
  if (muscleIds.length === 0) return 0;
  const canonical = new Set(SPLIT_MUSCLE_MAP[split]);
  const outside = muscleIds.filter(m => !canonical.has(m as MuscleId)).length;
  return outside / muscleIds.length;
}

export const SPLIT_DIVERGENCE_THRESHOLD = 0.5;

// Downgrades to 'custom' when the actual selection no longer represents the chosen split.
export function reconcileSplitForSave(
  muscleIds: string[],
  split: SplitType | null
): SplitType | null {
  if (split == null || split === 'custom') return split;
  return getSplitDivergence(muscleIds, split) > SPLIT_DIVERGENCE_THRESHOLD ? 'custom' : split;
}

// Orders selected muscles so split-canonical ones fill generation slots first — a bias, not a filter.
export function prioritizeMusclesBySplit(muscleIds: string[], split: SplitType | null): string[] {
  if (split == null) return muscleIds;
  const canonical = new Set(SPLIT_MUSCLE_MAP[split]);
  const inSplit = muscleIds.filter(m => canonical.has(m as MuscleId));
  const outsideSplit = muscleIds.filter(m => !canonical.has(m as MuscleId));
  return [...inSplit, ...outsideSplit];
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
