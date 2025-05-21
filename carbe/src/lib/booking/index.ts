import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Booking = Database['public']['Tables']['bookings']['Row'];
export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Create a new booking
 */
export async function createBooking(booking: BookingInsert) {
  const { data, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }

  return data;
}

/**
 * Get a booking by ID
 */
export async function getBookingById(id: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(*)')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching booking with ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Get bookings for a user
 */
export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(*)')
    .eq('user_id', userId);

  if (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Get bookings for a car
 */
export async function getCarBookings(carId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('car_id', carId);

  if (error) {
    console.error(`Error fetching bookings for car ${carId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Update a booking's status
 */
export async function updateBookingStatus(id: string, status: BookingStatus) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating booking status for ID ${id}:`, error);
    throw error;
  }

  return data;
}

/**
 * Check if a car is available for a given date range
 */
export async function checkCarAvailability(
  carId: string,
  startDate: string,
  endDate: string,
  excludeBookingId?: string
) {
  // Query bookings that overlap with the requested date range
  let query = supabase
    .from('bookings')
    .select('*')
    .eq('car_id', carId)
    .not('status', 'eq', 'cancelled')
    .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

  // Exclude the current booking if we're updating an existing booking
  if (excludeBookingId) {
    query = query.neq('id', excludeBookingId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error checking car availability:', error);
    throw error;
  }

  // Car is available if no overlapping bookings are found
  return data.length === 0;
}

/**
 * Get host bookings (bookings for all cars owned by a host)
 */
export async function getHostBookings(hostId: string) {
  // First get all cars owned by this host
  const { data: cars, error: carsError } = await supabase
    .from('cars')
    .select('id')
    .eq('owner_id', hostId);

  if (carsError) {
    console.error(`Error fetching cars for host ${hostId}:`, carsError);
    throw carsError;
  }

  if (!cars || cars.length === 0) {
    return [];
  }

  // Get all bookings for these cars
  const carIds = cars.map(car => car.id);
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(*), profiles!bookings_user_id_fkey(*)')
    .in('car_id', carIds);

  if (error) {
    console.error(`Error fetching bookings for host ${hostId}:`, error);
    throw error;
  }

  return data;
} 