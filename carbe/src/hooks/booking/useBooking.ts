import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  getHostPendingBookings,
  getHostBookings as getHostBookingsLib,
  getUserBookings,
  getBookingById,
} from '@/lib/booking/safe';
import {
  BookingRequest,
  Booking,
  BookingWithCar,
  HostApprovalData,
  PaymentIntent,
} from '@/types/booking';

interface UseBookingReturn {
  // Booking creation
  createBooking: (data: BookingData) => Promise<{ booking: Booking; paymentIntent: PaymentIntent } | null>;
  confirmPayment: (bookingId: string) => Promise<boolean>;
  
  // Host approval
  approveBooking: (data: HostApprovalData) => Promise<boolean>;
  getPendingBookings: () => Promise<BookingWithCar[]>;
  getHostBookings: () => Promise<BookingWithCar[]>;
  
  // Booking management
  cancelUserBooking: (bookingId: string) => Promise<boolean>;
  getUserBookings: () => Promise<BookingWithCar[]>;
  getUserBookingHistory: () => Promise<BookingWithCar[]>;
  getBookingDetails: (bookingId: string) => Promise<BookingWithCar | null>;
  
  // Loading states
  isCreating: boolean;
  isConfirming: boolean;
  isApproving: boolean;
  isCancelling: boolean;
  isLoading: boolean;
}

interface BookingData extends BookingRequest {
  daily_rate: number;
  subtotal: number;
  service_fee: number;
  total_amount: number;
  requiresApproval?: boolean;
}

export function useBooking(): UseBookingReturn {
  const { user, profile } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createBooking = useCallback(async (data: BookingData) => {
    if (!user || !profile) {
      toast.error('Please sign in to book a car');
      return null;
    }

    setIsCreating(true);
    try {
      const fullName = profile.full_name || '';
      const [firstName, ...lastNameParts] = fullName.split(' ');
      const lastName = lastNameParts.join(' ');

      // Call API route instead of direct function
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingData: data,
          userProfile: {
            id: user.id,
            email: user.email || '',
            first_name: firstName || '',
            last_name: lastName || '',
            phone: '', // Profile doesn't have phone field in current schema
            license_number: '', // Profile doesn't have license field in current schema
          },
          requiresApproval: data.requiresApproval || false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();

      if (data.requiresApproval) {
        toast.success('Booking request sent! Waiting for host approval.');
      } else {
        toast.success('Booking created! Complete your payment to confirm.');
      }

      return {
        booking: result.booking,
        paymentIntent: result.paymentIntent,
      };
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Failed to create booking. Please try again.');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [user, profile]);

  const confirmPayment = useCallback(async (bookingId: string) => {
    setIsConfirming(true);
    try {
      const response = await fetch('/api/bookings/confirm-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to confirm payment');
      }

      const result = await response.json();
      
      if (result.confirmed) {
        toast.success('Payment confirmed! Your booking is now active.');
        return true;
      } else {
        toast.error('Payment confirmation failed. Please try again.');
        return false;
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment. Please try again.');
      return false;
    } finally {
      setIsConfirming(false);
    }
  }, []);

  const approveBooking = useCallback(async (data: HostApprovalData) => {
    setIsApproving(true);
    try {
      const response = await fetch('/api/bookings/host-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process approval');
      }

      const result = await response.json();
      
      if (result.success) {
        const action = data.action === 'approve' ? 'approved' : 'rejected';
        toast.success(`Booking ${action} successfully!`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error handling booking approval:', error);
      toast.error('Failed to process booking. Please try again.');
      return false;
    } finally {
      setIsApproving(false);
    }
  }, []);

  const getPendingBookings = useCallback(async () => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const bookings = await getHostPendingBookings(user.id);
      return bookings as BookingWithCar[];
    } catch (error) {
      console.error('Error fetching pending bookings:', error);
      toast.error('Failed to load pending bookings.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const cancelUserBooking = useCallback(async (bookingId: string) => {
    setIsCancelling(true);
    try {
      const response = await fetch('/api/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to cancel booking');
      }

      const result = await response.json();
      
      if (result.success) {
        toast.success('Booking cancelled successfully!');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking. Please try again.');
      return false;
    } finally {
      setIsCancelling(false);
    }
  }, []);

  const getUserBookingHistory = useCallback(async () => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const bookings = await getUserBookings(user.id);
      return bookings as BookingWithCar[];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      toast.error('Failed to load booking history.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const getBookingDetails = useCallback(async (bookingId: string) => {
    setIsLoading(true);
    try {
      const booking = await getBookingById(bookingId);
      return booking as BookingWithCar;
    } catch (error) {
      console.error('Error fetching booking details:', error);
      toast.error('Failed to load booking details.');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getHostBookings = useCallback(async () => {
    if (!user) return [];

    setIsLoading(true);
    try {
      const bookings = await getHostBookingsLib(user.id);
      return bookings as BookingWithCar[];
    } catch (error) {
      console.error('Error fetching host bookings:', error);
      toast.error('Failed to load host bookings.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user]);

      return {
    createBooking,
    confirmPayment,
    approveBooking,
    getPendingBookings,
    getHostBookings,
    cancelUserBooking,
    getUserBookings: getUserBookingHistory, // Alias for consistency
    getUserBookingHistory,
    getBookingDetails,
    isCreating,
    isConfirming,
    isApproving,
    isCancelling,
    isLoading,
  };
}
