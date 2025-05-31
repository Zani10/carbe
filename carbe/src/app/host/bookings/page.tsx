'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, X, Car, Calendar, User, Euro } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking } from '@/hooks/booking/useBooking';
import { BookingWithCar } from '@/types/booking';

const HostBookingsPage: React.FC = () => {
  const { getPendingBookings, approveBooking, isLoading, isApproving } = useBooking();
  const [pendingBookings, setPendingBookings] = useState<BookingWithCar[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null);

  useEffect(() => {
    loadPendingBookings();
  }, []);

  const loadPendingBookings = async () => {
    const bookings = await getPendingBookings();
    setPendingBookings(bookings);
  };

  const handleApproval = async (bookingId: string, action: 'approve' | 'reject') => {
    setSelectedBooking(bookingId);
    
    const success = await approveBooking({
      booking_id: bookingId,
      action,
    });

    if (success) {
      // Remove the booking from pending list
      setPendingBookings(prev => prev.filter(b => b.id !== bookingId));
    }
    
    setSelectedBooking(null);
  };

  const formatTimeRemaining = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffHours = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours <= 0) return 'Expired';
    if (diffHours < 24) return `${diffHours}h remaining`;
    return format(deadlineDate, 'MMM d, HH:mm');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <motion.div
              className="w-8 h-8 border-4 border-[#FF2800] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Booking Requests</h1>
          <p className="text-gray-400">
            Review and manage booking requests for your vehicles
          </p>
        </div>

        {/* Pending Bookings */}
        {pendingBookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
            <p className="text-gray-400">
              You&apos;ll see booking requests here when guests request your cars
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingBookings.map((booking) => (
              <motion.div
                key={booking.id}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Car Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-[#FF2800]/10 rounded-full flex items-center justify-center">
                        <Car size={20} className="text-[#FF2800]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {booking.cars.year} {booking.cars.make} {booking.cars.model}
                        </h3>
                        <p className="text-sm text-gray-400">Vehicle</p>
                      </div>
                    </div>
                    
                    {booking.cars.images && booking.cars.images.length > 0 && (
                      <div className="w-full h-32 bg-gray-800 rounded-lg overflow-hidden">
                        <img
                          src={booking.cars.images[0]}
                          alt={`${booking.cars.make} ${booking.cars.model}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Booking Details */}
                  <div className="space-y-4">
                    {/* Guest Info */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                        <User size={20} className="text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {booking.snapshot_first_name} {booking.snapshot_last_name}
                        </h4>
                        <p className="text-sm text-gray-400">{booking.snapshot_email}</p>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                        <Calendar size={20} className="text-green-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">
                          {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
                        </h4>
                        <p className="text-sm text-gray-400">
                          {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                        <Euro size={20} className="text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">€{booking.total_amount}</h4>
                        <p className="text-sm text-gray-400">Total amount</p>
                      </div>
                    </div>

                    {/* Special Requests */}
                    {booking.special_requests && (
                      <div className="p-3 bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-300 font-medium mb-1">Special Requests:</p>
                        <p className="text-sm text-gray-400">{booking.special_requests}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    {/* Deadline */}
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Clock size={16} className="text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-400">Deadline</span>
                      </div>
                      <p className="text-sm text-white">
                        {booking.approval_deadline && formatTimeRemaining(booking.approval_deadline)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                      <motion.button
                        onClick={() => handleApproval(booking.id, 'approve')}
                        disabled={isApproving && selectedBooking === booking.id}
                        className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                        whileTap={{ scale: 0.98 }}
                      >
                        {isApproving && selectedBooking === booking.id ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            />
                            <span>Approving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={18} />
                            <span>Approve Booking</span>
                          </>
                        )}
                      </motion.button>

                      <motion.button
                        onClick={() => handleApproval(booking.id, 'reject')}
                        disabled={isApproving && selectedBooking === booking.id}
                        className="w-full flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50"
                        whileTap={{ scale: 0.98 }}
                      >
                        {isApproving && selectedBooking === booking.id ? (
                          <>
                            <motion.div
                              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                            />
                            <span>Rejecting...</span>
                          </>
                        ) : (
                          <>
                            <X size={18} />
                            <span>Reject Booking</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HostBookingsPage; 