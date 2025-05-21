import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { createBooking, getUserBookings, getHostBookings, checkCarAvailability } from '@/lib/booking';

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
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'user'; // 'user' or 'host'
    
    let bookings;
    
    if (type === 'host') {
      bookings = await getHostBookings(session.user.id);
    } else {
      bookings = await getUserBookings(session.user.id);
    }
    
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    
    // Get the booking data from the request body
    const bookingData = await request.json();
    
    // Set the user_id to the current user's ID
    bookingData.user_id = session.user.id;
    
    // Check if the car is available for the requested dates
    const isAvailable = await checkCarAvailability(
      bookingData.car_id,
      bookingData.start_date,
      bookingData.end_date
    );
    
    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Car is not available for the requested dates' },
        { status: 400 }
      );
    }
    
    // Create the booking
    const booking = await createBooking({
      car_id: bookingData.car_id,
      user_id: session.user.id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      status: 'pending',
    });
    
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 