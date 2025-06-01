import { useState } from 'react';
import { format } from 'date-fns';
import Image from 'next/image';
import { 
  Clock, 
  Calendar, 
  Car, 
  User, 
  MessageSquare,
  Check,
  X,
  Loader2,
  Euro
} from 'lucide-react';
import { BookingWithCar } from '@/types/booking';
import { useBooking } from '@/hooks/booking/useBooking';
import { toast } from 'react-hot-toast';

interface BookingApprovalCardProps {
  booking: BookingWithCar;
  onApproval?: () => void;
}

export default function BookingApprovalCard({ booking, onApproval }: BookingApprovalCardProps) {
  const { approveBooking, isApproving } = useBooking();
  const [showDetails, setShowDetails] = useState(false);

  const handleApproval = async (action: 'approve' | 'reject') => {
    try {
      const success = await approveBooking({
        booking_id: booking.id,
        action,
      });

      if (success) {
        toast.success(action === 'approve' ? 'Booking approved!' : 'Booking rejected');
        onApproval?.();
      }
    } catch (error) {
      console.error('Error handling approval:', error);
      toast.error('Failed to process booking');
    }
  };

  const calculateDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="bg-[#2A2A2A] border border-gray-700/50 rounded-xl overflow-hidden">
      {/* Main Card Content */}
      <div className="p-4">
        <div className="flex items-start space-x-4">
          {/* Car Image */}
          <div className="w-16 h-12 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
            {booking.cars.images && booking.cars.images.length > 0 ? (
              <Image
                src={booking.cars.images[0]}
                alt={`${booking.cars.make} ${booking.cars.model}`}
                width={64}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                <Car className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Booking Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-white font-medium text-sm">
                  {booking.cars.make} {booking.cars.model}
                </h3>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {booking.snapshot_first_name} {booking.snapshot_last_name}
                </div>
              </div>
              <div className="flex items-center text-xs text-yellow-500">
                <Clock className="h-3 w-3 mr-1" />
                Pending
              </div>
            </div>

            <div className="flex items-center text-xs text-gray-400 mb-2">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
              <span className="ml-1">({calculateDuration()} day{calculateDuration() > 1 ? 's' : ''})</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm font-medium text-white">
                <Euro className="h-3 w-3 mr-1" />
                {booking.total_amount}
              </div>
              
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-xs text-[#FF4646] hover:text-[#FF4646]/80"
              >
                {showDetails ? 'Hide details' : 'View details'}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-4">
          <button
            onClick={() => handleApproval('reject')}
            disabled={isApproving}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <X className="h-4 w-4 mr-2" />
                Reject
              </>
            )}
          </button>
          
          <button
            onClick={() => handleApproval('approve')}
            disabled={isApproving}
            className="flex-1 flex items-center justify-center px-4 py-2.5 bg-[#FF4646] text-white rounded-lg hover:bg-[#FF4646]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApproving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Approve
              </>
            )}
          </button>

          <button
            className="px-4 py-2.5 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            onClick={() => {/* Navigate to chat */}}
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expandable Details */}
      {showDetails && (
        <div className="border-t border-gray-700/50 p-4 bg-[#232323]">
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Renter:</span>
              <span className="text-white ml-2">
                {booking.snapshot_first_name} {booking.snapshot_last_name}
              </span>
            </div>
            
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="text-white ml-2">{booking.snapshot_email}</span>
            </div>

            {booking.special_requests && (
              <div>
                <span className="text-gray-400">Special requests:</span>
                <p className="text-white mt-1">{booking.special_requests}</p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-700/50">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Subtotal ({calculateDuration()} days):</span>
                <span className="text-white">€{booking.subtotal}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-gray-400">Service fee:</span>
                <span className="text-white">€{booking.service_fee}</span>
              </div>
              <div className="flex justify-between text-sm font-medium mt-2 pt-2 border-t border-gray-700/50">
                <span className="text-white">Total:</span>
                <span className="text-white">€{booking.total_amount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 