import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { BookingStatus } from '@/types/booking';

export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

/**
 * Get a booking by ID (safe for client-side)
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
 * Get bookings for a user (safe for client-side)
 */
export async function getUserBookings(userId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .select('*, cars(*)')
    .eq('renter_id', userId);

  if (error) {
    console.error(`Error fetching bookings for user ${userId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Get pending bookings for host approval (safe for client-side)
 */
export async function getHostPendingBookings(hostId: string) {
  try {
    // Get all cars owned by this host
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', hostId);

    if (carsError) {
      throw carsError;
    }

    if (!cars || cars.length === 0) {
      return [];
    }

    // Get pending bookings for these cars
    const carIds = cars.map(car => car.id);
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        cars (
          id, make, model, year, images, price_per_day
        ),
        profiles!bookings_renter_id_fkey (
          id, first_name, last_name, email, phone
        )
      `)
      .in('car_id', carIds)
      .eq('status', 'awaiting_approval')
      .order('created_at', { ascending: true });

    if (error) {
      throw error;
    }

    return bookings;
  } catch (error) {
    console.error('Error fetching host pending bookings:', error);
    throw error;
  }
}

/**
 * Get host bookings (bookings for all cars owned by a host) (safe for client-side)
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
    .select('*, cars(*)')
    .in('car_id', carIds);

  if (error) {
    console.error(`Error fetching bookings for host ${hostId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Update a booking's status (safe for client-side, limited operations)
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
 * Check if a car is available for a given date range (safe for client-side)
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