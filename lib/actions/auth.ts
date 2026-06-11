'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/types';
import type { Locale } from '@/types/database';

export async function signInAction(
  email: string,
  password: string
): Promise<ActionResult<{ onboardingCompleted: boolean }>> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { success: false, error: error.message };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Authentication failed' };

  const { data: rawProfile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();

  const profile = rawProfile as { onboarding_completed: boolean } | null;
  return {
    success: true,
    data: { onboardingCompleted: profile?.onboarding_completed ?? false },
  };
}

export async function signUpAction(
  email: string,
  password: string,
  locale: string
): Promise<ActionResult<{ confirmEmail: boolean }>> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { locale } },
  });

  if (error) return { success: false, error: error.message };

  // No session = email confirmation is required
  if (!data.session) {
    return { success: true, data: { confirmEmail: true } };
  }

  // Ensure profile row exists with the correct locale (trigger may already have created it)
  if (data.user) {
    await supabase
      .from('profiles')
      .upsert({ user_id: data.user.id, locale: locale as Locale }, { onConflict: 'user_id' });
  }

  return { success: true, data: { confirmEmail: false } };
}

export async function signOutAction(): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}

export async function resetPasswordAction(
  email: string,
  redirectTo: string
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) return { success: false, error: error.message };
  return { success: true, data: undefined };
}
