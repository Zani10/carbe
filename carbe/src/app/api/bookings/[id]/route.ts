import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getBookingById, updateBookingStatus } from '@/lib/booking';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  
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
    
    const booking = await getBookingById(id);
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is authorized to view this booking
    // Either they must be the user who made the booking or the car owner
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('owner_id')
      .eq('id', booking.car_id)
      .single();
    
    if (carError) {
      console.error(`Error fetching car for booking ${id}:`, carError);
      return NextResponse.json(
        { error: 'Failed to fetch booking details' },
        { status: 500 }
      );
    }
    
    if (booking.user_id !== session.user.id && car.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to view this booking' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error(`Error fetching booking with ID ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  
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
    
    const { status } = await request.json();
    
    // Get the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('user_id, car_id')
      .eq('id', id)
      .single();
    
    if (bookingError || !booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }
    
    // Get the car to check if the user is the owner
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('owner_id')
      .eq('id', booking.car_id)
      .single();
    
    if (carError) {
      console.error(`Error fetching car for booking ${id}:`, carError);
      return NextResponse.json(
        { error: 'Failed to update booking' },
        { status: 500 }
      );
    }
    
    // Check permissions based on the requested status change
    if (status === 'cancelled') {
      // User can cancel their own booking
      if (booking.user_id !== session.user.id && car.owner_id !== session.user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to cancel this booking' },
          { status: 403 }
        );
      }
    } else if (status === 'confirmed' || status === 'completed') {
      // Only the car owner can confirm or complete a booking
      if (car.owner_id !== session.user.id) {
        return NextResponse.json(
          { error: 'Only the car owner can confirm or complete a booking' },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }
    
    // Update the booking status
    const updatedBooking = await updateBookingStatus(id, status);
    
    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error(`Error updating booking with ID ${id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
} 