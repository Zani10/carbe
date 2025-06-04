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
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          }
        );
        
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        
        if (tokenUser && !tokenError) {
          user = tokenUser;
          authMethod = 'bearer_token';
          console.log('Calendar API: Authenticated via bearer token');
          
          // Set auth context for RLS
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: '', 
          });
          
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
    console.log('🎯 Calendar API: Processing month:', month, 'for cars:', carIds);
    console.log('🎯 Calendar API: Date range will be:', `${month}-01`, 'to', `${month}-${String(new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()).padStart(2, '0')}`);

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

    // Get month boundaries - properly calculate end date
    const startDate = `${month}-01`;
    const year = parseInt(month.split('-')[0]);
    const monthNum = parseInt(month.split('-')[1]);
    const daysInMonth = new Date(year, monthNum, 0).getDate();
    const endDate = `${month}-${String(daysInMonth).padStart(2, '0')}`;

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
    
    console.log('🎯 Calendar API: Raw availability data from DB:', availabilityData?.length || 0, 'records');
    console.log('🎯 Calendar API: First few availability records:', availabilityData?.slice(0, 3));

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
    
    console.log('🎯 Calendar API: Raw pricing data from DB:', pricingData?.length || 0, 'records');
    console.log('🎯 Calendar API: First few pricing records:', pricingData?.slice(0, 3));

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

    // Fetch user's calendar settings to override default prices
    const { data: settingsData, error: settingsError } = await supabase
      .from('host_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (settingsError && settingsError.code !== 'PGRST116') {
      console.error('Calendar API: Settings error:', settingsError);
    }

    console.log('🎯 Calendar API: User settings found:', settingsData);

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

    // Process base prices - prioritize settings over car table
    const userBasePrice = settingsData?.base_price_per_day;
    carsData?.forEach(car => {
      // Use user's global base price from settings if available, otherwise fall back to car-specific price
      basePriceByCar[car.id] = userBasePrice || car.price_per_day || 85;
    });

    console.log('🎯 Calendar API: Final base prices by car:', basePriceByCar);

    // Process availability data
    availabilityData?.forEach(item => {
      availability[item.car_id][item.date] = item.status;
    });

    // Process pricing data and apply weekend adjustments
    pricingData?.forEach(item => {
      pricingOverrides[item.car_id][item.date] = item.price_override;
    });

    // Apply weekend pricing adjustments from settings
    if (settingsData?.weekend_price_adjustment_type && settingsData?.weekend_price_adjustment_value) {
      ownedCarIds.forEach(carId => {
        const basePrice = basePriceByCar[carId];
        
        // Generate all dates in the month
        for (let day = 1; day <= daysInMonth; day++) {
          const dateStr = `${month}-${String(day).padStart(2, '0')}`;
          const date = new Date(dateStr);
          const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
          
          // Check if it's weekend (Saturday or Sunday)
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            // Only apply weekend pricing if there's no existing override
            if (!pricingOverrides[carId][dateStr]) {
              let weekendPrice = basePrice;
              
              if (settingsData.weekend_price_adjustment_type === 'percentage') {
                weekendPrice = basePrice * (1 + settingsData.weekend_price_adjustment_value / 100);
              } else if (settingsData.weekend_price_adjustment_type === 'fixed') {
                weekendPrice = basePrice + settingsData.weekend_price_adjustment_value;
              }
              
              pricingOverrides[carId][dateStr] = Math.round(weekendPrice);
            }
          }
        }
      });
    }

    console.log('🎯 Calendar API: Applied weekend pricing, sample overrides:', Object.keys(pricingOverrides).slice(0, 1).map(carId => ({
      carId,
      sampleOverrides: Object.entries(pricingOverrides[carId]).slice(0, 5)
    })));

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
      pendingRequestsByDate: {},
      bookings: bookingsData?.map(booking => ({
        id: booking.id,
        car_id: booking.car_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        status: booking.status,
        daily_rate: booking.daily_rate || 85,
        guest_name: booking.snapshot_first_name || 'Unknown',
        guest_email: booking.snapshot_email || '',
        total_amount: booking.total_amount || 0
      })) || []
    };

    // Calculate basic metrics
    const totalDays = ownedCarIds.length * 30; // rough estimate
    const bookedDays = Object.values(availability).reduce((total, carAvailability) => {
      return total + Object.values(carAvailability).filter(status => status === 'booked').length;
    }, 0);

    // Calculate average rate including weekend adjustments
    const allPrices: number[] = [];
    ownedCarIds.forEach(carId => {
      const basePrice = basePriceByCar[carId];
      allPrices.push(basePrice);
      
      // Add weekend prices to average calculation
      Object.values(pricingOverrides[carId]).forEach(price => {
        allPrices.push(price);
      });
    });
    
    const averageRate = allPrices.length > 0 
      ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length 
      : Object.values(basePriceByCar).reduce((a, b) => a + b, 0) / Object.values(basePriceByCar).length || 85;

    const metrics: CalendarMetrics = {
      totalRevenue: bookedDays * averageRate, // use calculated average
      pendingRequestsCount: bookingsData?.filter(b => b.status === 'pending').length || 0,
      occupancyRate: totalDays > 0 ? bookedDays / totalDays : 0,
      averageRate
    };

    console.log('🎯 Calendar API: Returning data successfully');
    console.log('🎯 Calendar API: Sample availability data:', Object.keys(availability).slice(0, 2).map(carId => ({
      carId,
      dates: Object.keys(availability[carId]).slice(0, 5),
      statuses: Object.values(availability[carId]).slice(0, 5)
    })));
    console.log('🎯 Calendar API: Sample pricing data:', Object.keys(pricingOverrides).slice(0, 2).map(carId => ({
      carId,  
      dates: Object.keys(pricingOverrides[carId]).slice(0, 5),
      prices: Object.values(pricingOverrides[carId]).slice(0, 5)
    })));
    
    return NextResponse.json({
      calendarData,
      metrics
    });

  } catch (error) {
    console.error('Calendar API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 