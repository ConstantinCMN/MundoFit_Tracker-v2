'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  ExerciseSummary,
  ExerciseRich,
  ExerciseWithFavorite,
  ExerciseFilters,
} from './types';

// ── Summary list (paginated) ──────────────────────────────────────────────────

export type GetExercisesResult = {
  data: ExerciseWithFavorite[];
  total: number;
  error: string | null;
};

export async function getExercises(
  filters: ExerciseFilters = {},
  page    = 1,
  perPage = 50
): Promise<GetExercisesResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Select summary columns only — avoids transferring instructions/tips/mistakes
  // for every row in a list of 1000+ exercises.
  const SUMMARY_COLUMNS = `
    id, slug,
    name_en, name_ro, name_es,
    aliases, category,
    muscle_groups, secondary_muscles, equipment,
    difficulty, exercise_type, movement_pattern,
    is_unilateral, location, gender_target,
    is_custom, demo_image_url, hero_image_url
  `;

  let query = supabase
    .from('exercises')
    .select(SUMMARY_COLUMNS, { count: 'exact' })
    .order('name_en', { ascending: true })
    .range((page - 1) * perPage, page * perPage - 1);

  // ── Filters ──────────────────────────────────────────────────────────────────

  if (filters.search) {
    const q = `%${filters.search}%`;
    query = query.or(
      `name_en.ilike.${q},name_ro.ilike.${q},name_es.ilike.${q}`
    );
  }

  if (filters.muscle) {
    query = query.contains('muscle_groups', [filters.muscle]);
  }

  if (filters.secondary) {
    query = query.contains('secondary_muscles', [filters.secondary]);
  }

  if (filters.equipment) {
    query = query.contains('equipment', [filters.equipment]);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  if (filters.exercise_type) {
    query = query.eq('exercise_type', filters.exercise_type);
  }

  if (filters.category) {
    query = query.eq('category', filters.category);
  }

  if (filters.movement_pattern) {
    query = query.eq('movement_pattern', filters.movement_pattern);
  }

  if (filters.location && filters.location !== 'both') {
    query = query.or(`location.eq.${filters.location},location.eq.both`);
  }

  if (filters.is_unilateral !== undefined) {
    query = query.eq('is_unilateral', filters.is_unilateral);
  }

  if (filters.is_custom !== undefined) {
    query = query.eq('is_custom', filters.is_custom);
  }

  const { data, count, error } = await query;

  if (error) {
    return { data: [], total: 0, error: error.message };
  }

  // Hydrate is_favorite from user_exercise_favorites if user is authenticated.
  let favoriteSet = new Set<string>();
  if (user && data?.length) {
    const { data: favs } = await supabase
      .from('user_exercise_favorites')
      .select('exercise_id')
      .eq('user_id', user.id)
      .in('exercise_id', data.map(ex => ex.id));

    favoriteSet = new Set((favs ?? []).map(f => f.exercise_id));
  }

  const exercises: ExerciseWithFavorite[] = (data ?? []).map(ex => ({
    ...(ex as ExerciseSummary),
    secondary_muscles: ex.secondary_muscles ?? [],
    is_favorite: favoriteSet.has(ex.id),
  }));

  // Post-filter by favorite if requested (can't do this in SQL without a JOIN).
  const filtered = filters.is_favorite
    ? exercises.filter(ex => ex.is_favorite)
    : exercises;

  return { data: filtered, total: count ?? 0, error: null };
}

// ── Single exercise (rich) ────────────────────────────────────────────────────

export async function getExerciseById(
  id: string
): Promise<{ data: ExerciseRich | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ExerciseRich, error: null };
}

export async function getExerciseBySlug(
  slug: string
): Promise<{ data: ExerciseRich | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ExerciseRich, error: null };
}

// ── Favorites ─────────────────────────────────────────────────────────────────

export async function toggleFavorite(
  exerciseId: string
): Promise<{ is_favorite: boolean; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { is_favorite: false, error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('user_exercise_favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('exercise_id', exerciseId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('user_exercise_favorites')
      .delete()
      .eq('id', existing.id);
    return { is_favorite: false, error: error?.message ?? null };
  }

  const { error } = await supabase
    .from('user_exercise_favorites')
    .insert({ user_id: user.id, exercise_id: exerciseId });

  return { is_favorite: !error, error: error?.message ?? null };
}

export async function getFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('user_exercise_favorites')
    .select('exercise_id')
    .eq('user_id', user.id);

  return (data ?? []).map(f => f.exercise_id);
}

// ── Custom exercise CRUD ──────────────────────────────────────────────────────

export type CreateExerciseInput = Pick<
  ExerciseRich,
  | 'name_en' | 'name_ro' | 'name_es'
  | 'description_en' | 'description_ro' | 'description_es'
  | 'muscle_groups' | 'secondary_muscles' | 'equipment'
  | 'difficulty' | 'exercise_type' | 'category' | 'movement_pattern'
  | 'is_unilateral' | 'location'
>;

export async function createCustomExercise(
  input: CreateExerciseInput
): Promise<{ data: ExerciseRich | null; error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      ...input,
      is_custom:    true,
      created_by:   user.id,
      gender_target: 'both',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as ExerciseRich, error: null };
}

export async function deleteCustomExercise(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)
    .eq('is_custom', true);

  return { error: error?.message ?? null };
}
