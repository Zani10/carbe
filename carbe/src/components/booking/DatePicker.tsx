import React, { useState } from 'react';
import { format, isBefore, isAfter, isSameDay, differenceInDays } from 'date-fns';
import { X, Calendar } from 'lucide-react';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDates: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  unavailableDates?: Date[];
}

const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  onClose,
  onSelectDates,
  initialStartDate,
  initialEndDate,
  unavailableDates = [],
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Generate dates for the calendar (3 months for better planning)
  const generateCalendarDates = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 0; i < 3; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = format(monthStart, 'MMMM yyyy');
      
      // Get the number of days in the month
      const daysInMonth = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth() + 1,
        0
      ).getDate();
      
      // Get the day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
      const startDay = monthStart.getDay();
      
      // Calculate days for the month
      const days = [];
      
      // Add empty slots for days before the month starts
      for (let d = 0; d < startDay; d++) {
        days.push(null);
      }
      
      // Add actual days of the month
      for (let d = 1; d <= daysInMonth; d++) {
        const date = new Date(monthStart.getFullYear(), monthStart.getMonth(), d);
        days.push(date);
      }
      
      months.push({
        name: monthName,
        days,
      });
    }
    
    return months;
  };

  const isDateSelected = (date: Date) => {
    if (!startDate && !endDate) return false;
    if (startDate && isSameDay(date, startDate)) return true;
    if (endDate && isSameDay(date, endDate)) return true;
    if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (startDate && !endDate && hoverDate) {
      const start = startDate;
      const end = hoverDate;
      return (
        (isAfter(date, start) && isBefore(date, end)) ||
        (isAfter(date, end) && isBefore(date, start))
      );
    }
    return false;
  };

  const isDateUnavailable = (date: Date) => {
    return unavailableDates.some(unavailableDate => isSameDay(date, unavailableDate));
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date) || isDateUnavailable(date)) return;

    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && isSameDay(date, startDate)) {
      // Clicking on the same start date - deselect it
      setStartDate(null);
      setEndDate(null);
    } else if (endDate && isSameDay(date, endDate)) {
      // Clicking on the same end date - deselect it, keep start date
      setEndDate(null);
    } else {
      // Complete the selection
      if (isBefore(date, startDate)) {
        setEndDate(startDate);
        setStartDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleDateHover = (date: Date) => {
    if (!isDateDisabled(date) && !isDateUnavailable(date)) {
      setHoverDate(date);
    }
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onSelectDates(startDate, endDate);
      // Close with animation
      setTimeout(() => onClose(), 300);
    }
  };

  // Fixed calculation - use differenceInDays + 1 for inclusive counting
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  // Always render the sheet to enable slide-in/out animations
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] rounded-t-3xl transform transition-transform duration-500 ease-out flex flex-col ${
      isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'
    }`} style={{ height: '75vh' }}>
      
      {/* Header */}
      <div className="bg-[#292929] text-white p-4 flex justify-between items-center rounded-t-3xl">
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-medium">Select dates</h2>
        <button 
          onClick={clearSelection}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-lg mx-auto">
          {generateCalendarDates().map((month, monthIndex) => (
            <div key={monthIndex} className="mb-8">
              <h3 className="text-white font-medium text-center mb-4">{month.name}</h3>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-gray-400 text-xs text-center py-2">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {month.days.map((date, dateIndex) => {
                  if (!date) return <div key={`empty-${dateIndex}`} className="h-12" />;
                  
                  const isStart = startDate && isSameDay(date, startDate);
                  const isEnd = endDate && isSameDay(date, endDate);
                  const isSelected = isDateSelected(date);
                  const isInRange = isDateInRange(date);
                  const disabled = isDateDisabled(date);
                  const unavailable = isDateUnavailable(date);
                  
                  return (
                    <button
                      key={dateIndex}
                      onClick={() => handleDateClick(date)}
                      onMouseEnter={() => handleDateHover(date)}
                      disabled={disabled || unavailable}
                      className={`
                        h-12 flex items-center justify-center rounded-lg relative transition-all duration-200
                        ${disabled ? 'text-gray-600 cursor-not-allowed' : 
                          unavailable ? 'text-red-400 cursor-not-allowed bg-red-900/20' :
                          'text-white cursor-pointer hover:bg-gray-700'}
                        ${isSelected && !isInRange ? 'bg-[#FF2800] text-white shadow-lg scale-105' : ''}
                        ${isInRange ? 'bg-[#FF2800]/30' : ''}
                        ${isStart ? 'rounded-l-lg' : ''}
                        ${isEnd ? 'rounded-r-lg' : ''}
                        ${!disabled && !unavailable && !isSelected && !isInRange ? 'hover:scale-105' : ''}
                      `}
                    >
                      {format(date, 'd')}
                      {unavailable && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with apply button - Fixed at bottom */}
      <div className="bg-[#292929] p-4 border-t border-gray-700 mt-auto">
        <button
          onClick={handleApply}
          disabled={!startDate || !endDate}
          className={`
            w-full rounded-xl py-4 font-medium text-center transition-all duration-200 flex items-center justify-center space-x-2
            ${startDate && endDate 
              ? 'bg-[#FF2800] text-white hover:bg-[#E02400] shadow-lg' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Calendar size={20} />
          <span>
            {startDate && endDate 
              ? `Apply dates (${calculateDays()} days)` 
              : 'Select both dates to continue'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default DatePicker; 