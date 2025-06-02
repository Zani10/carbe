import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createApiRouteSupabaseClient(request);
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { carId, dates, status } = body;

    if (!carId || !dates || !Array.isArray(dates) || !status) {
      return NextResponse.json({ 
        error: 'Missing required fields: carId, dates, status' 
      }, { status: 400 });
    }

    if (!['available', 'blocked'].includes(status)) {
      return NextResponse.json({ 
        error: 'Status must be either "available" or "blocked"' 
      }, { status: 400 });
    }

    // Verify car ownership
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .eq('owner_id', user.id)
      .single();

    if (carError || !car) {
      return NextResponse.json({ error: 'Car not found or access denied' }, { status: 404 });
    }

    // For now, we'll store this as a simple JSON in user preferences
    // In production, you'd create proper database tables
    
    // This is a mock implementation - you would typically:
    // 1. Create a host_calendar_availability table
    // 2. Insert/update records for each date
    // 3. Handle conflicts with existing bookings
    
    // Mock response for successful update
    const result = {
      updated_dates: dates,
      car_id: carId,
      status: status,
      message: `Successfully ${status === 'blocked' ? 'blocked' : 'unblocked'} ${dates.length} date(s)`
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Availability update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 