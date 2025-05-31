import { NextRequest, NextResponse } from 'next/server';
import { createBookingWithPayment } from '@/lib/booking';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingData, userProfile, requiresApproval } = body;

    // Validate required fields
    if (!bookingData || !userProfile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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