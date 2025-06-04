import React from 'react';
import { format } from 'date-fns';
import { Ban } from 'lucide-react';

interface AvailabilityDateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  status: 'unset' | 'available' | 'blocked' | 'pending' | 'booked' | 'mixed';
  pendingCount: number;
  pricing?: {
    basePrice?: number;
    currency?: string;
  };
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
  pricing,
  booking,
  onClick,
  onMouseDown,
  onMouseEnter
}: AvailabilityDateCellProps) {
  const dayNumber = format(date, 'd');
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getCellStyles = () => {
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    // Handle connected booking spans - Airbnb style
    if (status === 'booked' && booking) {
      let bookingStyles = 'bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-sm border-0 ';
      
      if (booking.isStart && booking.isEnd) {
        // Single day booking
        bookingStyles += 'rounded-lg mx-0.5';
      } else if (booking.isStart) {
        // Start of multi-day booking
        bookingStyles += 'rounded-l-lg mr-0';
      } else if (booking.isEnd) {
        // End of multi-day booking
        bookingStyles += 'rounded-r-lg ml-0';
      } else if (booking.isMiddle) {
        // Middle of multi-day booking - completely connected
        bookingStyles += 'mx-0';
      }
      
      return `relative w-12 h-16 flex items-center justify-start text-sm cursor-pointer transition-all duration-200 ${!isCurrentMonth ? 'opacity-30' : ''} ${bookingStyles}`;
    }

    // Regular cell styling
    const baseStyles = `
      relative w-12 h-20 flex flex-col items-center justify-center text-xs
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

  // Booked cells are now handled by BookedCell component

  // Regular cell
  return (
    <div
      className={getCellStyles()}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      title={`${format(date, 'MMM d, yyyy')} - ${status}`}
    >
      {/* Date Number - positioned like Airbnb, slightly above center */}
      <span className="absolute top-4 left-1/2 transform -translate-x-1/2 text-sm font-medium text-white">
        {dayNumber}
      </span>

      {/* Price Line - skeleton or actual price */}
      {pricing?.basePrice ? (
        <span className="absolute top-12 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
          {pricing.currency || '€'}{pricing.basePrice}
        </span>
      ) : (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-8 h-3 bg-gray-700 rounded animate-pulse" />
      )}

      {/* Status Indicators */}
      {status === 'available' && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#10B981] shadow-sm" />
      )}
      
      {status === 'blocked' && (
        <>
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#FF4646] shadow-sm" />
          <Ban className="absolute top-1 right-1 w-2.5 h-2.5 text-[#FF4646]" />
        </>
      )}
      
      {status === 'pending' && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse shadow-sm" />
      )}
      
      {status === 'mixed' && (
        <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-sm" />
      )}

      {/* No indicator for 'unset' status - clean default state */}

      {/* Pending Request Badge */}
      {(status === 'pending' || pendingCount > 0) && (
        <div className="absolute -top-1 -right-1 bg-[#FF8C00] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {pendingCount > 1 ? pendingCount : '!'}
        </div>
      )}
    </div>
  );
} 