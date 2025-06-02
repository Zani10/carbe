import React from 'react';
import { DateCellData } from '@/types/calendar';
import { 
  AlertCircle, 
  Check, 
  X, 
  Euro,
  Clock,
  Star,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';

interface DateCellProps {
  cellData: DateCellData;
  isSelected: boolean;
  isCurrentMonth: boolean;
  bulkMode: boolean;
  onDateClick: (date: Date) => void;
  onDateHover?: (date: Date) => void;
}

export default function DateCell({
  cellData,
  isSelected,
  isCurrentMonth,
  bulkMode,
  onDateClick,
  onDateHover
}: DateCellProps) {
  const { date, status, price, hasOverride, isWeekend, booking } = cellData;
  
  const getStatusStyles = () => {
    const baseStyles = "group relative w-full h-16 border rounded-xl cursor-pointer transition-all duration-300 overflow-hidden";
    
    if (!isCurrentMonth) {
      return `${baseStyles} bg-[#0A0A0A] border-[#1A1A1A] text-gray-700 hover:bg-[#111111] hover:border-[#222222]`;
    }
    
    if (isSelected && bulkMode) {
      return `${baseStyles} bg-gradient-to-br from-[#FF2800]/20 to-[#FF4D30]/20 border-[#FF2800] shadow-lg shadow-[#FF2800]/20 scale-[0.98]`;
    }
    
    switch (status) {
      case 'available':
        return `${baseStyles} bg-gradient-to-br from-[#0F1A0F] to-[#1A2F1A] border-[#00A680]/20 text-white hover:bg-gradient-to-br hover:from-[#152015] hover:to-[#1F3A1F] hover:border-[#00A680]/40 hover:shadow-md hover:shadow-[#00A680]/10 hover:scale-[1.02]`;
      case 'blocked':
        return `${baseStyles} bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border-[#404040] text-gray-500 hover:bg-gradient-to-br hover:from-[#222222] hover:to-[#333333] hover:border-[#555555]`;
      case 'pending':
        return `${baseStyles} bg-gradient-to-br from-[#2A1A0F] to-[#3A2A1F] border-[#FF8C00]/40 text-white hover:bg-gradient-to-br hover:from-[#332015] hover:to-[#443020] hover:border-[#FF8C00]/60 hover:shadow-md hover:shadow-[#FF8C00]/20 hover:scale-[1.02]`;
      case 'booked':
        return `${baseStyles} bg-gradient-to-br from-[#0F251F] to-[#1F3530] border-[#00A680]/40 text-white hover:bg-gradient-to-br hover:from-[#152B25] hover:to-[#254035] hover:border-[#00A680]/60 hover:shadow-md hover:shadow-[#00A680]/20`;
      default:
        return `${baseStyles} bg-gradient-to-br from-[#0F0F0F] to-[#1F1F1F] border-[#333333] text-white`;
    }
  };
  
  const getStatusIcon = () => {
    const iconClass = "h-3.5 w-3.5 drop-shadow-sm";
    switch (status) {
      case 'available':
        return <Check className={`${iconClass} text-[#00A680]`} />;
      case 'blocked':
        return <X className={`${iconClass} text-gray-500`} />;
      case 'pending':
        return <Clock className={`${iconClass} text-[#FF8C00] animate-pulse`} />;
      case 'booked':
        return <AlertCircle className={`${iconClass} text-[#00A680]`} />;
      default:
        return null;
    }
  };
  
  const handleClick = () => {
    if (isCurrentMonth) {
      onDateClick(date);
    }
  };
  
  const handleMouseEnter = () => {
    if (onDateHover && isCurrentMonth) {
      onDateHover(date);
    }
  };

  const isToday = () => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isHighRevenue = price > 120;

  return (
    <div
      className={getStatusStyles()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
    >
      {/* Gradient overlay for better visual depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Today indicator */}
      {isCurrentMonth && isToday() && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF2800] rounded-full shadow-lg animate-pulse" />
      )}
      
      {/* Date Number */}
      <div className="absolute top-1.5 left-2">
        <span className={`text-sm font-semibold transition-colors ${
          !isCurrentMonth ? 'text-gray-700' : 
          isToday() ? 'text-[#FF2800]' : 'text-white'
        }`}>
          {format(date, 'd')}
        </span>
      </div>
      
      {/* Status Icon */}
      {isCurrentMonth && (
        <div className="absolute top-1.5 right-1.5">
          {getStatusIcon()}
        </div>
      )}
      
      {/* Premium badges row */}
      <div className="absolute top-1.5 right-7 flex space-x-1">
        {/* High revenue indicator */}
        {isCurrentMonth && isHighRevenue && !hasOverride && (
          <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center shadow-sm">
            <Star className="h-2 w-2 mr-0.5" />
            
          </div>
        )}
        
        {/* Weekend Badge */}
        {isCurrentMonth && isWeekend && !hasOverride && (
          <div className="bg-gradient-to-r from-[#FF2800] to-[#FF4D30] text-white text-xs px-1.5 py-0.5 rounded-full font-semibold shadow-sm">
            +15%
          </div>
        )}
        
        {/* Price Override Badge */}
        {isCurrentMonth && hasOverride && (
          <div className="bg-gradient-to-r from-[#FFC400] to-[#FFD700] text-black text-xs px-1.5 py-0.5 rounded-full font-bold flex items-center shadow-sm">
            <Euro className="h-2.5 w-2.5 mr-0.5" />
            <TrendingUp className="h-2.5 w-2.5" />
          </div>
        )}
      </div>
      
      {/* Price Display */}
      {isCurrentMonth && status !== 'blocked' && (
        <div className="absolute bottom-1 left-2">
          <span className={`text-xs font-bold transition-colors ${
            isHighRevenue ? 'text-[#FFD700]' : 'text-gray-300'
          }`}>
            €{price}
          </span>
        </div>
      )}
      
      {/* Booking Guest Name */}
      {isCurrentMonth && booking && (
        <div className="absolute bottom-1 right-2">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-[#00A680] rounded-full" />
            <span className="text-xs text-gray-400 truncate max-w-[50px] font-medium">
              {booking.guest_name.split(' ')[0]}
            </span>
          </div>
        </div>
      )}
      
      {/* Selection Overlay with enhanced animation */}
      {isSelected && bulkMode && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF2800]/30 to-[#FF4D30]/30 rounded-xl border-2 border-[#FF2800] pointer-events-none animate-pulse">
          <div className="absolute top-1 left-1">
            <div className="w-5 h-5 bg-gradient-to-br from-[#FF2800] to-[#FF4D30] rounded-full flex items-center justify-center shadow-lg">
              <Check className="h-3 w-3 text-white font-bold" />
            </div>
          </div>
        </div>
      )}
      
      {/* Pending Request Enhanced Pulse */}
      {status === 'pending' && (
        <div className="absolute inset-0 rounded-xl">
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF8C00] rounded-full animate-ping" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#FF8C00] rounded-full shadow-lg" />
        </div>
      )}
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.03] transition-colors duration-300 rounded-xl pointer-events-none" />
    </div>
  );
} 