import { NextRequest, NextResponse } from 'next/server';
import { createApiRouteSupabaseClientFromCookies } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    console.log('Vehicles API: Starting request');
    console.log('Vehicles API: Request headers:', Object.fromEntries(request.headers.entries()));
    console.log('Vehicles API: Cookies:', request.cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`));
    
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
        console.log('Vehicles API: Authenticated via cookies');
      }
    } catch (cookieAuthError) {
      console.log('Vehicles API: Cookie auth failed:', cookieAuthError);
    }
    
    // Try authorization header if cookie auth failed
    if (!user) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        console.log('Vehicles API: Trying authorization header');
        
        supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
        
        if (tokenUser && !tokenError) {
          user = tokenUser;
          authMethod = 'bearer_token';
          console.log('Vehicles API: Authenticated via bearer token');
        } else {
          console.log('Vehicles API: Bearer token auth failed:', tokenError);
        }
      }
    }
    
    if (!user) {
      console.log('Vehicles API: No authentication method worked');
      console.log('Vehicles API: Available cookies:', request.cookies.getAll().map(c => c.name));
      console.log('Vehicles API: Auth header present:', !!request.headers.get('authorization'));
      
      return NextResponse.json({ 
        error: 'No authenticated user',
        debug: {
          cookieCount: request.cookies.getAll().length,
          cookieNames: request.cookies.getAll().map(c => c.name),
          hasAuthHeader: !!request.headers.get('authorization'),
          authMethod
        }
      }, { status: 401 });
    }

    console.log('Vehicles API: User ID:', user.id, 'Auth method:', authMethod);

    // Fetch user's cars - only query columns that definitely exist
    console.log('Vehicles API: Fetching cars for user');
    
    // Ensure supabase client is available
    if (!supabase) {
      return NextResponse.json({ 
        error: 'Supabase client not initialized',
        debug: { authMethod }
      }, { status: 500 });
    }
    
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select(`
        id,
        make,
        model,
        year,
        price_per_day,
        description,
        location,
        transmission,
        seats,
        fuel_type,
        range_km,
        images,
        is_available
      `)
      .eq('owner_id', user.id);

    if (carsError) {
      console.error('Vehicles API: Cars query error:', carsError);
      return NextResponse.json({ 
        error: 'Failed to fetch vehicles', 
        details: carsError.message,
        code: carsError.code 
      }, { status: 500 });
    }

    console.log('Vehicles API: Found', cars?.length || 0, 'cars');

    // Transform to match Vehicle interface
    const vehicles = cars?.map(car => ({
      id: car.id,
      name: `${car.make} ${car.model}`,
      make: car.make,
      model: car.model,
      type: car.transmission || 'Vehicle', // Use transmission as type fallback
      base_price: car.price_per_day || 85,
      image: car.images?.[0] || null // Use first image if available
    })).filter(vehicle => vehicle.make && vehicle.model) || []; // Filter out incomplete cars

    console.log('Vehicles API: Returning', vehicles.length, 'vehicles');
    return NextResponse.json({
      cars: vehicles
    });

  } catch (error) {
    console.error('Vehicles API: Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 