// Client-side search and filter utilities for the exercise library.
// These operate on already-fetched ExerciseSummary arrays — useful for
// instant filtering without a round-trip when the full list is in memory.

import type { ExerciseSummary, ExerciseFilters, ExerciseSort } from './types';

// slugify — converts a display name to a valid exercise slug.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// resolveExerciseName — picks the correct locale name from an exercise.
export function resolveExerciseName(
  ex: Pick<ExerciseSummary, 'name_en' | 'name_ro' | 'name_es'>,
  locale: 'en' | 'ro' | 'es'
): string {
  if (locale === 'ro') return ex.name_ro;
  if (locale === 'es') return ex.name_es;
  return ex.name_en;
}

// filterExercises — pure function, returns filtered array.
// Runs synchronously on a cached list; no Supabase calls.
export function filterExercises(
  exercises: ExerciseSummary[],
  filters:   ExerciseFilters
): ExerciseSummary[] {
  let result = exercises;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(ex =>
      ex.name_en.toLowerCase().includes(q) ||
      ex.name_ro.toLowerCase().includes(q) ||
      ex.name_es.toLowerCase().includes(q) ||
      ex.aliases.some(a => a.toLowerCase().includes(q))
    );
  }

  if (filters.muscle) {
    result = result.filter(ex => ex.muscle_groups.includes(filters.muscle!));
  }

  if (filters.secondary) {
    result = result.filter(ex => ex.secondary_muscles.includes(filters.secondary!));
  }

  if (filters.equipment) {
    result = result.filter(ex => ex.equipment.includes(filters.equipment!));
  }

  if (filters.difficulty) {
    result = result.filter(ex => ex.difficulty === filters.difficulty);
  }

  if (filters.exercise_type) {
    result = result.filter(ex => ex.exercise_type === filters.exercise_type);
  }

  if (filters.category) {
    result = result.filter(ex => ex.category === filters.category);
  }

  if (filters.movement_pattern) {
    result = result.filter(ex => ex.movement_pattern === filters.movement_pattern);
  }

  if (filters.location && filters.location !== 'both') {
    result = result.filter(
      ex => ex.location === filters.location || ex.location === 'both'
    );
  }

  if (filters.is_unilateral !== undefined) {
    result = result.filter(ex => ex.is_unilateral === filters.is_unilateral);
  }

  if (filters.is_custom !== undefined) {
    result = result.filter(ex => ex.is_custom === filters.is_custom);
  }

  return result;
}

// sortExercises — pure function, returns sorted copy.
export function sortExercises(
  exercises: ExerciseSummary[],
  sort:      ExerciseSort,
  locale:    'en' | 'ro' | 'es' = 'en'
): ExerciseSummary[] {
  return [...exercises].sort((a, b) => {
    let cmp = 0;

    switch (sort.key) {
      case 'name':
        cmp = resolveExerciseName(a, locale).localeCompare(
          resolveExerciseName(b, locale)
        );
        break;
      case 'difficulty': {
        const ORDER = { beginner: 0, intermediate: 1, advanced: 2 };
        cmp = (ORDER[a.difficulty ?? 'beginner'] ?? 0) -
              (ORDER[b.difficulty ?? 'beginner'] ?? 0);
        break;
      }
      case 'category':
        cmp = (a.category ?? '').localeCompare(b.category ?? '');
        break;
      case 'muscle':
        cmp = (a.muscle_groups[0] ?? '').localeCompare(b.muscle_groups[0] ?? '');
        break;
    }

    return sort.dir === 'asc' ? cmp : -cmp;
  });
}

// getUniqueValues — collects distinct values for a given array field.
// Used to build filter option lists dynamically from the loaded exercise set.
export function getUniqueValues(
  exercises: ExerciseSummary[],
  field:     'muscle_groups' | 'equipment' | 'secondary_muscles'
): string[] {
  const set = new Set<string>();
  for (const ex of exercises) {
    for (const v of ex[field] ?? []) set.add(v);
  }
  return [...set].sort();
}
