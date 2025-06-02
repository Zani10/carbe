import React, { useState } from 'react';
import { CalendarData, BulkOperation, BookingRequest } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import AvailabilityDateCell from './AvailabilityDateCell';
import BlockDatesModal from './BlockDatesModal';
import BookingRequestSheet from './BookingRequestSheet';

interface AvailabilityGridProps {
  displayMonth: string;
  selectedCarIds: string[];
  calendarData?: CalendarData;
  selectedDates: string[];
  isDragSelecting: boolean;
  onDateClick: (date: string) => void;
  onDragStart: (date: string) => void;
  onDragEnter: (date: string) => void;
  onDragEnd: () => void;
  onBulkOperation: (operation: BulkOperation) => void;
  onUpdateAvailability: (dates: string[], status: 'available' | 'blocked', carIds: string[]) => Promise<void>;
}

export default function AvailabilityGrid({
  displayMonth,
  selectedCarIds,
  calendarData,
  selectedDates,
  isDragSelecting,
  onDateClick,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onBulkOperation,
  onUpdateAvailability
}: AvailabilityGridProps) {
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [selectedBookingRequest, setSelectedBookingRequest] = useState<BookingRequest | null>(null);

  const monthStart = startOfMonth(new Date(displayMonth + '-01'));
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start with Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getCellData = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const isCurrentMonth = date.getMonth() === monthStart.getMonth();
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isSelected = selectedDates.includes(dateStr);

    // Determine status across selected cars
    let status: 'available' | 'blocked' | 'pending' | 'booked' | 'mixed' = 'available';
    let pendingCount = 0;
    const carStatuses: string[] = [];

    selectedCarIds.forEach(carId => {
      const carStatus = calendarData?.availability?.[carId]?.[dateStr] || 'available';
      carStatuses.push(carStatus);
      
      if (carStatus === 'pending' || carStatus === 'booked') {
        const requests = calendarData?.pendingRequestsByDate?.[dateStr] || [];
        pendingCount += requests.filter(r => r.car_id === carId).length;
      }
    });

    // Determine unified status
    if (carStatuses.every(s => s === 'available')) status = 'available';
    else if (carStatuses.every(s => s === 'blocked')) status = 'blocked';
    else if (carStatuses.some(s => s === 'pending')) status = 'pending';
    else if (carStatuses.some(s => s === 'booked')) status = 'booked';
    else status = 'mixed';

    return {
      date,
      dateStr,
      isCurrentMonth,
      isWeekend,
      isSelected,
      status,
      pendingCount,
      bookingRequests: calendarData?.pendingRequestsByDate?.[dateStr] || []
    };
  };

  const handleCellClick = (date: Date) => {
    const cellData = getCellData(date);
    
    if (cellData.status === 'pending' && cellData.bookingRequests.length > 0) {
      // Show booking request sheet
      setSelectedBookingRequest(cellData.bookingRequests[0]);
      return;
    }

    if (cellData.status !== 'booked' && cellData.status !== 'pending') {
      if (selectedDates.length === 0) {
        // Single click - toggle availability immediately
        const newStatus = cellData.status === 'available' ? 'blocked' : 'available';
        onUpdateAvailability([cellData.dateStr], newStatus, selectedCarIds);
      } else {
        // Add to selection for bulk operation
        onDateClick(cellData.dateStr);
      }
    }
  };

  const handleCellMouseDown = (date: Date) => {
    const cellData = getCellData(date);
    if (cellData.status !== 'booked' && cellData.status !== 'pending') {
      onDragStart(cellData.dateStr);
    }
  };

  const handleCellMouseEnter = (date: Date) => {
    const cellData = getCellData(date);
    if (isDragSelecting && cellData.status !== 'booked' && cellData.status !== 'pending') {
      onDragEnter(cellData.dateStr);
    }
  };

  const handleBulkEdit = () => {
    if (selectedDates.length > 0) {
      setShowBlockModal(true);
    }
  };

  return (
    <div className="mb-6" onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`h-10 flex items-center justify-center text-xs font-semibold ${
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
      <div className="grid grid-cols-7 gap-1 mb-6 select-none">
        {calendarDays.map((date) => {
          const cellData = getCellData(date);
          
          return (
            <AvailabilityDateCell
              key={cellData.dateStr}
              date={date}
              isCurrentMonth={cellData.isCurrentMonth}
              isWeekend={cellData.isWeekend}
              isSelected={cellData.isSelected}
              status={cellData.status}
              pendingCount={cellData.pendingCount}
              onClick={() => handleCellClick(date)}
              onMouseDown={() => handleCellMouseDown(date)}
              onMouseEnter={() => handleCellMouseEnter(date)}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-700/30 pt-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-transparent border border-gray-600 rounded mr-2" />
            <span className="text-gray-400">Available</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#2A2A2A] rounded mr-2" />
            <span className="text-gray-400">Blocked</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#007380] rounded mr-2" />
            <span className="text-gray-400">Pending Request</span>
          </div>
          
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#00A680] rounded mr-2" />
            <span className="text-gray-400">Booked</span>
          </div>
        </div>
      </div>

      {/* Bulk Edit Button */}
      {selectedDates.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleBulkEdit}
            className="px-6 py-3 bg-[#FF2800] text-white rounded-lg font-medium hover:bg-[#FF2800]/90 transition-colors"
          >
            Edit {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Modals */}
      {showBlockModal && (
        <BlockDatesModal
          selectedDates={selectedDates}
          selectedCarIds={selectedCarIds}
          onConfirm={onBulkOperation}
          onClose={() => setShowBlockModal(false)}
        />
      )}

      {selectedBookingRequest && (
        <BookingRequestSheet
          booking={selectedBookingRequest}
          onApprove={async () => {
            // Handle booking approval
            setSelectedBookingRequest(null);
          }}
          onDecline={async () => {
            // Handle booking decline
            setSelectedBookingRequest(null);
          }}
          onClose={() => setSelectedBookingRequest(null)}
        />
      )}
    </div>
  );
} 