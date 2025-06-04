import React, { useState } from 'react';
import { CalendarData, BulkOperation, BookingRequest } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import AvailabilityDateCell from './AvailabilityDateCell';
import BlockDatesModal from './BlockDatesModal';
import BookingRequestSheet from './BookingRequestSheet';
import BookedCell from './BookedCell';

interface AvailabilityGridProps {
  displayMonth: string;
  selectedCarIds: string[];
  calendarData?: CalendarData;
  adjacentMonthsData?: { [month: string]: CalendarData };
  selectedDates: string[];
  isDragSelecting: boolean;
  onDateClick: (date: string) => void;
  onDragStart: (date: string) => void;
  onDragEnter: (date: string) => void;
  onDragEnd: () => void;
  onBulkOperation: (operation: BulkOperation) => void;
}

export default function AvailabilityGrid({
  displayMonth,
  selectedCarIds,
  calendarData,
  adjacentMonthsData,
  selectedDates,
  isDragSelecting,
  onDateClick,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onBulkOperation
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

    // Get data from current month or adjacent months if available
    const dateMonth = format(date, 'yyyy-MM');
    const relevantData = dateMonth === displayMonth ? calendarData : adjacentMonthsData?.[dateMonth];

    // Determine status across selected cars - Airbnb default: available
    let status: 'available' | 'blocked' | 'pending' | 'booked' | 'mixed' = 'available';
    let pendingCount = 0;
    let booking = undefined;
    let pricing = undefined;
    const carStatuses: string[] = [];

    selectedCarIds.forEach(carId => {
      // Default to 'available' like Airbnb - hosts manually block dates as needed  
      const carStatus = relevantData?.availability?.[carId]?.[dateStr] || 'available';
      carStatuses.push(carStatus);
      
      if (carStatus === 'pending' || carStatus === 'booked') {
        const requests = relevantData?.pendingRequestsByDate?.[dateStr] || [];
        pendingCount += requests.filter(r => r.car_id === carId).length;
      }
    });

    // Get pricing data for the first selected car (simplified for now)
    if (selectedCarIds.length > 0 && relevantData) {
      const firstCarId = selectedCarIds[0];
      const priceOverride = relevantData.pricingOverrides?.[firstCarId]?.[dateStr];
      const basePrice = relevantData.basePriceByCar?.[firstCarId];
      
      if (priceOverride || basePrice) {
        pricing = {
          basePrice: priceOverride || basePrice,
          currency: '€'
        };
      }
    }

    // Check for bookings on this date (including cross-month bookings)
    const dayBookings = relevantData?.bookings?.filter(booking => {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);
      const currentDate = new Date(dateStr);
      
      return currentDate >= bookingStart && currentDate <= bookingEnd && 
             selectedCarIds.includes(booking.car_id) &&
             (booking.status === 'confirmed' || booking.status === 'completed');
    }) || [];

    if (dayBookings.length > 0) {
      const currentBooking = dayBookings[0]; // Take first booking for this date
      const bookingStart = new Date(currentBooking.start_date);
      const bookingEnd = new Date(currentBooking.end_date);
      const currentDate = new Date(dateStr);
      
      const isStart = currentDate.getTime() === bookingStart.getTime();
      const isEnd = currentDate.getTime() === bookingEnd.getTime();
      const isMiddle = !isStart && !isEnd;
      
      booking = {
        id: currentBooking.id,
        guest_name: currentBooking.guest_name,
        guest_avatar: undefined, // CalendarBooking doesn't have avatar, could add later
        isStart,
        isEnd,
        isMiddle
      };
      
      // Override status to booked if we found a booking
      status = 'booked';
    } else {
      // Determine unified status for non-booked dates
      if (carStatuses.every(s => s === 'available')) status = 'available';
      else if (carStatuses.every(s => s === 'blocked')) status = 'blocked';
      else if (carStatuses.some(s => s === 'pending')) status = 'pending';
      else if (carStatuses.some(s => s === 'booked')) status = 'booked';
      else status = 'mixed';
    }

    return {
      date,
      dateStr,
      isCurrentMonth,
      isWeekend,
      isSelected,
      status,
      pendingCount,
      pricing,
      booking,
      bookingRequests: relevantData?.pendingRequestsByDate?.[dateStr] || []
    };
  };

  const handleCellClick = (date: Date) => {
    const cellData = getCellData(date);
    
    if (cellData.status === 'pending' && cellData.bookingRequests.length > 0) {
      // Show booking request sheet for pending bookings
      setSelectedBookingRequest(cellData.bookingRequests[0]);
      return;
    }

    if (cellData.status !== 'booked' && cellData.status !== 'pending') {
      // Mobile-first: always add to selection for bulk operation
      onDateClick(cellData.dateStr);
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

  // Process calendar days into renderable grid items with merged bookings
  const processCalendarItems = () => {
    const items = [];
    let i = 0;

    while (i < calendarDays.length) {
      const date = calendarDays[i];
      const cellData = getCellData(date);
      const currentWeekStart = Math.floor(i / 7) * 7;
      const currentWeekEnd = currentWeekStart + 6;

      if (cellData.status === 'booked' && cellData.booking) {
        // Check if this is the start of a new booking segment (either actual start or start of week continuation)
        const isBookingStart = cellData.booking.isStart;
        const isWeekContinuation = !cellData.booking.isStart && (i === currentWeekStart);
        
        if (isBookingStart || isWeekContinuation) {
          // Find the span of this booking within the current week
          let span = 1;
          
          for (let j = i + 1; j <= Math.min(currentWeekEnd, calendarDays.length - 1); j++) {
            const nextCellData = getCellData(calendarDays[j]);
            if (nextCellData.status === 'booked' && 
                nextCellData.booking?.id === cellData.booking.id) {
              span++;
              if (nextCellData.booking?.isEnd) break;
              if (j === currentWeekEnd) {
                break;
              }
            } else {
              break;
            }
          }

          // Collect all dates in this span for the BookedCell component
          const datesInSpan = [];
          for (let k = i; k < i + span; k++) {
            datesInSpan.push(calendarDays[k]);
          }

          items.push({
            type: 'booked' as const,
            key: `${cellData.booking.id}-${i}`,
            booking: cellData.booking,
            startDate: date,
            datesInSpan: datesInSpan,
            span,
            cellData,
            isWeekContinuation
          });

          i += span;
        } else {
          // This is part of a booking that was already processed, skip
          i++;
        }
      } else {
        items.push({
          type: 'regular' as const,
          key: cellData.dateStr,
          date: date,
          cellData
        });
        i++;
      }
    }

    return items;
  };

  const gridItems = processCalendarItems();

  return (
    <div className="mb-6" onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {weekDays.map((day, index) => (
          <div
            key={day}
            className={`h-8 flex items-center justify-center text-xs font-medium ${
              index >= 5 // Saturday and Sunday
                ? 'text-[#FF4646]' 
                : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid with Dynamic Spans */}
      <div className="grid grid-cols-7 gap-1 mb-8 select-none">
        {gridItems.map((item) => {
          if (item.type === 'booked') {
            return (
              <BookedCell
                key={item.key}
                booking={item.booking}
                datesInSpan={item.datesInSpan}
                span={item.span}
                cellData={item.cellData}
                isWeekContinuation={item.isWeekContinuation}
              />
            );
          } else {
            return (
              <AvailabilityDateCell
                key={item.key}
                date={item.date}
                isCurrentMonth={item.cellData.isCurrentMonth}
                isWeekend={item.cellData.isWeekend}
                isSelected={item.cellData.isSelected}
                status={item.cellData.status}
                pendingCount={item.cellData.pendingCount}
                pricing={item.cellData.pricing}
                booking={item.cellData.booking}
                onClick={() => handleCellClick(item.date)}
                onMouseDown={() => handleCellMouseDown(item.date)}
                onMouseEnter={() => handleCellMouseEnter(item.date)}
              />
            );
          }
        })}
      </div>

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