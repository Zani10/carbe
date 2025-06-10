import React, { useState } from 'react';
import { format, isBefore, isAfter, isSameDay, differenceInDays, startOfDay } from 'date-fns';
import { X, ChevronLeft, ChevronRight, Euro, AlertTriangle } from 'lucide-react';
import { useCarAvailability } from '@/hooks/useCarAvailability';

interface DesktopDatePickerProps {
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

const DesktopDatePicker: React.FC<DesktopDatePickerProps> = ({
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
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

    if (!startDate || (startDate && endDate && !isSameDay(startDate, endDate))) {
      const error = validateSelection(date, date);
      if (error) {
        setValidationError(error);
        return;
      }
      setStartDate(date);
      setEndDate(date);
    } else if (startDate && endDate && isSameDay(startDate, endDate) && isSameDay(date, startDate)) {
      setStartDate(null);
      setEndDate(null);
    } else if (startDate && endDate && isSameDay(startDate, endDate)) {
      const newStartDate = isBefore(date, startDate) ? date : startDate;
      const newEndDate = isBefore(date, startDate) ? startDate : date;
      
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

  // Generate calendar for current month
  const generateCalendarDates = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    const endDate = new Date(monthEnd);

    // Adjust to start on Monday
    startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()) % 7);

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
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

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(endDate, startDate) + 1;
  };

  const calculateTotalPrice = () => {
    if (!startDate || !endDate || !availabilityData) return 0;
    
    let total = 0;
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      const price = availabilityData.pricingOverrides[dateStr] || availabilityData.basePrice;
      if (price) total += price;
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return total;
  };

  if (!isOpen) return null;

  const days = generateCalendarDates();
  const totalDays = calculateDays();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#2A2A2A] rounded-2xl p-4 w-full max-w-sm mx-4 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Select dates</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-600 transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-400" />
          </button>
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <div className="mb-3 p-2 bg-red-900/20 border border-red-700/50 rounded-lg flex items-center space-x-2">
            <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-xs">{validationError.message}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && carId ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4646]"></div>
          </div>
        ) : (
          <>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={prevMonth}
                className="p-1 rounded-full hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <ChevronLeft size={18} className="text-gray-400" />
              </button>
              <h4 className="text-base font-medium text-white">
                {format(currentMonth, 'MMMM yyyy')}
              </h4>
              <button
                onClick={nextMonth}
                className="p-1 rounded-full hover:bg-gray-600 transition-colors cursor-pointer"
              >
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Week Days - with weekend styling */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, index) => (
                <div key={day} className={`p-2 text-center text-xs font-medium ${
                  index === 5 || index === 6 ? 'text-[#FF4646]' : 'text-gray-400'
                }`}>
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {days.map((date, index) => {
                const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
                const isSelected = isDateSelected(date);
                const isInRange = isDateInRange(date);
                const isDisabled = isDateDisabled(date);
                const isUnavailable = isDateUnavailable(date);
                const userBooking = isUserBooking(date);
                const weekend = isWeekend(date);
                const price = getDatePrice(date);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateClick(date)}
                    onMouseEnter={() => handleDateHover(date)}
                    onMouseLeave={() => setHoverDate(null)}
                    disabled={isDisabled || isUnavailable}
                    className={`
                      h-12 flex flex-col items-center justify-center rounded-lg relative transition-all duration-200 text-xs
                      ${!isCurrentMonth ? 'text-gray-600' : 'text-white'}
                      ${isDisabled ? 'text-gray-600 cursor-not-allowed' : 
                        isUnavailable ? 'text-red-400 cursor-not-allowed bg-red-900/20' :
                        userBooking ? 'bg-blue-600/30 border border-blue-500/50 text-blue-300 cursor-default' :
                        'cursor-pointer hover:bg-gray-600'}
                      ${weekend && !isDisabled && !isUnavailable && !userBooking && !isSelected ? 'bg-[#1F1F1F]' : ''}
                      ${isSelected && !isInRange ? 'bg-[#FF4646] text-white shadow-lg scale-105' : ''}
                      ${isInRange ? 'bg-[#FF4646]/30' : ''}
                      ${!isDisabled && !isUnavailable && !isSelected && !isInRange ? 'hover:scale-105' : ''}
                    `}
                  >
                    <span className="font-medium">{format(date, 'd')}</span>
                    {price && !isDisabled && !isUnavailable && isCurrentMonth && (
                      <span className={`text-xs ${
                        isSelected ? 'text-white' : 
                        userBooking ? 'text-blue-300' :
                        'text-gray-400'
                      }`}>
                        €{price}
                      </span>
                    )}
                    {isUnavailable && !userBooking && (
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



            {/* Selection Summary */}
            {startDate && endDate && availabilityData && (
              <div className="mb-4 p-3 bg-[#212121] rounded-xl border border-gray-600">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-400 text-xs">Selected dates</span>
                  <span className="text-white font-medium text-sm">
                    {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total for {totalDays} {totalDays === 1 ? 'day' : 'days'}</span>
                  <div className="flex items-center space-x-1">
                    <Euro size={14} className="text-[#FF4646]" />
                    <span className="text-white font-bold">{totalPrice}</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={resetSelection}
            className="flex-1 py-3 px-4 bg-[#212121] hover:bg-[#333333] text-white rounded-xl transition-colors duration-200 cursor-pointer"
          >
            Clear
          </button>
          <button
            onClick={handleApplyDates}
            disabled={!startDate || !endDate || !!validationError}
            className="flex-1 py-3 px-4 bg-[#FF4646] hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 cursor-pointer"
          >
            Apply dates
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesktopDatePicker; 