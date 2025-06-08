import React, { useState } from 'react';
import { format, startOfDay, isBefore, isAfter, isSameDay } from 'date-fns';
import { X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleCompactDatePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDates: (startDate: Date, endDate: Date) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

const SimpleCompactDatePicker: React.FC<SimpleCompactDatePickerProps> = ({
  isOpen,
  onClose,
  onSelectDates,
  initialStartDate,
  initialEndDate,
}) => {
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || null);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const handleDateClick = (date: Date) => {
    const today = startOfDay(new Date());
    if (isBefore(date, today)) return; // Don't allow past dates

    // Simple date selection logic
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(date);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Complete the range
      if (isSameDay(date, startDate)) {
        setEndDate(date); // Same day booking
      } else if (isBefore(date, startDate)) {
        setStartDate(date);
        setEndDate(startDate);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleApply = () => {
    if (startDate && endDate) {
      onSelectDates(startDate, endDate);
      onClose();
    }
  };

  // Generate current and next month
  const generateCalendarDates = () => {
    const today = new Date();
    const months = [];
    
    for (let i = 0; i < 2; i++) {
      const monthStart = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = format(monthStart, 'MMMM yyyy');
      
      const daysInMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0).getDate();
      const startDay = (monthStart.getDay() + 6) % 7; // Monday first
      
      const days = [];
      
      // Empty slots for days before month starts
      for (let d = 0; d < startDay; d++) {
        days.push(null);
      }
      
      // Actual days
      for (let d = 1; d <= daysInMonth; d++) {
        days.push(new Date(monthStart.getFullYear(), monthStart.getMonth(), d));
      }
      
      months.push({ name: monthName, days });
    }
    
    return months;
  };

  const isDateSelected = (date: Date) => {
    if (!startDate) return false;
    if (isSameDay(date, startDate)) return true;
    if (endDate && isSameDay(date, endDate)) return true;
    if (startDate && endDate && isAfter(date, startDate) && isBefore(date, endDate)) return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (startDate && !endDate && hoverDate) {
      const start = startDate;
      const end = hoverDate;
      return (isAfter(date, start) && isBefore(date, end)) || (isAfter(date, end) && isBefore(date, start));
    }
    return false;
  };

  const isDateDisabled = (date: Date) => {
    const today = startOfDay(new Date());
    return isBefore(date, today);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-[#2a2a2a] rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-600">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#FF4646]" />
                <h3 className="text-white font-semibold">Select Dates</h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Calendar */}
            <div className="p-4 overflow-y-auto max-h-96">
              {generateCalendarDates().map((month, monthIndex) => (
                <div key={month.name} className={monthIndex > 0 ? 'mt-6' : ''}>
                  <h4 className="text-sm font-medium text-white mb-3">{month.name}</h4>
                  
                  {/* Weekday headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div key={day} className="text-xs text-gray-400 text-center py-1 font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {month.days.map((date, index) => (
                      <div key={index} className="aspect-square">
                        {date ? (
                          <button
                            onClick={() => handleDateClick(date)}
                            onMouseEnter={() => setHoverDate(date)}
                            onMouseLeave={() => setHoverDate(null)}
                            disabled={isDateDisabled(date)}
                            className={`
                              w-full h-full rounded-lg text-sm font-medium transition-all
                              ${isDateDisabled(date) 
                                ? 'text-gray-600 cursor-not-allowed' 
                                : 'text-gray-200 hover:bg-gray-600 cursor-pointer'
                              }
                              ${isDateSelected(date) 
                                ? 'bg-[#FF4646] text-white hover:bg-[#FF4646]' 
                                : ''
                              }
                              ${isDateInRange(date) && !isDateSelected(date) 
                                ? 'bg-[#FF4646]/20 text-[#FF4646]' 
                                : ''
                              }
                            `}
                          >
                            {date.getDate()}
                          </button>
                        ) : (
                          <div />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-600 bg-[#1e1e1e]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-300">
                  {startDate && endDate ? (
                    <span>
                      {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                    </span>
                  ) : startDate ? (
                    <span>Select end date</span>
                  ) : (
                    <span>Select start date</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setStartDate(null);
                      setEndDate(null);
                    }}
                    className="px-3 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApply}
                    disabled={!startDate || !endDate}
                    className="px-4 py-2 bg-[#FF4646] text-white text-sm font-medium rounded-lg hover:bg-[#FF3333] disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SimpleCompactDatePicker; 