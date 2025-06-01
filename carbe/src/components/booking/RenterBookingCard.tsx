import React from 'react';
import { format, differenceInDays } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Car, 
  Clock, 
  Star,
  MapPin
} from 'lucide-react';
import { BookingWithCar, BookingStatus } from '@/types/booking';
import MessageBookingButton from './MessageBookingButton';

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
      // If confirmed, go to booking details page
      router.push(`/my-bookings/${booking.id}`);
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
        <div className="flex items-start space-x-3">
          {/* Car Image - More compact and refined */}
          <div className="relative w-14 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex-shrink-0">
            {booking.cars.images && booking.cars.images.length > 0 ? (
              <Image
                src={booking.cars.images[0]}
                alt={`${booking.cars.make} ${booking.cars.model}`}
                width={56}
                height={40}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <Car className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Top Row: Car name and Status */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white leading-tight truncate">
                  {booking.cars.make} {booking.cars.model}
                </h3>
              </div>
              
              <div className="flex items-center space-x-1 ml-3">
                <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                <span className={`text-xs font-medium ${statusConfig.textColor} whitespace-nowrap`}>
                  {statusConfig.text}
                </span>
              </div>
            </div>

            {/* Bottom Row: Date/Duration and Price */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {format(new Date(booking.start_date), 'MMM d')} - {format(new Date(booking.end_date), 'MMM d')}
                </span>
                <span className="mx-1">•</span>
                <span className="whitespace-nowrap">{calculateDuration()}d</span>
              </div>
              
              <div className="text-sm font-bold text-white ml-3">
                €{booking.total_amount}
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2">
                {booking.status === 'completed' && (
                  <button 
                    className="text-gray-400 hover:text-amber-400 transition-colors p-0.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add review functionality
                    }}
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                
                {['confirmed', 'awaiting_approval'].includes(booking.status) && (
                  <MessageBookingButton
                    carId={booking.cars.id}
                    hostId={booking.cars.owner_id}
                    renterId={booking.renter_id}
                    bookingId={booking.id}
                    variant="icon"
                    size="sm"
                    className="text-gray-400 hover:text-blue-400 bg-transparent hover:bg-gray-700/50 p-0.5"
                  />
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

        {/* Status Message - Compact for pending */}
        {isPending() && (
          <div className="mt-3 p-2.5 bg-gradient-to-r from-amber-500/8 to-yellow-500/8 border border-amber-500/15 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-medium text-amber-400">
                You&apos;ll hear back within 24 hours
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 