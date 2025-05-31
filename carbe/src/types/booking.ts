export type BookingStatus = 
  | 'pending' 
  | 'awaiting_approval' 
  | 'confirmed' 
  | 'active' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type PaymentStatus = 
  | 'pending' 
  | 'authorized' 
  | 'captured' 
  | 'failed' 
  | 'refunded';

export type CancellationPolicy = 
  | 'strict' 
  | 'moderate' 
  | 'flexible';

export interface Booking {
  id: string;
  car_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  daily_rate: number;
  subtotal: number;
  service_fee: number;
  total_amount: number;
  snapshot_first_name: string;
  snapshot_last_name: string;
  snapshot_email: string;
  snapshot_phone: string;
  snapshot_license_number: string;
  special_requests?: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  payment_intent_id?: string;
  approval_deadline?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  car_id: string;
  start_date: string;
  end_date: string;
  special_requests?: string;
}

export interface BookingWithCar extends Booking {
  cars: {
    id: string;
    make: string;
    model: string;
    year: number;
    images: string[];
    requires_approval: boolean;
    cancellation_policy: CancellationPolicy;
    owner_id: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  client_secret: string;
}

export interface HostApprovalData {
  booking_id: string;
  action: 'approve' | 'reject';
  message?: string;
}
