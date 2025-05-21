import { supabase, createServerSupabaseClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { Database } from '@/types/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Sign up a new user with email and password
 */
export async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }

  // Create a profile record if sign up was successful
  if (data?.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: fullName,
      verified: false,
    });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw profileError;
    }
  }

  return data;
}

/**
 * Sign in a user with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  return data;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

/**
 * Get the current user's session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Error getting session:', error);
    throw error;
  }
  
  return data.session;
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Error getting user:', error);
    throw error;
  }
  
  return data.user;
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Update a user's profile
 */
export async function updateUserProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data;
}

/**
 * Check if a user is authenticated (for server components)
 */
export async function requireAuth() {
  const supabase = createServerSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    redirect('/signin');
  }
  
  return session;
}

/**
 * Check if a user has a specific role (host, renter, admin)
 */
export async function getUserRole(userId: string) {
  // In a real world scenario, you would query a roles table or check custom claims
  // This is a simplified version
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
  
  return data?.role || 'renter'; // Default to renter if no role is specified
}

/**
 * Reset password
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  
  if (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
  
  return true;
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  
  if (error) {
    console.error('Error updating password:', error);
    throw error;
  }
  
  return true;
} 