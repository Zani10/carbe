import { CalendarData, CalendarBooking } from '@/types/calendar';
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

  return {
    availability,
    pricingOverrides,
    bookings: mockBookings,
    basePrice: 85
  };
}; 