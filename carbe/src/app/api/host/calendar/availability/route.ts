import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClientFromCookies } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
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
        console.log('Availability API: Authenticated via cookies');
      }
    } catch (cookieAuthError) {
      console.log('Availability API: Cookie auth failed:', cookieAuthError);
    }
    
    // Try authorization header if cookie auth failed
    if (!user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Availability API: Trying authorization header');
        
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        
        if (tokenUser && !tokenError) {
          user = tokenUser;
          authMethod = 'bearer_token';
          console.log('Availability API: Authenticated via bearer token');
        } else {
          console.log('Availability API: Bearer token auth failed:', tokenError);
        }
      }
    }
    
    if (!user) {
      console.log('Availability API: No authentication method worked');
      return NextResponse.json({ 
        error: 'No authenticated user',
        debug: {
          cookieCount: request.cookies.getAll().length,
          hasAuthHeader: !!request.headers.get('authorization'),
          authMethod
        }
      }, { status: 401 });
    }

    console.log('Availability API: User ID:', user.id, 'Auth method:', authMethod);

    const { carIds, dates, status } = await request.json();

    if (!carIds || !dates || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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