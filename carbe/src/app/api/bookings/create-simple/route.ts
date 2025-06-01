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

    // SECURITY: Validate required fields and user authentication
    if (!bookingData || !userProfile || !userProfile.id) {
      return NextResponse.json(
        { error: 'Missing required fields or authentication' },
        { status: 400 }
      );
    }

    // SECURITY: Ensure renter_id matches authenticated user
    if (bookingData.renter_id && bookingData.renter_id !== userProfile.id) {
      return NextResponse.json(
        { error: 'Unauthorized: renter_id mismatch' },
        { status: 403 }
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