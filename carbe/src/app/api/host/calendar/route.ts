import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClientFromCookies } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';
import { CalendarData, CalendarMetrics } from '@/types/calendar';

export async function GET(request: NextRequest) {
  try {
    console.log('Calendar API: Starting request');
    console.log('Calendar API: Request headers:', Object.fromEntries(request.headers.entries()));
    
    let supabase;
    let user = null;
    let authMethod = 'unknown';
    
    // Try cookie-based auth first
    try {
      supabase = await createApiRouteSupabaseClientFromCookies();
      const { data: { user: cookieUser }, error: cookieError } = await supabase.auth.getUser();
      
      if (cookieUser && !cookieError) {
        user = cookieUser;
        authMethod = 'cookies';
        console.log('Calendar API: Authenticated via cookies');
      }
    } catch (cookieAuthError) {
      console.log('Calendar API: Cookie auth failed:', cookieAuthError);
    }
    
    // Try authorization header if cookie auth failed
    if (!user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Calendar API: Trying authorization header');
        
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        
        if (tokenUser && !tokenError) {
          user = tokenUser;
          authMethod = 'bearer_token';
          console.log('Calendar API: Authenticated via bearer token');
        } else {
          console.log('Calendar API: Bearer token auth failed:', tokenError);
        }
      }
    }
    
    if (!user) {
      console.log('Calendar API: No authentication method worked');
      return NextResponse.json({ 
        error: 'No authenticated user',
        debug: {
          cookieCount: request.cookies.getAll().length,
          hasAuthHeader: !!request.headers.get('authorization'),
          authMethod
        }
      }, { status: 401 });
    }

    console.log('Calendar API: User ID:', user.id, 'Auth method:', authMethod);

    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const carIdsParam = searchParams.get('carIds');
    
    if (!carIdsParam) {
      return NextResponse.json({ error: 'No car IDs provided' }, { status: 400 });
    }

    const carIds = carIdsParam.split(',').filter(id => id.trim());
    console.log('Calendar API: Processing month:', month, 'for cars:', carIds);

    // Ensure supabase client is available
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase client not initialized',
        debug: { authMethod }
      }, { status: 500 });
    }

    // Verify car ownership
    const { data: userCars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', user.id)
      .in('id', carIds);

    if (carsError) {
      console.error('Calendar API: Error verifying car ownership:', carsError);
      return NextResponse.json({ error: 'Error verifying car ownership' }, { status: 500 });
    }

    const ownedCarIds = userCars?.map(car => car.id) || [];
    const unauthorizedCars = carIds.filter(id => !ownedCarIds.includes(id));
    
    if (unauthorizedCars.length > 0) {
      console.log('Calendar API: Unauthorized cars:', unauthorizedCars);
      return NextResponse.json({ 
        error: 'Unauthorized access to some vehicles',
        unauthorizedCars 
      }, { status: 403 });
    }

    console.log('Calendar API: All cars verified, fetching calendar data');

    // Get month boundaries
    const startDate = `${month}-01`;
    const endDate = `${month}-31`; // Simplified for now

    // Fetch availability data
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('host_calendar_availability')
      .select('*')
      .in('car_id', ownedCarIds)
      .gte('date', startDate)
      .lte('date', endDate);

    if (availabilityError) {
      console.error('Calendar API: Availability error:', availabilityError);
      // Don't fail completely, just log and continue with empty data
    }

    // Fetch pricing data
    const { data: pricingData, error: pricingError } = await supabase
      .from('host_calendar_pricing')
      .select('*')
      .in('car_id', ownedCarIds)
      .gte('date', startDate)
      .lte('date', endDate);

    if (pricingError) {
      console.error('Calendar API: Pricing error:', pricingError);
      // Don't fail completely, just log and continue with empty data
    }

    // Fetch bookings data (existing table)
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .in('car_id', ownedCarIds)
      .gte('start_date', startDate)
      .lte('end_date', endDate);

    if (bookingsError) {
      console.error('Calendar API: Bookings error:', bookingsError);
      // Don't fail completely, just log and continue
    }

    // Fetch car base prices
    const { data: carsData, error: carsDataError } = await supabase
      .from('cars')
      .select('id, price_per_day')
      .in('id', ownedCarIds);

    if (carsDataError) {
      console.error('Calendar API: Cars data error:', carsDataError);
    }

    // Transform data into CalendarData format
    const availability: Record<string, Record<string, 'available' | 'blocked' | 'pending' | 'booked'>> = {};
    const pricingOverrides: Record<string, Record<string, number>> = {};
    const basePriceByCar: Record<string, number> = {};
    
    // Initialize availability for all cars
    ownedCarIds.forEach(carId => {
      availability[carId] = {};
      pricingOverrides[carId] = {};
      basePriceByCar[carId] = 85; // default
    });

    // Process base prices
    carsData?.forEach(car => {
      basePriceByCar[car.id] = car.price_per_day || 85;
    });

    // Process availability data
    availabilityData?.forEach(item => {
      availability[item.car_id][item.date] = item.status;
    });

    // Process pricing data
    pricingData?.forEach(item => {
      pricingOverrides[item.car_id][item.date] = item.price_override;
    });

    // Process bookings data - mark dates as booked
    bookingsData?.forEach(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        if (booking.status === 'confirmed') {
          availability[booking.car_id][dateStr] = 'booked';
        } else if (booking.status === 'pending') {
          availability[booking.car_id][dateStr] = 'pending';
        }
      }
    });

    const calendarData: CalendarData = {
      availability,
      pricingOverrides,
      basePriceByCar,
      pendingRequestsByDate: {}, // Will be populated based on bookings
      bookings: bookingsData?.map(booking => ({
        id: booking.id,
        car_id: booking.car_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        status: booking.status,
        daily_rate: booking.daily_rate || 0,
        guest_name: booking.snapshot_first_name || 'Unknown',
        guest_email: booking.snapshot_email || '',
        total_amount: booking.total_amount || 0
      })) || []
    };

    // Calculate basic metrics
    const totalRevenue = 720; // Mock data for now
    const metrics: CalendarMetrics = {
      totalRevenue,
      pendingRequestsCount: bookingsData?.filter(b => b.status === 'pending').length || 0,
      occupancyRate: 0.65, // Mock data
      averageRate: 85 // Mock data
    };

    console.log('Calendar API: Returning calendar data');
    return NextResponse.json({
      calendarData,
      metrics
    });

  } catch (error) {
    console.error('Calendar API: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 