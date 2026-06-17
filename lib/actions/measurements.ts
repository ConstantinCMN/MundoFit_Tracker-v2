'use server';

import { createClient } from '@/lib/supabase/server';
import type { Measurement } from '@/types';

export type MeasurementField =
  | 'chest_cm'
  | 'waist_cm'
  | 'hips_cm'
  | 'left_arm_cm'
  | 'right_arm_cm'
  | 'left_thigh_cm'
  | 'right_thigh_cm'
  | 'left_calf_cm'
  | 'right_calf_cm'
  | 'neck_cm'
  | 'shoulders_cm'
  | 'body_fat_pct';

export type MeasurementInput = {
  logged_at: string;
  chest_cm?: number | null;
  waist_cm?: number | null;
  hips_cm?: number | null;
  left_arm_cm?: number | null;
  right_arm_cm?: number | null;
  left_thigh_cm?: number | null;
  right_thigh_cm?: number | null;
  left_calf_cm?: number | null;
  right_calf_cm?: number | null;
  neck_cm?: number | null;
  shoulders_cm?: number | null;
  body_fat_pct?: number | null;
  note?: string | null;
};

export async function getMeasurements(): Promise<{
  data: Measurement[];
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false });

  return { data: data ?? [], error: error?.message ?? null };
}

export async function getMeasurementById(id: string): Promise<{
  data: Measurement | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('measurements')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  return { data: data ?? null, error: error?.message ?? null };
}

export async function logMeasurement(
  input: MeasurementInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('measurements').insert({
    user_id: user.id,
    ...input,
  });

  return { error: error?.message ?? null };
}

export async function updateMeasurement(
  id: string,
  input: MeasurementInput
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('measurements')
    .update(input)
    .eq('id', id)
    .eq('user_id', user.id);

  return { error: error?.message ?? null };
}

export async function deleteMeasurement(
  id: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('measurements')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return { error: error?.message ?? null };
}
