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
  isWeekend,
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
    // Handle connected booking spans
    if (status === 'booked' && booking) {
      let bookingStyles = 'bg-gray-100 text-gray-800 ';
      
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
        // Middle of multi-day booking
        bookingStyles += ''; // No rounding
      }
      
      return `relative w-12 h-16 flex items-center justify-center text-sm cursor-pointer transition-all duration-200 ${!isCurrentMonth ? 'opacity-30' : ''} ${bookingStyles}`;
    }

    // Regular cell styling (original design)
    const baseStyles = `
      relative w-12 h-16 flex flex-col items-center justify-center text-xs
      cursor-pointer transition-all duration-200 rounded-lg border
      ${!isCurrentMonth ? 'opacity-30' : ''}
      ${isSelected ? 'ring-2 ring-[#FF4646] ring-offset-2 ring-offset-[#121212]' : ''}
      ${isWeekend ? 'bg-[#1F1F1F]' : 'bg-transparent'}
      ${isToday ? 'ring-1 ring-white' : ''}
      border-gray-700 hover:bg-[#2A2A2A]
    `;

    return baseStyles;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'text-gray-300';
      case 'blocked':
        return 'text-[#FF4646]';
      case 'pending':
        return 'text-[#007380]';
      case 'booked':
        return 'text-[#00A680]';
      case 'mixed':
        return 'text-yellow-400';
      default:
        return 'text-gray-300';
    }
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'available':
        return '';
      case 'blocked':
        return 'Blocked';
      case 'pending':
        return 'Pending';
      case 'booked':
        return 'Booked';
      case 'mixed':
        return 'Mixed';
      default:
        return '';
    }
  };

  // Render booked cell with guest info
  if (status === 'booked' && booking) {
    return (
      <div className={getCellStyles()}>
        {/* Guest Avatar (only on start date) */}
        {booking.isStart && (
          <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold z-10">
            {booking.guest_avatar ? (
              <img 
                src={booking.guest_avatar} 
                alt={booking.guest_name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              booking.guest_name.charAt(0).toUpperCase()
            )}
          </div>
        )}

        {/* Booking text (only on start date or single day) */}
        {(booking.isStart || (booking.isStart && booking.isEnd)) && (
          <span className="text-xs font-medium text-gray-700 ml-8">
            Booked
          </span>
        )}

        {/* Date number (always visible) */}
        <span className={`absolute top-1 right-1 text-xs ${
          booking.isStart ? 'text-gray-600' : 'text-gray-500'
        }`}>
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
      <span className={`text-sm font-medium ${isWeekend ? 'text-white font-semibold' : 'text-white'} mb-1`}>
        {dayNumber}
      </span>

      {/* Status */}
      <span className={`text-xs ${getStatusColor()}`}>
        {getStatusDisplay()}
      </span>

      {/* Blocked Icon */}
      {status === 'blocked' && (
        <Ban className="absolute -top-1 -right-1 w-3 h-3 text-[#FF4646]" />
      )}

      {/* Pending Request Badge */}
      {(status === 'pending' || pendingCount > 0) && (
        <div className="absolute -top-1 -right-1 bg-[#FF8C00] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {pendingCount > 1 ? pendingCount : '!'}
        </div>
      )}

      {/* Today Indicator */}
      {isToday && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF4646] rounded-full" />
      )}

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#FF4646] opacity-30 rounded-lg" />
      )}
    </div>
  );
} 