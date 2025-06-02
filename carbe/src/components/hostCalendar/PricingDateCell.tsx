import React from 'react';
import { format } from 'date-fns';
import { Zap } from 'lucide-react';

interface PricingDateCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  isSelected: boolean;
  price: number | 'multiple';
  hasOverride: boolean;
  onClick: (event: React.MouseEvent) => void;
  onMouseDown: () => void;
  onMouseEnter: () => void;
}

export default function PricingDateCell({
  date,
  isCurrentMonth,
  isWeekend,
  isSelected,
  price,
  hasOverride,
  onClick,
  onMouseDown,
  onMouseEnter
}: PricingDateCellProps) {
  const dayNumber = format(date, 'd');
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const getCellStyles = () => {
    const baseStyles = `
      relative w-12 h-16 flex flex-col items-center justify-center text-xs
      cursor-pointer transition-all duration-200 rounded-lg border
      ${!isCurrentMonth ? 'opacity-30' : ''}
      ${isSelected ? 'ring-2 ring-[#FF2800] ring-offset-2 ring-offset-[#121212]' : ''}
      ${isWeekend ? 'bg-[#1F1F1F]' : 'bg-transparent'}
      ${isToday ? 'ring-1 ring-white' : ''}
      border-gray-700 hover:bg-[#2A2A2A]
    `;

    return baseStyles;
  };

  const getPriceDisplay = () => {
    if (price === 'multiple') {
      return 'Mixed';
    }
    return `€${price}`;
  };

  const getPriceColor = () => {
    if (price === 'multiple') {
      return 'text-yellow-400';
    }
    if (hasOverride) {
      return 'text-white font-semibold';
    }
    if (isWeekend) {
      return 'text-orange-300';
    }
    return 'text-gray-300';
  };

  return (
    <div
      className={getCellStyles()}
      onClick={onClick}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      title={`${format(date, 'MMM d, yyyy')} - ${getPriceDisplay()}`}
    >
      {/* Date Number */}
      <span className={`text-sm font-medium ${isWeekend ? 'text-white font-semibold' : 'text-white'} mb-1`}>
        {dayNumber}
      </span>

      {/* Price */}
      <span className={`text-xs ${getPriceColor()}`}>
        {getPriceDisplay()}
      </span>

      {/* Override Badge */}
      {hasOverride && (
        <Zap className="absolute -top-1 -right-1 w-3 h-3 text-[#FFD700]" />
      )}

      {/* Today Indicator */}
      {isToday && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#FF2800] rounded-full" />
      )}

      {/* Selection Overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-[#FF2800] opacity-30 rounded-lg" />
      )}
    </div>
  );
} 