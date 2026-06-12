'use server';

import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

export type Exercise = Database['public']['Tables']['exercises']['Row'];

export type ExerciseFilters = {
  search?: string;
  muscle?: string;
  equipment?: string;
  difficulty?: string;
  location?: string;
};

export async function getExercises(filters: ExerciseFilters = {}): Promise<Exercise[]> {
  const supabase = await createClient();

  let query = supabase
    .from('exercises')
    .select('*')
    .order('name_ro', { ascending: true });

  if (filters.search) {
    query = query.or(
      `name_ro.ilike.%${filters.search}%,name_en.ilike.%${filters.search}%`
    );
  }

  if (filters.muscle) {
    query = query.contains('muscle_groups', [filters.muscle]);
  }

  if (filters.difficulty) {
    query = query.eq('difficulty', filters.difficulty as NonNullable<Exercise['difficulty']>);
  }

  if (filters.location && filters.location !== 'both') {
    query = query.or(`location.eq.${filters.location},location.eq.both`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('getExercises error:', error.message);
    return [];
  }

  return data ?? [];
}

export type CreateExerciseInput = {
  name_ro: string;
  name_en: string;
  name_es: string;
  description_ro?: string;
  description_en?: string;
  description_es?: string;
  muscle_groups: string[];
  secondary_muscles?: string[];
  equipment: string[];
  difficulty?: Exercise['difficulty'];
  exercise_type?: Exercise['exercise_type'];
  location?: Exercise['location'];
};

export async function createCustomExercise(
  input: CreateExerciseInput
): Promise<{ data: Exercise | null; error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('exercises')
    .insert({
      ...input,
      is_custom: true,
      created_by: user.id,
      gender_target: 'both',
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function deleteCustomExercise(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('exercises')
    .delete()
    .eq('id', id)
    .eq('created_by', user.id)
    .eq('is_custom', true);

  if (error) return { error: error.message };
  return { error: null };
}
