import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // This can be ignored in API routes
            }
          },
        },
      }
    );
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name,
      location,
      work,
      education,
      bio,
      languages,
      nationality,
      profile_image,
    } = body;

    // Validate languages array
    const validatedLanguages = Array.isArray(languages) ? languages : [];

    // Update the user profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: full_name || null,
        location: location || null,
        work: work || null,
        education: education || null,
        bio: bio || null,
        languages: validatedLanguages,
        nationality: nationality || null,
        profile_image: profile_image || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ 
        error: 'Failed to update profile',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error in profile update API:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 