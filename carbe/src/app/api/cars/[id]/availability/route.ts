import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

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
    const fetchMode = searchParams.get('mode') || 'check'; // 'check' or 'calendar'

    const supabase = createApiRouteSupabaseClient(request);

    // Check if car exists
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id, price_per_day, owner_id')
      .eq('id', carId)
      .single();

    if (carError || !car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    // For calendar mode, return comprehensive data for 3 months
    if (fetchMode === 'calendar') {
      const today = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

      const calendarStartDate = today.toISOString().split('T')[0];
      const calendarEndDate = threeMonthsFromNow.toISOString().split('T')[0];

      // Fetch host calendar availability (blocked dates)
      const { data: hostAvailability, error: hostAvailabilityError } = await supabase
        .from('host_calendar_availability')
        .select('date, status')
        .eq('car_id', carId)
        .gte('date', calendarStartDate)
        .lte('date', calendarEndDate);

      if (hostAvailabilityError) {
        console.error('Error fetching host availability:', hostAvailabilityError);
      }

      // Fetch host calendar pricing overrides
      const { data: hostPricing, error: hostPricingError } = await supabase
        .from('host_calendar_pricing')
        .select('date, price_override')
        .eq('car_id', carId)
        .gte('date', calendarStartDate)
        .lte('date', calendarEndDate);

      if (hostPricingError) {
        console.error('Error fetching host pricing:', hostPricingError);
      }

      // Fetch all bookings for this car (confirmed bookings make dates unavailable)
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('start_date, end_date, status, renter_id')
        .eq('car_id', carId)
        .gte('end_date', calendarStartDate)
        .lte('start_date', calendarEndDate);

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
      }

      // Get car-specific calendar settings for weekend pricing
      const { data: hostSettings, error: hostSettingsError } = await supabase
        .from('host_calendar_settings')
        .select('weekend_price_adjustment_type, weekend_price_adjustment_value, base_price_per_day')
        .eq('car_id', carId)
        .single();

      if (hostSettingsError && hostSettingsError.code !== 'PGRST116') {
        console.error('Error fetching host settings:', hostSettingsError);
      }

      // Build comprehensive availability and pricing data
      const unavailableDates: string[] = [];
      const pricingByDate: { [date: string]: number } = {};
      const userBookingDates: string[] = [];

      // Get current user to check for their own bookings
      const { data: { user } } = await supabase.auth.getUser();

      // Process host blocked dates
      hostAvailability?.forEach(item => {
        if (item.status === 'blocked') {
          unavailableDates.push(item.date);
        }
      });

      // Process host pricing overrides
      hostPricing?.forEach(item => {
        pricingByDate[item.date] = item.price_override;
      });

      // Process confirmed bookings
      bookings?.forEach(booking => {
        if (booking.status === 'confirmed' || booking.status === 'completed') {
          const bookingStart = new Date(booking.start_date);
          const bookingEnd = new Date(booking.end_date);
          
          for (let d = new Date(bookingStart); d <= bookingEnd; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            unavailableDates.push(dateStr);
            
            // Track user's own bookings separately
            if (user && booking.renter_id === user.id) {
              userBookingDates.push(dateStr);
            }
          }
        }
      });

      // Calculate base price (use host settings or car default)
      const basePrice = hostSettings?.base_price_per_day || car.price_per_day || 85;

      // Apply weekend pricing where no specific override exists
      if (hostSettings?.weekend_price_adjustment_type && hostSettings?.weekend_price_adjustment_value) {
        const currentDate = new Date(calendarStartDate);
        const endDate = new Date(calendarEndDate);
        
        while (currentDate <= endDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
          
          // Apply weekend pricing if no specific override exists
          if ((dayOfWeek === 0 || dayOfWeek === 6) && !pricingByDate[dateStr]) {
            let weekendPrice = basePrice;
            
            if (hostSettings.weekend_price_adjustment_type === 'percentage') {
              weekendPrice = basePrice * (1 + hostSettings.weekend_price_adjustment_value / 100);
            } else if (hostSettings.weekend_price_adjustment_type === 'fixed') {
              weekendPrice = basePrice + hostSettings.weekend_price_adjustment_value;
            }
            
            pricingByDate[dateStr] = Math.round(weekendPrice);
          }
          
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      return NextResponse.json({
        carId,
        basePrice,
        unavailableDates: [...new Set(unavailableDates)], // Remove duplicates
        pricingOverrides: pricingByDate,
        userBookingDates: [...new Set(userBookingDates)], // Remove duplicates
        period: {
          start_date: calendarStartDate,
          end_date: calendarEndDate
        }
      });
    }

    // Original availability check mode
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'start_date and end_date are required for availability check' },
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

    // Check availability using database function (if exists) or manual check
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_car_availability', {
        p_car_id: carId,
        p_start_date: startDate,
        p_end_date: endDate
      });

    if (availabilityError) {
      console.error('Error checking availability:', availabilityError);
      // Fallback to manual check if function doesn't exist
      // Check for existing bookings
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('car_id', carId)
        .eq('status', 'confirmed')
        .or(`and(start_date.lte.${startDate},end_date.gte.${startDate}),and(start_date.lte.${endDate},end_date.gte.${endDate}),and(start_date.gte.${startDate},end_date.lte.${endDate})`);

      // Check for host blocked dates
      const { data: blockedDates } = await supabase
        .from('host_calendar_availability')
        .select('id')
        .eq('car_id', carId)
        .eq('status', 'blocked')
        .gte('date', startDate)
        .lte('date', endDate);

      const manualAvailabilityCheck = (!existingBookings || existingBookings.length === 0) && 
                                     (!blockedDates || blockedDates.length === 0);

      return NextResponse.json({
        available: manualAvailabilityCheck,
        checked_period: {
          start_date: startDate,
          end_date: endDate
        }
      });
    }

    return NextResponse.json({
      available: isAvailable,
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