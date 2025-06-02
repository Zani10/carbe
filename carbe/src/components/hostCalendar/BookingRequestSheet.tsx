import React, { useState } from 'react';
import { CalendarBooking } from '@/types/calendar';
import { 
  X, 
  User, 
  Mail, 
  Calendar,
  Euro,
  Clock,
  Check,
  AlertTriangle
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface BookingRequestSheetProps {
  booking: CalendarBooking;
  onApprove: (bookingId: string, message?: string) => void;
  onDecline: (bookingId: string, message?: string) => void;
  onClose: () => void;
}

export default function BookingRequestSheet({
  booking,
  onApprove,
  onDecline,
  onClose
}: BookingRequestSheetProps) {
  const [action, setAction] = useState<'approve' | 'decline' | null>(null);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const startDate = new Date(booking.start_date);
  const endDate = new Date(booking.end_date);
  const totalDays = differenceInDays(endDate, startDate) + 1;

  const handleSubmit = async () => {
    if (!action) return;
    
    setIsSubmitting(true);
    try {
      if (action === 'approve') {
        await onApprove(booking.id, message || undefined);
      } else {
        await onDecline(booking.id, message || undefined);
      }
      onClose();
    } catch (error) {
      console.error('Failed to process booking request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (action) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
        <div className="bg-[#212121] border-t border-gray-700/50 rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
            <h3 className="text-white font-semibold">
              {action === 'approve' ? 'Approve Booking' : 'Decline Booking'}
            </h3>
            <button
              onClick={() => setAction(null)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Message Input */}
            <div>
              <label className="block text-white font-medium mb-2">
                Message to Guest {action === 'approve' ? '(Optional)' : '(Required)'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  action === 'approve' 
                    ? "Welcome! Here are some important details about your trip..."
                    : "We're sorry, but we can't accommodate your request because..."
                }
                className="w-full bg-[#1F1F1F] border border-gray-600 text-white rounded-lg px-3 py-3 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent resize-none"
                rows={4}
                required={action === 'decline'}
              />
            </div>

            {action === 'approve' && (
              <div className="bg-[#00A680]/10 border border-[#00A680]/30 rounded-lg p-3">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-[#00A680] mr-3" />
                  <div>
                    <p className="text-[#00A680] font-medium">Ready to Approve</p>
                    <p className="text-gray-400 text-sm">Guest will be charged immediately</p>
                  </div>
                </div>
              </div>
            )}

            {action === 'decline' && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400 mr-3" />
                  <div>
                    <p className="text-red-300 font-medium">Declining Request</p>
                    <p className="text-red-400 text-sm">Please provide a reason for the guest</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setAction(null)}
                className="flex-1 px-4 py-3 bg-transparent border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
              >
                Back
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (action === 'decline' && !message.trim())}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  action === 'approve'
                    ? 'bg-[#00A680] text-white hover:bg-[#00A680]/90'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Processing...' : (action === 'approve' ? 'Approve' : 'Decline')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-[#212121] border-t border-gray-700/50 rounded-t-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <h3 className="text-white font-semibold">Booking Request</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Guest Info */}
          <div className="bg-[#1A1A1A] border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <User className="h-5 w-5 text-gray-400 mr-3" />
              <h4 className="text-white font-medium">Guest Information</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-gray-400 text-sm w-16">Name:</span>
                <span className="text-white">{booking.guest_name}</span>
              </div>
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-400 text-sm w-14">Email:</span>
                <span className="text-white text-sm">{booking.guest_email}</span>
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="bg-[#1A1A1A] border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Calendar className="h-5 w-5 text-gray-400 mr-3" />
              <h4 className="text-white font-medium">Trip Details</h4>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400 text-sm">Check-in</span>
                  <span className="text-white">{format(startDate, 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Check-out</span>
                  <span className="text-white">{format(endDate, 'MMM d, yyyy')}</span>
                </div>
              </div>
              
              <div className="pt-2 border-t border-gray-600">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Duration</span>
                  <span className="text-white">{totalDays} day{totalDays > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-[#1A1A1A] border border-gray-700/50 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Euro className="h-5 w-5 text-gray-400 mr-3" />
              <h4 className="text-white font-medium">Pricing Breakdown</h4>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">€{booking.daily_rate}/day × {totalDays} days</span>
                <span className="text-white">€{booking.daily_rate * totalDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Service fee</span>
                <span className="text-white">€{Math.round(booking.total_amount - (booking.daily_rate * totalDays))}</span>
              </div>
              <div className="border-t border-gray-600 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Total</span>
                  <span className="text-white font-semibold text-lg">€{booking.total_amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Urgency Note */}
          <div className="bg-[#FF8C00]/10 border border-[#FF8C00]/30 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-[#FF8C00] mr-2" />
              <p className="text-[#FF8C00] text-sm">
                Respond within 24 hours to maintain your response rate
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setAction('decline')}
              className="px-4 py-3 bg-transparent border border-red-600 text-red-400 rounded-lg hover:bg-red-600/10 transition-colors"
            >
              Decline
            </button>
            
            <button
              onClick={() => setAction('approve')}
              className="px-4 py-3 bg-[#00A680] text-white rounded-lg hover:bg-[#00A680]/90 transition-colors"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 