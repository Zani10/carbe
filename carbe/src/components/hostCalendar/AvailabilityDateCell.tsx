import React from 'react';
import { format } from 'date-fns';
import { Ban } from 'lucide-react';

interface AvailabilityDateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  status: 'available' | 'blocked' | 'pending' | 'booked' | 'mixed';
  pendingCount: number;
  booking?: {
    id: string;
    guest_name: string;
    guest_avatar?: string;
    isStart: boolean;
    isEnd: boolean;
    isMiddle: boolean;
  };
  onClick: () => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

export default function AvailabilityDateCell({
  date,
  isCurrentMonth,
  isSelected,
  status,
  pendingCount,
  booking,
  onClick,
  onMouseDown,
  onMouseEnter
}: AvailabilityDateCellProps) {
  const dayNumber = format(date, 'd');
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getCellStyles = () => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Handle connected booking spans
    if (status === 'booked' && booking) {
      let bookingStyles = 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-sm '; // Satisfying green gradient for booked
      
      if (booking.isStart && booking.isEnd) {
        // Single day booking
        bookingStyles += 'rounded-lg';
      } else if (booking.isStart) {
        // Start of multi-day booking
        bookingStyles += 'rounded-l-lg';
      } else if (booking.isEnd) {
        // End of multi-day booking
        bookingStyles += 'rounded-r-lg';
      } else if (booking.isMiddle) {
        // Middle of multi-day booking - no borders or rounding
        bookingStyles += '';
      }
      
      return `relative w-12 h-16 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 ${!isCurrentMonth ? 'opacity-30' : ''} ${bookingStyles}`;
    }

    // Regular cell styling (reverted to original)
    const baseStyles = `
      relative w-12 h-16 flex flex-col items-center justify-center text-xs
      cursor-pointer transition-all duration-200 rounded-lg border
      ${!isCurrentMonth ? 'opacity-30' : ''}
      ${isSelected ? 'bg-[#FF4646]/30 border-2 border-[#FF4646] ring-1 ring-[#FF4646]/50' : ''}
      ${isWeekend && !isSelected ? 'bg-[#1F1F1F]' : ''}
      ${!isWeekend && !isSelected ? 'bg-transparent' : ''}
      ${isToday && !isSelected ? 'border-white border-2' : ''}
      ${!isToday && !isSelected ? 'border-gray-700' : ''}
      hover:bg-[#2A2A2A]
    `;

    return baseStyles;
  };



  // Render booked cell with guest info
  if (status === 'booked' && booking) {
    return (
      <div className={getCellStyles()} style={{ marginLeft: booking.isMiddle || booking.isEnd ? '-1px' : '0' }}>
        {/* Guest Avatar (only on start date) */}
        {booking.isStart && (
          <div className="absolute left-1.5 top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold z-10">
            {booking.guest_avatar ? (
              <img 
                src={booking.guest_avatar} 
                alt={booking.guest_name}
                className="w-5 h-5 rounded-full object-cover"
              />
            ) : (
              booking.guest_name.charAt(0).toUpperCase()
            )}
          </div>
        )}

        {/* Booking text (only on start date or single day) */}
        {(booking.isStart || (booking.isStart && booking.isEnd)) && (
          <span className="text-xs font-medium text-white ml-7">
            Booked
          </span>
        )}

        {/* Date number (always visible) */}
        <span className={`absolute top-1 right-1 text-xs text-white font-medium`}>
          {dayNumber}
        </span>
      </div>
    );
  }

  // Regular cell
  return (
    <div
      className={getCellStyles()}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      title={`${format(date, 'MMM d, yyyy')} - ${status}`}
    >
      {/* Date Number */}
      <span className="text-sm font-medium text-white mb-1">
        {dayNumber}
      </span>

      {/* Price Line - Only for non-booked cells */}
      {status !== 'booked' && (
        <span className="text-xs text-gray-400">€75</span>
      )}

      {/* Status Indicators */}
      {status === 'available' && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-sm" />
      )}
      
      {status === 'blocked' && (
        <Ban className="absolute top-1 right-1 w-2.5 h-2.5 text-[#FF4646]" />
      )}
      
      {status === 'pending' && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse shadow-sm" />
      )}
      
      {status === 'mixed' && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-sm" />
      )}

      {/* Pending Request Badge */}
      {(status === 'pending' || pendingCount > 0) && (
        <div className="absolute -top-1 -right-1 bg-[#FF8C00] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {pendingCount > 1 ? pendingCount : '!'}
        </div>
      )}
    </div>
  );
} 