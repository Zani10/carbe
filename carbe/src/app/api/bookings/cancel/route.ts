import { NextRequest, NextResponse } from 'next/server';
import { cancelBooking } from '@/lib/booking';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const result = await cancelBooking(bookingId);

    return NextResponse.json({
      success: true,
      booking: result
    });

  } catch (error) {
    console.error('Error canceling booking:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
} 