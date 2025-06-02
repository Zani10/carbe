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
  onClick,
  onMouseDown,
  onMouseEnter
}: AvailabilityDateCellProps) {
  const dayNumber = format(date, 'd');
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getCellStyles = () => {
    const baseStyles = `
      relative w-12 h-12 flex items-center justify-center text-sm font-medium 
      cursor-pointer transition-all duration-200 rounded-lg
      ${!isCurrentMonth ? 'opacity-30' : ''}
      ${isSelected ? 'ring-2 ring-[#FF2800] ring-offset-2 ring-offset-[#121212]' : ''}
    `;

    switch (status) {
      case 'available':
        return `${baseStyles} 
          bg-transparent hover:bg-[#2A2A2A] 
          ${isWeekend ? 'text-white font-semibold' : 'text-white'}
          ${isToday ? 'ring-1 ring-white' : ''}
        `;
      
      case 'blocked':
        return `${baseStyles} 
          bg-[#2A2A2A] text-[#A0A0A0] 
          ${isToday ? 'ring-1 ring-gray-400' : ''}
        `;
      
      case 'pending':
        return `${baseStyles} 
          bg-[#007380] text-white hover:bg-[#008A9A]
          ${isToday ? 'ring-1 ring-white' : ''}
        `;
      
      case 'booked':
        return `${baseStyles} 
          bg-[#00A680] text-white cursor-not-allowed
          ${isToday ? 'ring-1 ring-white' : ''}
        `;
      
      case 'mixed':
        return `${baseStyles} 
          bg-gradient-to-br from-[#2A2A2A] to-[#007380] text-white
          ${isToday ? 'ring-1 ring-white' : ''}
        `;
      
      default:
        return baseStyles;
    }
  };

  return (
    <div
      className={getCellStyles()}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      title={`${format(date, 'MMM d, yyyy')} - ${status}`}
    >
      {/* Date Number */}
      <span className="relative z-10">
        {dayNumber}
      </span>

      {/* Today Indicator */}
      {isToday && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF2800] rounded-full" />
      )}

      {/* Blocked Icon */}
      {status === 'blocked' && (
        <Ban className="absolute bottom-1 right-1 w-3 h-3 text-[#CCCCCC]" />
      )}

      {/* Pending Request Badge */}
      {(status === 'pending' || pendingCount > 0) && (
        <div className="absolute -top-1 -right-1 bg-[#FF8C00] text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {pendingCount > 1 ? pendingCount : '!'}
        </div>
      )}

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#FF2800] opacity-30 rounded-lg" />
      )}
    </div>
  );
} 