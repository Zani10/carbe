import React from 'react';
import { format } from 'date-fns';

interface BookedCellProps {
  booking: {
    id: string;
    guest_name: string;
    guest_avatar?: string;
    isStart: boolean;
    isEnd: boolean;
    isMiddle: boolean;
  };
  startDate: Date;
  span: number;
  cellData: {
    isCurrentMonth: boolean;
  };
}

export default function BookedCell({
  booking,
  startDate,
  span,
  cellData
}: BookedCellProps) {
  const dayNumber = format(startDate, 'd');

  return (
    <div
      className={`
        relative h-16 flex items-center justify-start text-sm cursor-pointer 
        transition-all duration-200 rounded-lg border-0
        bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-sm
        ${!cellData.isCurrentMonth ? 'opacity-30' : ''}
      `}
      style={{
        gridColumn: `span ${span}`
      }}
    >
      {/* Date number - top right of start cell */}
      <span className="absolute top-1 right-1.5 text-xs text-white font-medium">
        {dayNumber}
      </span>

      {/* Guest info - bottom left */}
      <div className="absolute bottom-1.5 left-1.5 flex items-center space-x-1.5">
        {/* Profile pic */}
        <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
          {booking.guest_avatar ? (
            <img 
              src={booking.guest_avatar} 
              alt={booking.guest_name}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            booking.guest_name.charAt(0).toUpperCase()
          )}
        </div>
        
        {/* Booked text */}
        <span className="text-xs font-medium text-white whitespace-nowrap">
          Booked
        </span>
      </div>
    </div>
  );
} 