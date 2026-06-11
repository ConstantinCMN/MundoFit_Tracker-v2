'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult, Profile } from '@/types';
import type { Locale } from '@/types/database';
import type { OnboardingData } from '@/lib/validations/onboarding';
import type { ProfileEditData } from '@/lib/validations/profile';

export async function completeOnboardingAction(
  data: OnboardingData,
  locale: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { error } = await supabase.from('profiles').upsert(
    {
      user_id: user.id,
      first_name: data.first_name,
      gender: data.gender,
      age: data.age,
      height_cm: data.height_cm,
      weight_kg: data.weight_kg,
      activity_level: data.activity_level,
      training_location: data.training_location,
      goal: data.goal,
      preferred_workout_style: data.preferred_workout_style,
      onboarding_completed: true,
      locale: locale as Locale,
    },
    { onConflict: 'user_id' }
  );

  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function getProfileAction(): Promise<ActionResult<Profile>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: profile as Profile };
}

export async function updateProfileAction(
  data: ProfileEditData
): Promise<ActionResult<Profile>> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { success: false, error: 'Not authenticated' };

  const { data: updated, error } = await supabase
    .from('profiles')
    .update({
      first_name: data.first_name,
      gender: data.gender,
      age: data.age,
      height_cm: data.height_cm,
      weight_kg: data.weight_kg,
      activity_level: data.activity_level,
      goal: data.goal,
      preferred_workout_style: data.preferred_workout_style,
    })
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, data: updated as Profile };
}
