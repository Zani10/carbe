import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Calendar Settings API: Processing save request');
    
    // Get authenticated user with proper session setup for RLS
    const supabase = createApiRouteSupabaseClient(request);
    const authHeader = request.headers.get('authorization');
    
    // Set up authentication session if we have a bearer token
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', 
      });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Calendar Settings API: Authentication failed', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { carIds, settings } = await request.json();
    console.log('Calendar Settings API: Received settings for cars:', carIds, 'settings:', settings);

    if (!carIds || !Array.isArray(carIds) || carIds.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid carIds' }, { status: 400 });
    }

    // Validate required fields
    const requiredFields = ['basePricePerDay', 'minimumBookingDuration', 'defaultCheckInTime', 'defaultCheckOutTime'];
    for (const field of requiredFields) {
      if (settings[field] === undefined || settings[field] === null) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Verify user owns all specified cars
    const { data: userCars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', user.id)
      .in('id', carIds);

    if (carsError) {
      console.error('Calendar Settings API: Error verifying car ownership:', carsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const ownedCarIds = userCars?.map(car => car.id) || [];
    const unauthorizedCars = carIds.filter(id => !ownedCarIds.includes(id));
    
    if (unauthorizedCars.length > 0) {
      return NextResponse.json({ 
        error: 'Unauthorized access to some vehicles',
        unauthorizedCars 
      }, { status: 403 });
    }

    // Prepare settings data for each car
    const settingsData = {
      base_price_per_day: settings.basePricePerDay,
      minimum_booking_duration: settings.minimumBookingDuration,
      weekend_price_adjustment_type: settings.weekendPriceAdjustment?.type || 'percentage',
      weekend_price_adjustment_value: settings.weekendPriceAdjustment?.value || 0,
      default_checkin_time: settings.defaultCheckInTime,
      default_checkout_time: settings.defaultCheckOutTime,
      booking_advance_notice: settings.bookingAdvanceNotice || 1,
      updated_at: new Date().toISOString()
    };

    // Update settings for each car
    const results = [];
    for (const carId of ownedCarIds) {
      // Check if settings record exists for this car
      const { data: existingSettings, error: fetchError } = await supabase
        .from('host_calendar_settings')
        .select('*')
        .eq('car_id', carId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Calendar Settings API: Error fetching existing settings for car', carId, ':', fetchError);
        return NextResponse.json({ error: 'Database error' }, { status: 500 });
      }

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('host_calendar_settings')
          .update(settingsData)
          .eq('car_id', carId)
          .select()
          .single();

        if (error) {
          console.error('Calendar Settings API: Error updating settings for car', carId, ':', error);
          return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
        }
        results.push(data);
      } else {
        // Create new settings
        const newSettingsData = {
          ...settingsData,
          car_id: carId,
          created_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('host_calendar_settings')
          .insert(newSettingsData)
          .select()
          .single();

        if (error) {
          console.error('Calendar Settings API: Error creating settings for car', carId, ':', error);
          return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
        }
        results.push(data);
      }
    }

    console.log('Calendar Settings API: Settings saved successfully for', results.length, 'cars');
    return NextResponse.json({ 
      success: true, 
      settingsCount: results.length,
      affectedCars: ownedCarIds
    });

  } catch (error) {
    console.error('Calendar Settings API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Calendar Settings API: Processing get request');
    
    const supabase = createApiRouteSupabaseClient(request);
    const authHeader = request.headers.get('authorization');
    
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.setSession({
        access_token: token,
        refresh_token: '', 
      });
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Calendar Settings API: Authentication failed', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get carIds from query parameters
    const { searchParams } = new URL(request.url);
    const carIdsParam = searchParams.get('carIds');
    
    if (!carIdsParam) {
      return NextResponse.json({ error: 'Missing carIds parameter' }, { status: 400 });
    }

    const carIds = carIdsParam.split(',').filter(id => id.trim());
    
    // Verify user owns all specified cars
    const { data: userCars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', user.id)
      .in('id', carIds);

    if (carsError) {
      console.error('Calendar Settings API: Error verifying car ownership:', carsError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const ownedCarIds = userCars?.map(car => car.id) || [];
    
    // Fetch settings for owned cars
    const { data: settings, error: settingsError } = await supabase
      .from('host_calendar_settings')
      .select('*')
      .in('car_id', ownedCarIds);

    if (settingsError) {
      console.error('Calendar Settings API: Error fetching settings:', settingsError);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    // Group settings by car_id and transform to frontend format
    interface CarSettings {
      basePricePerDay: number;
      minimumBookingDuration: number;
      weekendPriceAdjustment: {
        type: string;
        value: number;
      };
      defaultCheckInTime: string;
      defaultCheckOutTime: string;
      bookingAdvanceNotice: number;
    }
    const settingsByCar: Record<string, CarSettings> = {};
    settings?.forEach(setting => {
      settingsByCar[setting.car_id] = {
        basePricePerDay: setting.base_price_per_day,
        minimumBookingDuration: setting.minimum_booking_duration,
        weekendPriceAdjustment: {
          type: setting.weekend_price_adjustment_type,
          value: setting.weekend_price_adjustment_value
        },
        defaultCheckInTime: setting.default_checkin_time,
        defaultCheckOutTime: setting.default_checkout_time,
        bookingAdvanceNotice: setting.booking_advance_notice
      };
    });

    // For cars without settings, provide defaults
    ownedCarIds.forEach(carId => {
      if (!settingsByCar[carId]) {
        settingsByCar[carId] = {
          basePricePerDay: 65,
          minimumBookingDuration: 1,
          weekendPriceAdjustment: {
            type: 'percentage',
            value: 20
          },
          defaultCheckInTime: '15:00',
          defaultCheckOutTime: '11:00',
          bookingAdvanceNotice: 1
        };
      }
    });

    console.log('Calendar Settings API: Settings retrieved successfully for', Object.keys(settingsByCar).length, 'cars');
    return NextResponse.json(settingsByCar);

  } catch (error) {
    console.error('Calendar Settings API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 