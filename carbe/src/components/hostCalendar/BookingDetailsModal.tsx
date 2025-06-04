import React from 'react';
import { format, parseISO } from 'date-fns';
import { X, User, Calendar, Euro, MessageCircle, AlertTriangle } from 'lucide-react';
import { CalendarBooking } from '@/types/calendar';

interface BookingDetailsModalProps {
  booking: CalendarBooking;
  onMessage?: () => void;
  onCancel?: () => Promise<void>;
  onClose: () => void;
}

export default function BookingDetailsModal({
  booking,
  onMessage,
  onCancel,
  onClose
}: BookingDetailsModalProps) {
  const startDate = parseISO(booking.start_date);
  const endDate = parseISO(booking.end_date);
  const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'completed':
        return 'text-blue-400';
      case 'cancelled':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const canCancel = booking.status === 'confirmed' && new Date() < startDate;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-t-xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Reservation Details</h3>
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
              <User className="h-6 w-6 text-gray-300" />
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
                <p className="text-gray-400 text-sm">{nights} night{nights > 1 ? 's' : ''}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Euro className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-white font-medium">€{booking.total_amount.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">€{booking.daily_rate} per night</p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-400' :
                  booking.status === 'pending' ? 'bg-yellow-400' :
                  booking.status === 'completed' ? 'bg-blue-400' :
                  'bg-red-400'
                }`} />
              </div>
              <div>
                <p className={`font-medium ${getStatusColor(booking.status)}`}>
                  {getStatusText(booking.status)}
                </p>
                <p className="text-gray-400 text-sm">Reservation status</p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-white text-sm">
              {booking.status === 'confirmed' 
                ? 'This reservation is confirmed. The guest will receive check-in instructions before their trip.'
                : booking.status === 'completed'
                ? 'This trip has been completed. You can now leave a review for this guest.'
                : booking.status === 'cancelled'
                ? 'This reservation has been cancelled.'
                : 'This reservation is awaiting confirmation.'
              }
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3 p-6 border-t border-gray-700">
          {onMessage && (
            <button
              onClick={onMessage}
              className="flex items-center space-x-2 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Message Guest</span>
            </button>
          )}
          
          {onCancel && canCancel && (
            <button
              onClick={onCancel}
              className="flex items-center space-x-2 px-4 py-3 border border-red-600 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Cancel</span>
            </button>
          )}
          
          {(!onMessage && !canCancel) && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 