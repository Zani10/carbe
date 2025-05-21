import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getCarById } from '@/lib/car';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const car = await getCarById(id);

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error(`Error fetching car with ID ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
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
    const updates = await request.json();
    
    // Fetch the car to check if the user is the owner
    const { data: car, error: fetchError } = await supabase
      .from('cars')
      .select('owner_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the car
    if (car.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to update this car' },
        { status: 403 }
      );
    }
    
    // Update the car
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Error updating car with ID ${id}:`, error);
      return NextResponse.json(
        { error: 'Failed to update car' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error updating car with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to update car' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const supabase = createServerSupabaseClient();
    
    // Verify the user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Fetch the car to check if the user is the owner
    const { data: car, error: fetchError } = await supabase
      .from('cars')
      .select('owner_id')
      .eq('id', id)
      .single();
    
    if (fetchError || !car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }
    
    // Check if the user is the owner of the car
    if (car.owner_id !== session.user.id) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this car' },
        { status: 403 }
      );
    }
    
    // Delete the car
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting car with ID ${id}:`, error);
      return NextResponse.json(
        { error: 'Failed to delete car' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting car with ID ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Failed to delete car' },
      { status: 500 }
    );
  }
} 