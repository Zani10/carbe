import React, { useState } from 'react';
import { format, isBefore, isAfter, isSameDay } from 'date-fns';
import { X } from 'lucide-react';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDates: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  onClose,
  onSelectDates,
  initialStartDate,
  initialEndDate,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Generate dates for the calendar (2 months)
  const generateCalendarDates = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 0; i < 2; i++) {
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
      return (
        (isAfter(date, startDate) && isBefore(date, hoverDate)) ||
        (isAfter(date, hoverDate) && isBefore(date, startDate))
      );
    }
    return false;
  };

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      // Start a new selection
      setStartDate(date);
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
    setHoverDate(date);
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(date, today);
  };

  // Don't render anything if the picker is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex flex-col">
      {/* Header */}
      <div className="bg-[#292929] text-white p-4 flex justify-between items-center">
        <button onClick={onClose} className="p-2">
          <X size={24} />
        </button>
        <h2 className="text-lg font-medium">Select dates</h2>
        <div className="w-10" />
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-[#1A1A1A] overflow-y-auto p-4">
        <div className="max-w-lg mx-auto">
          {generateCalendarDates().map((month, monthIndex) => (
            <div key={monthIndex} className="mb-8">
              <h3 className="text-white font-medium text-center mb-4">{month.name}</h3>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-gray-400 text-xs text-center">{day}</div>
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
                  
                  return (
                    <button
                      key={dateIndex}
                      onClick={() => !disabled && handleDateClick(date)}
                      onMouseEnter={() => !disabled && handleDateHover(date)}
                      disabled={disabled}
                      className={`
                        h-12 flex items-center justify-center rounded-full relative
                        ${disabled ? 'text-gray-600 cursor-not-allowed' : 'text-white cursor-pointer'}
                        ${isSelected ? 'bg-[#FF4646]' : ''}
                        ${isInRange ? 'bg-[#FF4646]/20' : ''}
                        ${isStart ? 'rounded-l-full' : ''}
                        ${isEnd ? 'rounded-r-full' : ''}
                      `}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer with apply button */}
      <div className="bg-[#292929] p-4">
        <button
          onClick={() => startDate && endDate && onSelectDates(startDate, endDate)}
          disabled={!startDate || !endDate}
          className={`
            w-full rounded-full py-3 font-medium text-center
            ${startDate && endDate ? 'bg-[#FF4646] text-white' : 'bg-gray-700 text-gray-400'}
          `}
        >
          Apply
        </button>
      </div>
    </div>
  );
};

export default DatePicker; 