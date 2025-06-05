import { supabase } from '@/lib/supabase';
import { Car } from '@/types/car';

interface BookingData {
  id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'awaiting_approval' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  renter_id: string;
  total_amount?: number;
}

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
    console.log('Fetching cars for user:', userId);
    
    const { data: cars, error } = await supabase
      .from('cars')
      .select(`
        *,
        bookings(
          id,
          start_date,
          end_date,
          status,
          renter_id,
          total_amount
        )
      `)
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error fetching cars:', error);
      return { data: null, error: error.message };
    }

    console.log('Fetched cars:', cars?.length || 0);

    // Process cars to add booking statistics
    const carsWithStats: CarWithBookingStats[] = cars.map(car => {
      const bookings = car.bookings as BookingData[] || [];
      
      // Count bookings that generate revenue (confirmed, active, completed)
      const revenueBookings = bookings.filter((b: BookingData) => 
        ['confirmed', 'active', 'completed'].includes(b.status)
      );
      
      // Calculate total revenue from booking amounts or daily rate calculation
      const revenue = revenueBookings.reduce((total: number, booking: BookingData) => {
        // Try to use total_amount from booking if available, otherwise calculate
        if (booking.total_amount) {
          return total + booking.total_amount;
        } else {
          // Fallback to calculating from daily rate
          const startDate = new Date(booking.start_date);
          const endDate = new Date(booking.end_date);
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return total + (car.price_per_day * days);
        }
      }, 0);

      // Find next upcoming booking
      const upcomingBookings = bookings
        .filter((b: BookingData) => new Date(b.start_date) > new Date() && b.status === 'confirmed')
        .sort((a: BookingData, b: BookingData) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

      const nextBooking = upcomingBookings[0] ? {
        start_date: upcomingBookings[0].start_date,
        end_date: upcomingBookings[0].end_date,
        user_name: 'Renter' // We'll fetch this separately if needed
      } : undefined;

      return {
        ...car,
        bookings_count: revenueBookings.length,
        revenue,
        next_booking: nextBooking
      };
    });

    console.log('Processed cars with stats:', carsWithStats.map(car => ({
      id: car.id,
      make: car.make,
      model: car.model,
      bookings_count: car.bookings_count,
      revenue: car.revenue
    })));

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
          status,
          total_amount
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

    // Get car prices for revenue calculation fallback
    const { data: carPrices, error: pricesError } = await supabase
      .from('cars')
      .select('id, price_per_day')
      .eq('owner_id', userId);

    if (pricesError) {
      return { data: null, error: pricesError.message };
    }

    const priceMap = new Map(carPrices.map(car => [car.id, car.price_per_day]));

    cars.forEach(car => {
      const bookings = car.bookings as BookingData[] || [];
      
      // Count bookings that generate revenue (confirmed, active, completed)
      const revenueBookings = bookings.filter((b: BookingData) => 
        ['confirmed', 'active', 'completed'].includes(b.status)
      );
      
      totalBookings += revenueBookings.length;
      
      // Calculate revenue for this car
      const carPrice = priceMap.get(car.id) || 0;
      const carRevenue = revenueBookings.reduce((total: number, booking: BookingData) => {
        // Try to use total_amount from booking if available, otherwise calculate
        if (booking.total_amount) {
          return total + booking.total_amount;
        } else {
          // Fallback to calculating from daily rate
          const startDate = new Date(booking.start_date);
          const endDate = new Date(booking.end_date);
          const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          return total + (carPrice * days);
        }
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

    console.log('Calculated host stats:', stats);

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
    const { error } = await supabase
      .from('cars')
      .update({ is_available: isActive })
      .eq('id', carId);

    if (error) {
      return { success: false, error: error.message };
    }
    
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
      .in('status', ['confirmed', 'active'])
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
      const imagePaths = car.images.map((url: string) => {
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