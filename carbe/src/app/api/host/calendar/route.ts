import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';
import { CalendarData } from '@/types/calendar';

export async function GET(request: NextRequest) {
  try {
    const supabase = createApiRouteSupabaseClient(request);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month'); // YYYY-MM format
    const carId = searchParams.get('carId');

    if (!month) {
      return NextResponse.json({ error: 'Month parameter is required' }, { status: 400 });
    }

    // Parse month to get date range
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // We'll filter properly in the query

    // Get user's cars for host mode validation
    const { data: userCars, error: carsError } = await supabase
      .from('cars')
      .select('id, price_per_day')
      .eq('owner_id', user.id);

    if (carsError) {
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }

    if (!userCars || userCars.length === 0) {
      return NextResponse.json({ error: 'No cars found' }, { status: 404 });
    }

    // Calculate base price (average of all cars or specific car)
    let basePrice = 85; // default
    if (carId && carId !== 'all') {
      const selectedCar = userCars.find((car) => car.id === carId);
      basePrice = selectedCar?.price_per_day || 85;
    } else {
      const avgPrice = userCars.reduce((sum: number, car) => sum + (car.price_per_day || 85), 0) / userCars.length;
      basePrice = Math.round(avgPrice);
    }

    // Get availability data (mock for now - you'll implement actual tables)
    const availability: never[] = []; // TODO: Query host_calendar_availability table

    // Get pricing overrides (mock for now)
    const pricingOverrides: never[] = []; // TODO: Query host_calendar_pricing table

    // Get bookings for the month
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        car_id,
        start_date,
        end_date,
        status,
        daily_rate,
        total_amount,
        snapshot_first_name,
        snapshot_last_name,
        snapshot_email
      `)
      .in('car_id', userCars.map((car) => car.id))
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    if (bookingsError) {
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // Transform bookings to calendar format
    const calendarBookings = (bookings || []).map((booking) => ({
      id: booking.id,
      car_id: booking.car_id,
      start_date: booking.start_date,
      end_date: booking.end_date,
      status: booking.status === 'awaiting_approval' ? 'pending' as const : 
             booking.status === 'confirmed' ? 'confirmed' as const :
             booking.status === 'completed' ? 'completed' as const : 'cancelled' as const,
      daily_rate: booking.daily_rate,
      guest_name: `${booking.snapshot_first_name} ${booking.snapshot_last_name}`,
      guest_email: booking.snapshot_email,
      total_amount: booking.total_amount
    }));

    const calendarData: CalendarData = {
      availability,
      pricingOverrides,
      bookings: calendarBookings,
      basePrice
    };

    return NextResponse.json(calendarData);

  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 