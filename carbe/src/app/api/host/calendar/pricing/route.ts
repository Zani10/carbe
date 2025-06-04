import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  console.log('=== PRICING API CALLED ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  console.log('Request headers:', Object.fromEntries(request.headers.entries()));
  
  try {
    console.log('Pricing API: Starting request processing');
    const supabase = createApiRouteSupabaseClient(request);
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('Pricing API: Authentication failed:', userError);
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: { userError: userError?.message }
      }, { status: 401 });
    }

    console.log('Pricing API: User authenticated:', user.id);

    const { carIds, date, priceOverride, isWeekendOverride } = await request.json();

    if (!carIds || !date || priceOverride === undefined) {
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

    // Process each car
    const operations = [];
    for (const carId of ownedCarIds) {
      if (priceOverride === null || priceOverride === 0) {
        // Remove price override
        operations.push(
          supabase
            .from('host_calendar_pricing')
            .delete()
            .eq('car_id', carId)
            .eq('date', date)
        );
      } else {
        // Upsert price override
        operations.push(
          supabase
            .from('host_calendar_pricing')
            .upsert({
              car_id: carId,
              date: date,
              price_override: priceOverride,
              is_weekend_override: isWeekendOverride || false
            })
        );
      }
    }

    // Execute all operations
    const results = await Promise.all(operations);
    
    // Check for errors
    for (const result of results) {
      if (result.error) {
        console.error('Pricing update error:', result.error);
        return NextResponse.json({ error: 'Failed to update pricing' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 