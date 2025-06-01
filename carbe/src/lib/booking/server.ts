import { supabaseService } from '@/lib/supabase/service';
import { Database } from '@/types/supabase';
import { 
  BookingRequest, 
} from '@/types/booking';
import { 
  createPaymentIntent, 
  cancelPayment,
  createOrRetrieveCustomer 
} from '@/lib/stripe';

export type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
export type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

/**
 * Server-side: Create a new booking with payment authorization
 * Uses authenticated Supabase client for RLS compliance
 */
export async function createBookingWithPaymentServer({
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
    // Use service role client (RLS disabled, app-level security implemented above)
    const supabase = supabaseService;

    // SECURITY: Validate that the booking is for the authenticated user
    if (!userProfile.id) {
      throw new Error('User authentication required');
    }

    // SECURITY: Verify the car exists and is available
    const { data: car, error: carError } = await supabase
      .from('cars')
      .select('*')
      .eq('id', bookingData.car_id)
      .single();

    if (carError || !car) {
      throw new Error('Car not found or unavailable');
    }

    // SECURITY: Ensure user cannot book their own car
    if (car.owner_id === userProfile.id) {
      throw new Error('Cannot book your own car');
    }

    console.log('💳 Creating Stripe customer...');
    // Step 1: Create Stripe customer if needed
    const customerId = await createOrRetrieveCustomer({
      email: userProfile.email,
      name: `${userProfile.first_name} ${userProfile.last_name}`,
      userId: userProfile.id,
    });

    console.log('💰 Creating payment intent...');
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

    console.log('📝 Creating booking in database...');
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

    console.log('🔐 Inserting with authenticated client...', { renter_id: userProfile.id });
    
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) {
      console.error('💥 Database error:', error);
      // If booking creation fails, cancel the payment intent
      await cancelPayment(paymentIntent.id);
      throw error;
    }

    console.log('✅ Booking created successfully:', newBooking.id);
    return {
      booking: newBooking,
      paymentIntent,
    };
  } catch (error) {
    console.error('Error creating booking with payment:', error);
    throw error;
  }
} 