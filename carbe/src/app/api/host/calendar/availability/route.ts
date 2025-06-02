import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createApiRouteSupabaseClient(request);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carIds, dates, status } = await request.json();

    if (!carIds || !dates || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify car ownership
    const { data: userCars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', user.id)
      .in('id', carIds);

    if (carsError || !userCars?.length) {
      return NextResponse.json({ error: 'Invalid car selection' }, { status: 400 });
    }

    const ownedCarIds = userCars.map(car => car.id);

    // Process each car and date combination
    const operations = [];
    for (const carId of ownedCarIds) {
      for (const date of dates) {
        if (status === 'available') {
          // Delete availability record to make it available
          operations.push(
            supabase
              .from('host_calendar_availability')
              .delete()
              .eq('car_id', carId)
              .eq('date', date)
          );
        } else if (status === 'blocked') {
          // Upsert availability record
          operations.push(
            supabase
              .from('host_calendar_availability')
              .upsert({
                car_id: carId,
                date: date,
                status: 'blocked'
              })
          );
        }
      }
    }

    // Execute all operations
    const results = await Promise.all(operations);
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        console.error('Availability update error:', result.error);
        return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Availability API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 