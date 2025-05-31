import { NextRequest, NextResponse } from 'next/server';
import { createBookingWithPayment } from '@/lib/booking';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Debug: Log cookies
    console.log('🍪 Request cookies:', request.cookies.getAll());
    
    // Get authenticated user from server-side
    const supabase = createApiRouteSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    // Debug: Log auth result
    console.log('🔐 Auth result:', { user: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { bookingData, requiresApproval } = body;

    // Validate required fields
    if (!bookingData) {
      return NextResponse.json(
        { error: 'Missing booking data' },
        { status: 400 }
      );
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Create user profile object with auth user ID
    const userProfile = {
      id: user.id, // Use the actual auth user ID
      email: user.email || '',
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      license_number: profile.license_number || '',
    };

    // Create booking with payment intent
    const result = await createBookingWithPayment({
      bookingData,
      userProfile,
      requiresApproval: requiresApproval || false,
    });

    return NextResponse.json({
      success: true,
      booking: result.booking,
      paymentIntent: {
        id: result.paymentIntent.id,
        client_secret: result.paymentIntent.client_secret,
        amount: result.paymentIntent.amount,
        currency: result.paymentIntent.currency,
      }
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 