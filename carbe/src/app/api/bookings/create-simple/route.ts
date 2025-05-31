import { NextRequest, NextResponse } from 'next/server';
import { createBookingWithPaymentServer } from '@/lib/booking/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingData, userProfile, requiresApproval } = body;

    console.log('📝 Received booking request:', { 
      carId: bookingData?.car_id, 
      userId: userProfile?.id,
      requiresApproval 
    });

    // Validate required fields
    if (!bookingData || !userProfile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create booking with payment intent
    console.log('🔄 Creating booking with data:', {
      bookingData: { ...bookingData, renter_id: userProfile.id },
      userProfile,
      requiresApproval
    });

    const result = await createBookingWithPaymentServer({
      bookingData,
      userProfile,
      requiresApproval: requiresApproval || false,
    });

    console.log('✅ Booking created successfully:', result.booking.id);

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
    console.error('❌ Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
} 