import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const requestCookies = request.headers.get('cookie') || '';
    console.log('Request cookies:', requestCookies);
    
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    console.log('Available cookies:', allCookies.map(c => `${c.name}=${c.value.substring(0, 20)}...`));
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return allCookies;
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                console.log('Setting cookie:', name);
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              console.log('Error setting cookies:', error);
            }
          },
        },
      }
    );
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      error: authError?.message
    });
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ 
        error: 'Unauthorized',
        debug: {
          cookieCount: allCookies.length,
          hasCookies: requestCookies.length > 0,
          authError: authError?.message
        }
      }, { status: 401 });
    }

    // Get host's cars
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('id')
      .eq('owner_id', user.id);

    if (carsError) {
      console.error('Error fetching cars:', carsError);
      return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }

    if (!cars || cars.length === 0) {
      return NextResponse.json({
        totalEarnings: 0,
        thisMonth: 0,
        averageRating: 0,
        totalReviews: 0,
        totalBookings: 0,
      });
    }

    const carIds = cars.map(car => car.id);

    // Get bookings for this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const { data: thisMonthBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        total_amount,
        service_fee,
        status,
        start_date,
        end_date
      `)
      .in('car_id', carIds)
      .eq('status', 'completed')
      .gte('start_date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('end_date', lastDayOfMonth.toISOString().split('T')[0]);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // Get all completed bookings for total earnings
    const { data: allBookings, error: allBookingsError } = await supabase
      .from('bookings')
      .select(`
        total_amount,
        service_fee,
        status
      `)
      .in('car_id', carIds)
      .eq('status', 'completed');

    if (allBookingsError) {
      console.error('Error fetching all bookings:', allBookingsError);
      return NextResponse.json({ error: 'Failed to fetch all bookings' }, { status: 500 });
    }

    // Get reviews for average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('booking_reviews')
      .select('rating')
      .in('car_id', carIds);

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Calculate earnings (host gets 85% after service fee)
    const hostCommission = 0.85;
    
    const thisMonthEarnings = (thisMonthBookings || []).reduce((total, booking) => {
      const hostAmount = (parseFloat(booking.total_amount) - parseFloat(booking.service_fee || '0')) * hostCommission;
      return total + hostAmount;
    }, 0);

    const totalEarnings = (allBookings || []).reduce((total, booking) => {
      const hostAmount = (parseFloat(booking.total_amount) - parseFloat(booking.service_fee || '0')) * hostCommission;
      return total + hostAmount;
    }, 0);

    // Calculate average rating
    const averageRating = reviews && reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Count total bookings
    const totalBookings = allBookings ? allBookings.length : 0;
    const totalReviews = reviews ? reviews.length : 0;

    return NextResponse.json({
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      thisMonth: Math.round(thisMonthEarnings * 100) / 100,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      totalBookings,
    });

  } catch (error) {
    console.error('Error in earnings API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 