import React, { useState } from 'react';
import { format, isBefore, isAfter, isSameDay, differenceInDays, startOfDay } from 'date-fns';
import { X, Calendar, Euro, AlertTriangle } from 'lucide-react';
import { useCarAvailability } from '@/hooks/useCarAvailability';

interface DatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDates: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  carId?: string;
}

interface ValidationError {
  type: 'minimum_duration' | 'advance_notice' | 'unavailable_dates';
  message: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  isOpen,
  onClose,
  onSelectDates,
  initialStartDate,
  initialEndDate,
  carId,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);

  const { data: availabilityData, loading } = useCarAvailability(carId || '');

  const validateSelection = (start: Date, end: Date): ValidationError | null => {
    if (!availabilityData) return null;

    const today = startOfDay(new Date());
    const bookingDuration = differenceInDays(end, start) + 1;
    const advanceNoticeDays = differenceInDays(start, today);

    // Check minimum booking duration
    if (availabilityData.hostSettings?.minimumBookingDuration && 
        bookingDuration < availabilityData.hostSettings.minimumBookingDuration) {
      return {
        type: 'minimum_duration',
        message: `Minimum booking duration is ${availabilityData.hostSettings.minimumBookingDuration} ${availabilityData.hostSettings.minimumBookingDuration === 1 ? 'day' : 'days'}`
      };
    }

    // Check advance notice requirement
    if (availabilityData.hostSettings?.bookingAdvanceNotice && 
        advanceNoticeDays < availabilityData.hostSettings.bookingAdvanceNotice) {
      return {
        type: 'advance_notice',
        message: `Booking requires ${availabilityData.hostSettings.bookingAdvanceNotice} ${availabilityData.hostSettings.bookingAdvanceNotice === 1 ? 'day' : 'days'} advance notice`
      };
    }

    // Check for unavailable dates in the range
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (availabilityData.unavailableDates.includes(dateStr)) {
        return {
          type: 'unavailable_dates',
          message: 'Selected period contains unavailable dates'
        };
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return null;
  };

  const handleDateClick = (date: Date) => {
    if (isDateDisabled(date) || isDateUnavailable(date)) return;
    
    setValidationError(null);

    // Case 1: No selection OR we have a range selected - start new single selection
    if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) {
      const error = validateSelection(date, date);
      if (error) {
        setValidationError(error);
        return;
      }
      setStartDate(date);
      setEndDate(date);
    }
    // Case 2: Single date selected and clicking the same date - clear selection
    else if (startDate && endDate && isSameDay(startDate, endDate) && isSameDay(date, startDate)) {
      setStartDate(null);
      setEndDate(null);
    }
    // Case 3: Single date selected and clicking different date - create range
    else if (startDate && endDate && isSameDay(startDate, endDate)) {
      const newStartDate = isBefore(date, startDate) ? date : startDate;
      const newEndDate = isBefore(date, startDate) ? startDate : date;
      
      // Validate the selection
      const error = validateSelection(newStartDate, newEndDate);
      if (error) {
        setValidationError(error);
        return;
      }

      setStartDate(newStartDate);
      setEndDate(newEndDate);
    }
  };

  const handleApplyDates = () => {
    if (startDate && endDate) {
      const error = validateSelection(startDate, endDate);
      if (error) {
        setValidationError(error);
        return;
      }

      onSelectDates(startDate, endDate);
      onClose();
    }
  };

  const resetSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setHoverDate(null);
    setValidationError(null);
  };

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
      // Convert to Monday-first week (Monday = 0, Sunday = 6)
      const startDay = (monthStart.getDay() + 6) % 7;
      
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
    if (!availabilityData) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityData.unavailableDates.includes(dateStr);
  };

  const isUserBooking = (date: Date) => {
    if (!availabilityData) return false;
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityData.userBookingDates.includes(dateStr);
  };

  const getDatePrice = (date: Date) => {
    if (!availabilityData) return null;
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilityData.pricingOverrides[dateStr] || availabilityData.basePrice;
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
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

  // Fixed calculation - use differenceInDays + 1 for inclusive counting
  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  // Calculate total price for selected period
  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !availabilityData) return 0;
    
    let total = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const price = getDatePrice(currentDate);
      if (price) total += price;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return total;
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
          onClick={resetSelection}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Calendar content */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="max-w-lg mx-auto">
          {/* Validation Error Display */}
          {validationError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center space-x-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <span className="text-red-300 text-sm">{validationError.message}</span>
            </div>
          )}

          {loading && carId ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4646]"></div>
            </div>
          ) : (
            generateCalendarDates().map((month, monthIndex) => (
              <div key={monthIndex} className="mb-8">
                <h3 className="text-white font-medium text-center mb-4">{month.name}</h3>
                
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div 
                      key={day} 
                      className={`text-xs text-center py-2 ${
                        index === 5 || index === 6 ? 'text-gray-400' : 'text-gray-400'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {month.days.map((date, dateIndex) => {
                    if (!date) return <div key={`empty-${dateIndex}`} className="h-16" />;
                    
                    const isStart = startDate && isSameDay(date, startDate);
                    const isEnd = endDate && isSameDay(date, endDate);
                    const isSelected = isDateSelected(date);
                    const isInRange = isDateInRange(date);
                    const disabled = isDateDisabled(date);
                    const unavailable = isDateUnavailable(date);
                    const userBooking = isUserBooking(date);
                    const weekend = isWeekend(date);
                    const price = getDatePrice(date);
                    
                    return (
                      <button
                        key={dateIndex}
                        onClick={() => handleDateClick(date)}
                        onMouseEnter={() => handleDateHover(date)}
                        disabled={disabled || unavailable}
                        className={`
                          h-16 flex flex-col items-center justify-center rounded-lg relative transition-all duration-200 text-xs
                          ${disabled ? 'text-gray-600 cursor-not-allowed' : 
                            unavailable ? 'text-red-400 cursor-not-allowed bg-red-900/20' :
                            userBooking ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300 cursor-default' :
                            'text-white cursor-pointer hover:bg-gray-700'}
                          ${weekend && !disabled && !unavailable && !userBooking ? 'bg-[#1F1F1F]' : ''}
                          ${isSelected && !isInRange ? 'bg-[#FF4646] text-white shadow-lg scale-105' : ''}
                          ${isInRange ? 'bg-[#FF4646]/30' : ''}
                          ${isStart ? 'rounded-l-lg' : ''}
                          ${isEnd ? 'rounded-r-lg' : ''}
                          ${!disabled && !unavailable && !isSelected && !isInRange ? 'hover:scale-105' : ''}
                        `}
                      >
                        <span className="font-medium">{format(date, 'd')}</span>
                        {price && !disabled && !unavailable && (
                          <span className={`text-xs ${
                            isSelected ? 'text-white' : 
                            userBooking ? 'text-blue-300' :
                            'text-gray-400'
                          }`}>
                            €{price}
                          </span>
                        )}
                        {unavailable && !userBooking && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                          </div>
                        )}
                        {userBooking && (
                          <div className="absolute top-1 right-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Legend */}
          {availabilityData && (
            <div className="mt-6 p-4 bg-[#292929] rounded-xl">
              <h4 className="text-white font-medium mb-3">Legend</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#1F1F1F] rounded border border-gray-600"></div>
                  <span className="text-gray-300">Weekend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-900/20 rounded border border-red-500/30 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-0.5 bg-red-500 rotate-45"></div>
                    </div>
                  </div>
                  <span className="text-gray-300">Unavailable</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600/30 rounded border border-blue-500/50 relative">
                    <div className="absolute top-0.5 right-0.5">
                      <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <span className="text-gray-300">Your booking</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-[#FF4646] rounded"></div>
                  <span className="text-gray-300">Selected</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with apply button - Fixed at bottom */}
      <div className="bg-[#292929] p-4 border-t border-gray-700 mt-auto">
        {startDate && endDate && availabilityData && (
          <div className="mb-3 p-3 bg-gray-800/50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Total for {calculateDays()} days</span>
              <div className="flex items-center space-x-1">
                <Euro size={16} className="text-[#FF4646]" />
                <span className="text-white font-bold">{calculateTotalPrice()}</span>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={handleApplyDates}
          disabled={!startDate || !endDate}
          className={`
            w-full rounded-xl py-4 font-medium text-center transition-all duration-200 flex items-center justify-center space-x-2
            ${startDate && endDate 
              ? 'bg-[#FF4646] text-white hover:bg-[#CC3636] shadow-lg' 
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