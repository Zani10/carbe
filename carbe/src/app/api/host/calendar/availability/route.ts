import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('=== AVAILABILITY API CALLED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    console.log('Availability API: Starting request processing');
    const supabase = createApiRouteSupabaseClient(request);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Availability API: Authentication failed:', userError);
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: { userError: userError?.message }
      }, { status: 401 });
    }

    console.log('Availability API: User authenticated:', user.id);

    const { carIds, dates, status } = await request.json();
    console.log('Availability API: Request data:', { carIds, dates, status });

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
    console.log('Availability API: Executing', operations.length, 'operations');
    const results = await Promise.all(operations);
    
    // Check for errors
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.error) {
        console.error(`Availability update error for operation ${i}:`, result.error);
        console.error('Operation details:', { carId: ownedCarIds[Math.floor(i / dates.length)], date: dates[i % dates.length], status });
        return NextResponse.json({ 
          error: 'Failed to update availability', 
          details: result.error.message 
        }, { status: 500 });
      }
    }

    console.log('Availability API: All operations completed successfully');
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('=== AVAILABILITY API ERROR ===');
    console.error('Error type:', typeof error);
    console.error('Error instance:', error instanceof Error);
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Full error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: typeof error
    }, { status: 500 });
  }
} 