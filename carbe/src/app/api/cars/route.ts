import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCars } from '@/lib/car';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters from query string
    const make = searchParams.get('make') || undefined;
    const model = searchParams.get('model') || undefined;
    const priceMinStr = searchParams.get('priceMin');
    const priceMaxStr = searchParams.get('priceMax');
    const transmission = searchParams.get('transmission') || undefined;
    const seatsStr = searchParams.get('seats');
    const fuelType = searchParams.get('fuelType') || undefined;

    // Convert string values to numbers where needed
    const priceMin = priceMinStr ? parseFloat(priceMinStr) : undefined;
    const priceMax = priceMaxStr ? parseFloat(priceMaxStr) : undefined;
    const seats = seatsStr ? parseInt(seatsStr, 10) : undefined;

    // Get cars with filters
    const cars = await getCars({
      make,
      model,
      priceMin,
      priceMax,
      transmission,
      seats,
      fuelType,
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Create supabase server client with admin privileges
    const supabase = createServerSupabaseClient();
    
    // Verify the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the car data from the request body
    const carData = await request.json();
    
    // Set the owner_id to the current user's ID
    carData.owner_id = session.user.id;
    
    // Insert the car into the database
    const { data, error } = await supabase
      .from('cars')
      .insert(carData)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating car:', error);
      return NextResponse.json(
        { error: 'Failed to create car' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    );
  }
} 