import React from 'react';
import { getCalendarGrid, isSameDayUtil } from '@/lib/calendar/dateUtils';
import { DateCellData } from '@/types/calendar';
import DateCell from './DateCell';

interface MonthGridProps {
  month: Date;
  selectedCarId: string;
  selectedDates: Date[];
  bulkMode: boolean;
  getDateCellData: (date: Date, carId: string) => DateCellData;
  onDateClick: (date: Date) => void;
  onDateHover?: (date: Date) => void;
}

export default function MonthGrid({
  month,
  selectedCarId,
  selectedDates,
  bulkMode,
  getDateCellData,
  onDateClick,
  onDateHover
}: MonthGridProps) {
  const calendarDays = getCalendarGrid(month);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']; // Start with Monday
  
  const isDateSelected = (date: Date): boolean => {
    return selectedDates.some(selectedDate => isSameDayUtil(selectedDate, date));
  };
  
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
  };

  // Rearrange calendar days to start with Monday (move Sunday to end)
  const rearrangedDays = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    const week = calendarDays.slice(i, i + 7);
    if (week.length === 7) {
      // Move Sunday (index 0) to the end
      const [sunday, ...weekdays] = week;
      rearrangedDays.push(...weekdays, sunday);
    } else {
      rearrangedDays.push(...week);
    }
  }

  return (
    <div className="mb-6">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`h-8 flex items-center justify-center text-xs font-semibold transition-colors ${
              index >= 5 // Saturday and Sunday
                ? 'text-[#FF2800]' 
                : 'text-gray-400'
            }`}
          >
            {day.toUpperCase()}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {rearrangedDays.map((date, index) => {
          const cellData = getDateCellData(date, selectedCarId);
          const isSelected = isDateSelected(date);
          const isCurrentMonthDate = isCurrentMonth(date);
          
          return (
            <DateCell
              key={index}
              cellData={cellData}
              isSelected={isSelected}
              isCurrentMonth={isCurrentMonthDate}
              bulkMode={bulkMode}
              onDateClick={onDateClick}
              onDateHover={onDateHover}
            />
          );
        })}
      </div>
      
      {/* Clean Legend */}
      <div className="border-t border-gray-700/30 pt-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#00A680] rounded mr-2" />
            <span className="text-gray-400">Available / Booked</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#FF8C00] rounded mr-2" />
            <span className="text-gray-400">Pending</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-500 rounded mr-2" />
            <span className="text-gray-400">Blocked</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#FFD700] rounded mr-2" />
            <span className="text-gray-400">Custom Price</span>
          </div>
        </div>
      </div>
    </div>
  );
} 