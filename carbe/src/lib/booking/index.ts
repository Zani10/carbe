import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';
import { 
  BookingStatus, 
  PaymentStatus, 
  BookingRequest, 
  HostApprovalData 
} from '@/types/booking';
import { 
  createPaymentIntent, 
  capturePayment, 
  cancelPayment,
  createRefund,
  createOrRetrieveCustomer 
} from '@/lib/stripe';

export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

/**
 * Create a new booking with payment authorization
 */
export async function createBookingWithPayment({
  bookingData,
  userProfile,
  requiresApproval = false,
}: {
  bookingData: BookingRequest & {
    daily_rate: number;
    subtotal: number;
    service_fee: number;
    total_amount: number;
  };
  userProfile: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    license_number?: string;
  };
  requiresApproval: boolean;
}) {
  try {
    // Step 1: Create Stripe customer if needed
    const customerId = await createOrRetrieveCustomer({
      email: userProfile.email,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      userId: userProfile.id,
    });

    // Step 2: Create payment intent with auth-only
    const paymentIntent = await createPaymentIntent({
      amount: bookingData.total_amount,
      customerId,
      metadata: {
        carId: bookingData.car_id,
        startDate: bookingData.start_date,
        endDate: bookingData.end_date,
      },
    });

    // Step 3: Create booking in database
    const booking = {
      car_id: bookingData.car_id,
      renter_id: userProfile.id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      daily_rate: bookingData.daily_rate,
      subtotal: bookingData.subtotal,
      service_fee: bookingData.service_fee,
      total_amount: bookingData.total_amount,
      snapshot_first_name: userProfile.first_name,
      snapshot_last_name: userProfile.last_name,
      snapshot_email: userProfile.email,
      snapshot_phone: userProfile.phone || '',
      snapshot_license_number: userProfile.license_number || '',
      special_requests: bookingData.special_requests,
      status: requiresApproval ? 'awaiting_approval' : 'pending',
      payment_status: 'pending',
      payment_intent_id: paymentIntent.id,
    };

    const { data: newBooking, error } = await supabase
    .from('bookings')
    .insert(booking)
    .select()
    .single();

  if (error) {
      // If booking creation fails, cancel the payment intent
      await cancelPayment(paymentIntent.id);
      throw error;
    }

    return {
      booking: newBooking,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error creating booking with payment:', error);
    throw error;
  }
}

/**
 * Confirm booking after payment authorization
 */
export async function confirmBookingPayment(bookingId: string) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    if (!booking.payment_intent_id) {
      throw new Error('No payment intent found for booking');
    }

    // Update booking status to show payment is authorized
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'authorized',
        status: booking.status === 'pending' ? 'confirmed' : booking.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId);

    if (updateError) {
      throw updateError;
    }

    return true;
  } catch (error) {
    console.error('Error confirming booking payment:', error);
    throw error;
  }
}

/**
 * Host approves or rejects a booking
 */
export async function handleHostApproval({
  booking_id,
  action,
}: HostApprovalData) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, cars(*)')
      .eq('id', booking_id)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'awaiting_approval' && booking.status !== 'pending') {
      throw new Error('Booking is not awaiting approval');
    }

    const newStatus: BookingStatus = action === 'approve' ? 'confirmed' : 'rejected';
    let paymentStatus: PaymentStatus = booking.payment_status;

    // Handle payment based on action
    if (action === 'approve' && booking.payment_intent_id) {
      try {
        // Check if payment is properly authorized first
        const { getPaymentIntentStatus } = await import('@/lib/stripe');
        const currentStatus = await getPaymentIntentStatus(booking.payment_intent_id);
        
        if (currentStatus === 'requires_capture') {
          const captured = await capturePayment(booking.payment_intent_id);
          paymentStatus = captured ? 'captured' : 'failed';
        } else {
          console.warn(`Payment intent ${booking.payment_intent_id} has status ${currentStatus}, cannot capture`);
          // For now, approve the booking anyway but keep payment status as is
          paymentStatus = booking.payment_status;
        }
      } catch (paymentError) {
        console.error('Payment processing error:', paymentError);
        // Don't fail the approval if payment fails - approve booking anyway
        paymentStatus = booking.payment_status;
      }
    } else if (action === 'reject' && booking.payment_intent_id) {
      try {
        await cancelPayment(booking.payment_intent_id);
        paymentStatus = 'refunded';
      } catch (paymentError) {
        console.error('Payment cancellation error:', paymentError);
        paymentStatus = 'failed';
      }
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: newStatus,
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedBooking;
  } catch (error) {
    console.error('Error handling host approval:', error);
    throw error;
  }
}

/**
 * Get pending bookings for host approval
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
      .in('status', ['pending', 'awaiting_approval'])
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
 * Cancel booking and handle refund
 */
export async function cancelBooking(bookingId: string) {
  try {
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error || !booking) {
      throw new Error('Booking not found');
    }

    // Handle payment refund if needed
    let paymentStatus: PaymentStatus = booking.payment_status;
    
    if (booking.payment_intent_id) {
      if (booking.payment_status === 'captured') {
        // Create refund for captured payment
        const refunded = await createRefund({
          paymentIntentId: booking.payment_intent_id,
        });
        paymentStatus = refunded ? 'refunded' : 'failed';
      } else if (booking.payment_status === 'authorized') {
        // Cancel authorized payment
        await cancelPayment(booking.payment_intent_id);
        paymentStatus = 'refunded';
      }
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        payment_status: paymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return updatedBooking;
  } catch (error) {
    console.error('Error canceling booking:', error);
    throw error;
  }
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
    .eq('renter_id', userId);

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
    .select('*, cars(*)')
    .in('car_id', carIds);

  if (error) {
    console.error(`Error fetching bookings for host ${hostId}:`, error);
    throw error;
  }

  return data;
} 