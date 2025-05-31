import { NextRequest, NextResponse } from 'next/server';
import { handleHostApproval } from '@/lib/booking';

export async function POST(request: NextRequest) {
  try {
    const { booking_id, action } = await request.json();

    if (!booking_id || !action) {
      return NextResponse.json(
        { error: 'Booking ID and action are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const result = await handleHostApproval({ booking_id, action });

    return NextResponse.json({
      success: true,
      booking: result
    });

  } catch (error) {
    console.error('Error handling host approval:', error);
    return NextResponse.json(
      { error: 'Failed to process approval' },
      { status: 500 }
    );
  }
} 