import React from 'react';
import { format, parseISO } from 'date-fns';
import { X, User, Calendar, Euro } from 'lucide-react';
import { BookingRequest } from '@/types/calendar';

interface BookingRequestSheetProps {
  booking: BookingRequest;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  onClose: () => void;
}

export default function BookingRequestSheet({
  booking,
  onApprove,
  onDecline,
  onClose
}: BookingRequestSheetProps) {
  const startDate = parseISO(booking.start_date);
  const endDate = parseISO(booking.end_date);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-t-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Booking Request</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Guest Info */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
              {booking.guest_avatar ? (
                <img src={booking.guest_avatar} alt={booking.guest_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-gray-300" />
              )}
            </div>
            <div>
              <h4 className="text-white font-medium">{booking.guest_name}</h4>
              <p className="text-gray-400 text-sm">{booking.guest_email}</p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">
                  {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                </p>
                <p className="text-gray-400 text-sm">{booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Euro className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">€{booking.total_amount.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">€{booking.daily_rate} per night</p>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-white text-sm">
              This guest is requesting to book your vehicle for the selected dates. 
              Please respond within 24 hours to maintain your response rate.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onDecline}
            className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Decline
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-3 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors"
          >
            Approve
          </button>
        </div>
      </div>
    </div>
  );
} 