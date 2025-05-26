import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id: carId } = await params;
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (start >= end) {
      return NextResponse.json(
        { error: 'end_date must be after start_date' },
        { status: 400 }
      );
    }

    // Check if car exists
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // Check availability using the database function
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_car_availability', {
        p_car_id: carId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    // Get unavailable dates for the next 3 months (for the date picker)
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const { data: unavailableDates, error: unavailableError } = await supabase
      .from('car_availability')
      .select('start_date, end_date, reason')
      .eq('car_id', carId)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .lte('start_date', threeMonthsFromNow.toISOString().split('T')[0]);

    if (unavailableError) {
      console.error('Error fetching unavailable dates:', unavailableError);
      return NextResponse.json(
        { error: 'Failed to fetch unavailable dates' },
        { status: 500 }
      );
    }

    // Convert unavailable periods to individual dates
    const unavailableDatesList: string[] = [];
    
    unavailableDates?.forEach((period) => {
      const current = new Date(period.start_date);
      const end = new Date(period.end_date);
      
      while (current <= end) {
        unavailableDatesList.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
    });

    return NextResponse.json({
      available: isAvailable,
      unavailable_dates: unavailableDatesList,
      checked_period: {
        start_date: startDate,
        end_date: endDate
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 