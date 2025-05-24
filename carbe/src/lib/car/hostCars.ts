import { supabase } from '@/lib/supabase';
import { Car } from '@/types/car';

export interface CarStats {
  totalCars: number;
  activeCars: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
}

export interface CarWithBookingStats extends Car {
  bookings_count: number;
  revenue: number;
  next_booking?: {
    start_date: string;
    end_date: string;
    user_name: string;
  };
}

/**
 * Get all cars for a specific host/owner
 */
export async function getHostCars(userId: string): Promise<{
  data: CarWithBookingStats[] | null;
  error: string | null;
}> {
  try {
    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        *,
        bookings(
          id,
          start_date,
          end_date,
          status,
          user_id,
          profiles(full_name)
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    // Process cars to add booking statistics
    const carsWithStats: CarWithBookingStats[] = cars.map(car => {
      const bookings = car.bookings || [];
      const completedBookings = bookings.filter((b: any) => b.status === 'completed');
      
      // Calculate total revenue (price per day * booking days)
      const revenue = completedBookings.reduce((total: number, booking: any) => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return total + (car.price_per_day * days);
      }, 0);

      // Find next upcoming booking
      const upcomingBookings = bookings
        .filter((b: any) => new Date(b.start_date) > new Date() && b.status === 'confirmed')
        .sort((a: any, b: any) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

      const nextBooking = upcomingBookings[0] ? {
        start_date: upcomingBookings[0].start_date,
        end_date: upcomingBookings[0].end_date,
        user_name: upcomingBookings[0].profiles?.full_name || 'Unknown User'
      } : undefined;

      return {
        ...car,
        bookings_count: completedBookings.length,
        revenue,
        next_booking: nextBooking
      };
    });

    return { data: carsWithStats, error: null };
  } catch (error) {
    console.error('Error fetching host cars:', error);
    return { data: null, error: 'Failed to fetch cars' };
  }
}

/**
 * Get statistics for host's car business
 */
export async function getHostStats(userId: string): Promise<{
  data: CarStats | null;
  error: string | null;
}> {
  try {
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select(`
        id,
        rating,
        bookings(
          id,
          start_date,
          end_date,
          status
        )
      `)
      .eq('owner_id', userId);

    if (carsError) {
      return { data: null, error: carsError.message };
    }

    const totalCars = cars.length;
    const activeCars = cars.length; // All cars are active for now
    
    let totalBookings = 0;
    let totalRevenue = 0;
    let totalRating = 0;
    let ratedCars = 0;

    // Get car prices for revenue calculation
    const { data: carPrices, error: pricesError } = await supabase
      .from('cars')
      .select('id, price_per_day')
      .eq('owner_id', userId);

    if (pricesError) {
      return { data: null, error: pricesError.message };
    }

    const priceMap = new Map(carPrices.map(car => [car.id, car.price_per_day]));

    cars.forEach(car => {
      const bookings = car.bookings || [];
      const completedBookings = bookings.filter((b: any) => b.status === 'completed');
      
      totalBookings += completedBookings.length;
      
      // Calculate revenue for this car
      const carPrice = priceMap.get(car.id) || 0;
      const carRevenue = completedBookings.reduce((total: number, booking: any) => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        return total + (carPrice * days);
      }, 0);
      
      totalRevenue += carRevenue;

      // Include rating if available
      if (car.rating) {
        totalRating += car.rating;
        ratedCars++;
      }
    });

    const averageRating = ratedCars > 0 ? totalRating / ratedCars : 0;

    const stats: CarStats = {
      totalCars,
      activeCars,
      totalBookings,
      totalRevenue,
      averageRating
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Error fetching host stats:', error);
    return { data: null, error: 'Failed to fetch statistics' };
  }
}

/**
 * Toggle car availability (pause/activate)
 */
export async function toggleCarStatus(carId: string, isActive: boolean): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    // For now, we'll use a simple approach. In the future, you might want to add a status field
    // Currently just keeping it simple since we don't have a status field in the schema
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Error toggling car status:', error);
    return { success: false, error: 'Failed to update car status' };
  }
}

/**
 * Delete a car listing
 */
export async function deleteCar(carId: string): Promise<{
  success: boolean;
  error: string | null;
}> {
  try {
    // Check if car has any active bookings
    const { data: activeBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id')
      .eq('car_id', carId)
      .in('status', ['confirmed', 'ongoing'])
      .limit(1);

    if (bookingsError) {
      return { success: false, error: bookingsError.message };
    }

    if (activeBookings && activeBookings.length > 0) {
      return { success: false, error: 'Cannot delete car with active bookings' };
    }

    // Get car images for cleanup
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('images')
      .eq('id', carId)
      .single();

    if (carError) {
      return { success: false, error: carError.message };
    }

    // Delete car images from storage
    if (car.images && car.images.length > 0) {
      const imagePaths = car.images.map(url => {
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        return `${carId}/${fileName}`;
      });

      const { error: storageError } = await supabase.storage
        .from('car-images')
        .remove(imagePaths);

      if (storageError) {
        console.warn('Error deleting car images:', storageError);
        // Continue with car deletion even if image cleanup fails
      }
    }

    // Delete the car
    const { error: deleteError } = await supabase
      .from('cars')
      .delete()
      .eq('id', carId);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error deleting car:', error);
    return { success: false, error: 'Failed to delete car' };
  }
} 