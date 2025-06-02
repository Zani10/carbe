export type AvailabilityStatus = 
  | 'available' 
  | 'blocked' 
  | 'pending' 
  | 'booked';

export interface CalendarAvailability {
  id: string;
  car_id: string;
  date: string; // YYYY-MM-DD format
  status: AvailabilityStatus;
  created_at: string;
  updated_at: string;
}

export interface PricingOverride {
  id: string;
  car_id: string;
  date: string; // YYYY-MM-DD format
  price_override: number;
  is_weekend_override: boolean;
  created_at: string;
  updated_at: string;
}

export interface CalendarData {
  availability: CalendarAvailability[];
  pricingOverrides: PricingOverride[];
  bookings: CalendarBooking[];
  basePrice: number;
}

export interface CalendarBooking {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  daily_rate: number;
  guest_name: string;
  guest_email: string;
  total_amount: number;
}

export interface DateCellData {
  date: Date;
  status: AvailabilityStatus;
  price: number;
  hasOverride: boolean;
  isWeekend: boolean;
  booking?: CalendarBooking;
}

export interface BulkOperation {
  dates: string[];
  operation: 'block' | 'unblock' | 'price_override';
  price?: number;
  car_ids: string[];
}

export interface CalendarFilters {
  selectedCarId: string | 'all';
  month: Date;
} 