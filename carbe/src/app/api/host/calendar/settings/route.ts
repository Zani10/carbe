import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Calendar Settings API: Processing save request');
    
    // Get authenticated user
    const supabase = createApiRouteSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Calendar Settings API: Authentication failed', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const settings = await request.json();
    console.log('Calendar Settings API: Received settings:', settings);

    // Validate required fields
    const requiredFields = ['basePricePerDay', 'minimumStayRequirement', 'defaultCheckInTime', 'defaultCheckOutTime'];
    for (const field of requiredFields) {
      if (settings[field] === undefined || settings[field] === null) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // Check if settings record exists for this user
    const { data: existingSettings, error: fetchError } = await supabase
      .from('host_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Calendar Settings API: Error fetching existing settings:', fetchError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const settingsData = {
      user_id: user.id,
      base_price_per_day: settings.basePricePerDay,
      minimum_stay_requirement: settings.minimumStayRequirement,
      weekend_price_adjustment_type: settings.weekendPriceAdjustment?.type || 'percentage',
      weekend_price_adjustment_value: settings.weekendPriceAdjustment?.value || 0,
      default_checkin_time: settings.defaultCheckInTime,
      default_checkout_time: settings.defaultCheckOutTime,
      booking_lead_time: settings.bookingLeadTime || 1,
      special_event_pricing: settings.specialEventPricing || [],
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingSettings) {
      // Update existing settings
      const { data, error } = await supabase
        .from('host_calendar_settings')
        .update(settingsData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Calendar Settings API: Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
      }
      result = data;
    } else {
      // Create new settings
      settingsData.created_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('host_calendar_settings')
        .insert(settingsData)
        .select()
        .single();

      if (error) {
        console.error('Calendar Settings API: Error creating settings:', error);
        return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
      }
      result = data;
    }

    console.log('Calendar Settings API: Settings saved successfully');
    return NextResponse.json({ 
      success: true, 
      settings: result 
    });

  } catch (error) {
    console.error('Calendar Settings API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Calendar Settings API: Processing get request');
    
    // Get authenticated user
    const supabase = createApiRouteSupabaseClient(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('Calendar Settings API: Authentication failed', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's calendar settings
    const { data: settings, error } = await supabase
      .from('host_calendar_settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Calendar Settings API: Error fetching settings:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // If no settings found, return defaults
    if (!settings) {
      console.log('Calendar Settings API: No settings found, returning defaults');
      return NextResponse.json({
        basePricePerDay: 65,
        minimumStayRequirement: 1,
        weekendPriceAdjustment: { type: 'percentage', value: 20 },
        specialEventPricing: [],
        defaultCheckInTime: '15:00',
        defaultCheckOutTime: '11:00',
        bookingLeadTime: 1
      });
    }

    // Transform database format to frontend format
    const transformedSettings = {
      basePricePerDay: settings.base_price_per_day,
      minimumStayRequirement: settings.minimum_stay_requirement,
      weekendPriceAdjustment: {
        type: settings.weekend_price_adjustment_type,
        value: settings.weekend_price_adjustment_value
      },
      specialEventPricing: settings.special_event_pricing || [],
      defaultCheckInTime: settings.default_checkin_time,
      defaultCheckOutTime: settings.default_checkout_time,
      bookingLeadTime: settings.booking_lead_time
    };

    console.log('Calendar Settings API: Settings retrieved successfully');
    return NextResponse.json(transformedSettings);

  } catch (error) {
    console.error('Calendar Settings API: Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 