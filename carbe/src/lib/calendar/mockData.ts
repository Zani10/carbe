import { CalendarData, CalendarBooking, BookingRequest } from '@/types/calendar';
import { format } from 'date-fns';

export const getMockCalendarData = (month: Date): CalendarData => {
  const currentMonth = month.getMonth();
  const currentYear = month.getFullYear();

  // Generate some mock bookings for demo
  const mockBookings: CalendarBooking[] = [
    {
      id: '1',
      car_id: '1',
      start_date: format(new Date(currentYear, currentMonth, 5), 'yyyy-MM-dd'),
      end_date: format(new Date(currentYear, currentMonth, 8), 'yyyy-MM-dd'),
      status: 'confirmed',
      daily_rate: 85,
      guest_name: 'Sarah Johnson',
      guest_email: 'sarah@example.com',
      total_amount: 340
    },
    {
      id: '2',
      car_id: '1',
      start_date: format(new Date(currentYear, currentMonth, 15), 'yyyy-MM-dd'),
      end_date: format(new Date(currentYear, currentMonth, 17), 'yyyy-MM-dd'),
      status: 'pending',
      daily_rate: 85,
      guest_name: 'Mike Chen',
      guest_email: 'mike@example.com',
      total_amount: 255
    },
    {
      id: '3',
      car_id: '1',
      start_date: format(new Date(currentYear, currentMonth, 22), 'yyyy-MM-dd'),
      end_date: format(new Date(currentYear, currentMonth, 25), 'yyyy-MM-dd'),
      status: 'confirmed',
      daily_rate: 95,
      guest_name: 'Emma Davis',
      guest_email: 'emma@example.com',
      total_amount: 380
    }
  ];

  // Mock availability (some blocked dates)
  const availability = [
    {
      id: '1',
      car_id: '1',
      date: format(new Date(currentYear, currentMonth, 10), 'yyyy-MM-dd'),
      status: 'blocked' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      car_id: '1',
      date: format(new Date(currentYear, currentMonth, 11), 'yyyy-MM-dd'),
      status: 'blocked' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Mock pricing overrides (some special pricing)
  const pricingOverrides = [
    {
      id: '1',
      car_id: '1',
      date: format(new Date(currentYear, currentMonth, 29), 'yyyy-MM-dd'),
      price_override: 120,
      is_weekend_override: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      car_id: '1',
      date: format(new Date(currentYear, currentMonth, 30), 'yyyy-MM-dd'),
      price_override: 120,
      is_weekend_override: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Transform availability array to object structure
  const availabilityByCarAndDate: { [carId: string]: { [date: string]: 'available' | 'blocked' | 'pending' | 'booked' } } = {};
  
  // Initialize with default 'available' status for car '1'
  availabilityByCarAndDate['1'] = {};
  
  // Add blocked dates
  availability.forEach(record => {
    if (!availabilityByCarAndDate[record.car_id]) {
      availabilityByCarAndDate[record.car_id] = {};
    }
    availabilityByCarAndDate[record.car_id][record.date] = record.status;
  });

  // Add booked dates from bookings
  mockBookings.forEach(booking => {
    if (booking.status === 'confirmed') {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        if (!availabilityByCarAndDate[booking.car_id]) {
          availabilityByCarAndDate[booking.car_id] = {};
        }
        availabilityByCarAndDate[booking.car_id][dateStr] = 'booked';
      }
    } else if (booking.status === 'pending') {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = format(d, 'yyyy-MM-dd');
        if (!availabilityByCarAndDate[booking.car_id]) {
          availabilityByCarAndDate[booking.car_id] = {};
        }
        availabilityByCarAndDate[booking.car_id][dateStr] = 'pending';
      }
    }
  });

  // Transform pricing overrides array to object structure
  const pricingOverridesByCarAndDate: { [carId: string]: { [date: string]: number } } = {};
  
  pricingOverrides.forEach(override => {
    if (!pricingOverridesByCarAndDate[override.car_id]) {
      pricingOverridesByCarAndDate[override.car_id] = {};
    }
    pricingOverridesByCarAndDate[override.car_id][override.date] = override.price_override;
  });

  // Group pending requests by date
  const pendingRequestsByDate: { [date: string]: BookingRequest[] } = {};
  mockBookings
    .filter(booking => booking.status === 'pending')
    .forEach(booking => {
      const startDate = booking.start_date;
      if (!pendingRequestsByDate[startDate]) {
        pendingRequestsByDate[startDate] = [];
      }
      pendingRequestsByDate[startDate].push({
        id: booking.id,
        car_id: booking.car_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        guest_name: booking.guest_name,
        guest_email: booking.guest_email,
        daily_rate: booking.daily_rate,
        total_amount: booking.total_amount,
        nights: Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24)),
        status: 'pending' as const
      });
    });

  return {
    availability: availabilityByCarAndDate,
    pricingOverrides: pricingOverridesByCarAndDate,
    basePriceByCar: { '1': 85, '2': 95 },
    pendingRequestsByDate,
    bookings: mockBookings
  };
}; 