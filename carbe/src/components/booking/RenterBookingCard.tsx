import React from 'react';
import { format, differenceInDays } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Car, 
  Clock, 
  MessageSquare,
  AlertCircle,
  Star,
  MapPin
} from 'lucide-react';
import { BookingWithCar, BookingStatus } from '@/types/booking';

interface RenterBookingCardProps {
  booking: BookingWithCar;
}

export default function RenterBookingCard({ booking }: RenterBookingCardProps) {
  const router = useRouter();

  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return {
          text: 'Confirmed',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          dotColor: 'bg-green-400'
        };
      case 'pending':
      case 'awaiting_approval':
        return {
          text: 'Pending',
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/10',
          borderColor: 'border-amber-500/20',
          dotColor: 'bg-amber-400'
        };
      case 'completed':
        return {
          text: 'Completed',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          dotColor: 'bg-blue-400'
        };
      case 'cancelled':
      case 'rejected':
        return {
          text: status === 'rejected' ? 'Declined' : 'Cancelled',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          dotColor: 'bg-red-400'
        };
      default:
        return {
          text: 'Processing',
          textColor: 'text-gray-400',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          dotColor: 'bg-gray-400'
        };
    }
  };

  const calculateDuration = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    return differenceInDays(end, start) + 1;
  };

  const isUpcoming = () => {
    const now = new Date();
    const startDate = new Date(booking.start_date);
    return startDate > now;
  };

  const isPending = () => {
    return booking.status === 'pending' || booking.status === 'awaiting_approval';
  };

  const handleCardClick = () => {
    if (isPending()) {
      // If pending, go to car detail page
      router.push(`/car/${booking.cars.id}`);
    } else if (booking.status === 'confirmed') {
      // If confirmed, go to trip details page
      router.push(`/trips/${booking.id}`);
    }
    // For other statuses, could go to general booking details
  };

  const statusConfig = getStatusConfig(booking.status);

  return (
    <div 
      className="bg-[#2A2A2A] border border-gray-700/50 rounded-2xl overflow-hidden hover:border-gray-600/60 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="p-4">
        <div className="flex items-center space-x-4">
          {/* Car Image - Compact */}
          <div className="relative w-16 h-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden flex-shrink-0">
            {booking.cars.images && booking.cars.images.length > 0 ? (
              <Image
                src={booking.cars.images[0]}
                alt={`${booking.cars.make} ${booking.cars.model}`}
                width={64}
                height={48}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <Car className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Car & Trip Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white leading-tight mb-1">
                  {booking.cars.make} {booking.cars.model}
                </h3>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  <span>
                    {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
                  </span>
                  <span className="mx-1.5">•</span>
                  <span>{calculateDuration()} day{calculateDuration() > 1 ? 's' : ''}</span>
                </div>
              </div>
              
              {/* Status & Price */}
              <div className="text-right ml-4">
                <div className="flex items-center justify-end mb-1 space-x-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} animate-pulse`} />
                  <span className={`text-xs font-medium ${statusConfig.textColor}`}>
                    {statusConfig.text}
                  </span>
                </div>
                <div className="text-base font-bold text-white">€{booking.total_amount}</div>
              </div>
            </div>

            {/* Action icons */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-3">
                {booking.status === 'completed' && (
                  <button 
                    className="text-gray-400 hover:text-amber-400 transition-colors p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add review functionality
                    }}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                )}
                
                {['confirmed', 'awaiting_approval'].includes(booking.status) && (
                  <button 
                    className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/chat/${booking.id}`);
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </button>
                )}
              </div>

              {booking.status === 'confirmed' && isUpcoming() && (
                <div className="flex items-center text-xs text-green-400">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>Ready</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Messages - Only for pending */}
        {isPending() && (
          <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-xl">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span className="text-sm font-medium text-amber-400">
                You&apos;ll hear back within 24 hours
              </span>
            </div>
          </div>
        )}

        {booking.status === 'rejected' && (
          <div className="mt-3 p-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20 rounded-xl">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span className="text-sm font-medium text-red-400">
                No charges were made
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 