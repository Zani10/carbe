import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carId = searchParams.get('car_id');
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('bookings')
      .select(`
        *,
        cars:car_id (
          id,
          make,
          model,
          year,
          images,
          price_per_day,
          location
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (carId) {
      query = query.eq('car_id', carId);
    }
    if (userId) {
      query = query.eq('renter_id', userId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      carId,
      renterId,
      startDate,
      endDate,
      totalDays,
      dailyRate,
      subtotal,
      serviceFee,
      totalAmount,
      renterFirstName,
      renterLastName,
      renterEmail,
      renterPhone,
      renterLicenseNumber,
      specialRequests,
    } = body;

    // Validate required fields
    if (!carId || !renterId || !startDate || !endDate || !totalDays ||
        !dailyRate || !subtotal || !totalAmount || !renterFirstName ||
        !renterLastName || !renterEmail || !renterPhone || !renterLicenseNumber) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check car availability first
    const { data: availabilityCheck, error: availabilityError } = await supabase
      .rpc('check_car_availability', {
        p_car_id: carId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      return NextResponse.json(
        { error: 'Failed to check car availability' },
        { status: 500 }
      );
    }

    if (!availabilityCheck) {
      return NextResponse.json(
        { error: 'Car is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Create the booking
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        car_id: carId,
        renter_id: renterId,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        daily_rate: dailyRate,
        subtotal: subtotal,
        service_fee: serviceFee || 0,
        total_amount: totalAmount,
        renter_first_name: renterFirstName,
        renter_last_name: renterLastName,
        renter_email: renterEmail,
        renter_phone: renterPhone,
        renter_license_number: renterLicenseNumber,
        special_requests: specialRequests || null,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 