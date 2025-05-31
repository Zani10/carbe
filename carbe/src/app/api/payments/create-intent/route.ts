import { NextRequest, NextResponse } from 'next/server';
import { createBookingWithPayment } from '@/lib/booking';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      car_id,
      start_date,
      end_date,
      daily_rate,
      subtotal,
      service_fee,
      total_amount,
      special_requests,
    } = body;

    // Get the authenticated user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Set the auth header for supabase client
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Get car details to check if approval is required
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('requires_approval')
      .eq('id', car_id)
      .single();

    if (carError || !car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Create booking with payment
    const bookingData = {
      car_id,
      start_date,
      end_date,
      daily_rate,
      subtotal,
      service_fee,
      total_amount,
      special_requests,
    };

    const fullName = profile.full_name || '';
    const [firstName, ...lastNameParts] = fullName.split(' ');
    const lastName = lastNameParts.join(' ');

    const userProfile = {
      id: user.id,
      email: user.email || '',
      first_name: firstName || '',
      last_name: lastName || '',
      phone: profile.phone || '',
      license_number: profile.license_number || '',
    };

    const result = await createBookingWithPayment({
      bookingData,
      userProfile,
      requiresApproval: car.requires_approval,
    });

    return NextResponse.json({
      booking_id: result.booking.id,
      client_secret: result.paymentIntent.client_secret,
      requires_approval: car.requires_approval,
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 