import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Car = Database['public']['Tables']['cars']['Row'];
export type CarInsert = Database['public']['Tables']['cars']['Insert'];
export type CarUpdate = Database['public']['Tables']['cars']['Update'];

/**
 * Get all cars with optional filtering
 */
export async function getCars(filters?: {
  make?: string;
  model?: string;
  priceMin?: number;
  priceMax?: number;
  transmission?: string;
  seats?: number;
  fuelType?: string;
}) {
  let query = supabase.from('cars').select('*');

  // Apply filters if provided
  if (filters) {
    if (filters.make) {
      query = query.ilike('make', `%${filters.make}%`);
    }
    if (filters.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    if (filters.priceMin) {
      query = query.gte('price_per_day', filters.priceMin);
    }
    if (filters.priceMax) {
      query = query.lte('price_per_day', filters.priceMax);
    }
    if (filters.transmission) {
      query = query.eq('transmission', filters.transmission);
    }
    if (filters.seats) {
      query = query.eq('seats', filters.seats);
    }
    if (filters.fuelType) {
      query = query.eq('fuel_type', filters.fuelType);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching cars:', error);
    throw error;
  }

  return data;
}

/**
 * Get a car by its ID
 */
export async function getCarById(id: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching car with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Create a new car listing
 */
export async function createCar(car: CarInsert) {
  const { data, error } = await supabase
    .from('cars')
    .insert(car)
    .select()
    .single();

  if (error) {
    console.error('Error creating car:', error);
    throw error;
  }

  return data;
}

/**
 * Update an existing car listing
 */
export async function updateCar(id: string, updates: CarUpdate) {
  const { data, error } = await supabase
    .from('cars')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating car with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Delete a car listing
 */
export async function deleteCar(id: string) {
  const { error } = await supabase
    .from('cars')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting car with ID ${id}:`, error);
    throw error;
  }

  return true;
}

/**
 * Get cars by owner ID
 */
export async function getCarsByOwnerId(ownerId: string) {
  const { data, error } = await supabase
    .from('cars')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) {
    console.error(`Error fetching cars for owner ${ownerId}:`, error);
    throw error;
  }

  return data;
} 