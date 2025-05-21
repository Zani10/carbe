import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getUserProfile, updateUserProfile } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const profile = await getUserProfile(session.user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Verify the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const updates = await request.json();
    
    // Remove any id field from updates if it exists
    if (updates.id) {
      delete updates.id;
    }
    
    // Disallow changing the verified status through this endpoint
    if ('verified' in updates) {
      delete updates.verified;
    }
    
    const updatedProfile = await updateUserProfile(session.user.id, updates);
    
    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 