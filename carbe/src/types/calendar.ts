export type AvailabilityStatus = 'unset' | 'available' | 'blocked' | 'pending' | 'booked' | 'mixed';

export interface AvailabilityRecord {
  id: string;
  car_id: string;
  date: string;
  status: 'available' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface PricingOverride {
  id: string;
  car_id: string;
  date: string;
  price_override: number;
  is_weekend_override: boolean;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  car_id: string;
  start_date: string;
  end_date: string;
  guest_name: string;
  guest_email: string;
  guest_avatar?: string;
  daily_rate: number;
  total_amount: number;
  nights: number;
  status: 'pending';
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

export interface UnifiedCellData {
  date: Date;
  status: AvailabilityStatus;
  price: number | 'multiple';
  hasOverride: boolean;
  isWeekend: boolean;
  pendingRequestsCount: number;
  bookingRequests: BookingRequest[];
  carConflicts?: {
    unset: string[];
    available: string[];
    blocked: string[];
    booked: string[];
    pending: string[];
  };
}

export interface CalendarData {
  availability: { [carId: string]: { [date: string]: 'unset' | 'available' | 'blocked' | 'pending' | 'booked' } };
  pricingOverrides: { [carId: string]: { [date: string]: number } };
  basePriceByCar: { [carId: string]: number };
  pendingRequestsByDate: { [date: string]: BookingRequest[] };
  bookings: CalendarBooking[];
}

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  type: string;
  image?: string;
  base_price: number;
}

export interface CalendarMetrics {
  totalRevenue: number;
  pendingRequestsCount: number;
  occupancyRate: number;
  averageRate: number;
}

export interface BulkOperation {
  type: 'availability' | 'pricing';
  dates: string[];
  carIds: string[];
  value: string | number; // 'blocked'/'available' for availability, number for pricing
  isWeekendOverride?: boolean;
}

export interface CalendarFilters {
  selectedCarIds: string[];
  displayMonth: string;
  activeTab: 'availability' | 'pricing';
}

export interface DateCellData {
  date: Date;
  status: AvailabilityStatus;
  price: number;
  hasOverride: boolean;
  isWeekend: boolean;
  booking?: CalendarBooking;
} 