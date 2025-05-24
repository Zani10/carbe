'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { Profile } from '@/lib/auth';
import { AuthError } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHostMode, setIsHostMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true; // Prevent state updates if component unmounted

    const fetchProfile = async (userId: string) => {
      try {
        // Check if the profile exists
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching profile:', error);
          return null;
        }

        if (!profile) {
          // Profile doesn't exist, create it
          console.log('Profile does not exist. Creating a new profile...');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: '', // Will be updated when user provides it
              verified: false,
              is_host: false,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }

          console.log('Profile created successfully.');
          return newProfile;
        }

        return profile;
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        return null;
      }
    };

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(session);
        
        if (session?.user) {
          setUser(session.user);
          
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profile);
            setIsHostMode(profile?.is_host || false);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (mounted) {
            setProfile(profile);
            setIsHostMode(profile?.is_host || false);
          }
        } else {
          if (mounted) {
            setProfile(null);
            setIsHostMode(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user?.identities?.length === 0) {
        throw new Error('User already registered');
      }

      return { success: true, message: 'Confirmation email sent! Please check your inbox.' };
    } catch (err: unknown) {
      const authError = err as AuthError;
      return { success: false, message: authError.message || 'Failed to sign up. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Clear local state
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsHostMode(false);
      
      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        throw error;
      }
      
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();
      
      if (error) {
        throw error;
      }
      
      // Update the profile state
      setProfile(data);

      // Update isHostMode if is_host is in the updates
      if ('is_host' in updates) {
        setIsHostMode(updates.is_host as boolean);
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleHostMode = () => {
    setIsHostMode((prev) => !prev);
  };

  return {
    user,
    profile,
    session,
    isLoading,
    isHostMode,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    toggleHostMode,
  };
}

