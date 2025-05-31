import { NextRequest, NextResponse } from 'next/server';
import { confirmBookingPayment } from '@/lib/booking';

export async function POST(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const result = await confirmBookingPayment(bookingId);

    return NextResponse.json({
      success: true,
      confirmed: result
    });

  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
} 