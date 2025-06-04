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
  datesInSpan: Date[];
  span: number;
  cellData: {
    isCurrentMonth: boolean;
  };
  isWeekContinuation?: boolean;
}

export default function BookedCell({
  booking,
  datesInSpan,
  span,
  cellData,
  isWeekContinuation = false
}: BookedCellProps) {

  return (
    <div
      className={`
        relative h-20 flex items-center justify-start text-sm cursor-pointer 
        transition-all duration-200 rounded-lg border-0
        bg-gradient-to-r from-[#059669] to-[#10B981] text-white shadow-sm
        ${!cellData.isCurrentMonth ? 'opacity-30' : ''}
      `}
      style={{
        gridColumn: `span ${span}`
      }}
    >
      {/* Date numbers for each day - properly centered within each virtual cell */}
      {datesInSpan.map((date, index) => {
        const cellWidth = 100 / span; // Percentage width per virtual cell
        const centerPosition = (index * cellWidth) + (cellWidth / 2); // Center of each virtual cell
        
        return (
          <span 
            key={format(date, 'yyyy-MM-dd')}
            className="absolute top-2 text-sm text-white font-medium"
            style={{ 
              left: `calc(${centerPosition}% - 6px)` // Center the number (6px is roughly half the text width)
            }}
          >
            {format(date, 'd')}
          </span>
        );
      })}

      {/* Guest info - only show on actual booking start, NOT on week continuations */}
      {booking.isStart && !isWeekContinuation && (
        <div className="absolute bottom-2 left-2 flex items-center space-x-1.5">
          {/* Profile pic */}
          <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
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
          
          {/* Booked text */}
          <span className="text-sm font-medium text-white whitespace-nowrap">
            Booked
          </span>
        </div>
      )}
    </div>
  );
} 