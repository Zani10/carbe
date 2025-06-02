import React, { useState } from 'react';
import { CalendarData, BulkOperation } from '@/types/calendar';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import PricingDateCell from './PricingDateCell';
import PriceOverridePopover from './PriceOverridePopover';
import BulkPriceModal from './BulkPriceModal';
import PricingOverview from './PricingOverview';

interface PricingGridProps {
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
  onUpdatePricing: (date: string, price: number, carIds: string[], isWeekendOverride?: boolean) => Promise<void>;
}

export default function PricingGrid({
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
  onUpdatePricing
}: PricingGridProps) {
  const [showPricePopover, setShowPricePopover] = useState<{date: string, position: {x: number, y: number}} | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

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

    // Calculate price for this date across selected cars
    let price: number | 'multiple' = 0;
    let hasOverride = false;
    const carPrices: number[] = [];

    selectedCarIds.forEach(carId => {
      const override = calendarData?.pricingOverrides?.[carId]?.[dateStr];
      const basePrice = calendarData?.basePriceByCar?.[carId] || 85;
      
      if (override) {
        carPrices.push(override);
        hasOverride = true;
      } else if (isWeekend) {
        // Weekend markup of 20%
        carPrices.push(Math.round(basePrice * 1.2));
      } else {
        carPrices.push(basePrice);
      }
    });

    // Determine unified price
    if (carPrices.length === 0) {
      price = 85; // default
    } else if (carPrices.every(p => p === carPrices[0])) {
      price = carPrices[0];
    } else {
      price = 'multiple';
    }

    return {
      date,
      dateStr,
      isCurrentMonth,
      isWeekend,
      isSelected,
      price,
      hasOverride
    };
  };

  const handleCellClick = (date: Date, event: React.MouseEvent) => {
    const cellData = getCellData(date);
    
    if (selectedDates.length === 0) {
      // Single click - show price override popover
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setShowPricePopover({
        date: cellData.dateStr,
        position: { x: rect.left + rect.width / 2, y: rect.top }
      });
    } else {
      // Add to selection for bulk operation
      onDateClick(cellData.dateStr);
    }
  };

  const handleCellMouseDown = (date: Date) => {
    const cellData = getCellData(date);
    onDragStart(cellData.dateStr);
  };

  const handleCellMouseEnter = (date: Date) => {
    const cellData = getCellData(date);
    if (isDragSelecting) {
      onDragEnter(cellData.dateStr);
    }
  };

  const handleBulkEdit = () => {
    if (selectedDates.length > 0) {
      setShowBulkModal(true);
    }
  };

  const handlePriceOverrideSave = async (price: number, isWeekendOverride: boolean) => {
    if (showPricePopover) {
      await onUpdatePricing(showPricePopover.date, price, selectedCarIds, isWeekendOverride);
      setShowPricePopover(null);
    }
  };

  // Calculate pricing overview data
  const basePrices = selectedCarIds.map(carId => calendarData?.basePriceByCar?.[carId] || 85);
  const averageBasePrice = basePrices.length > 0 ? basePrices.reduce((a, b) => a + b, 0) / basePrices.length : 85;
  const weekendPrice = Math.round(averageBasePrice * 1.2);

  return (
    <div className="space-y-6" onMouseUp={onDragEnd} onMouseLeave={onDragEnd}>
      {/* Pricing Overview */}
      <PricingOverview
        basePrice={selectedCarIds.length === 1 ? basePrices[0] : averageBasePrice}
        weekendPrice={weekendPrice}
        isMultipleCars={selectedCarIds.length > 1}
      />

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
            <PricingDateCell
              key={cellData.dateStr}
              date={date}
              isCurrentMonth={cellData.isCurrentMonth}
              isWeekend={cellData.isWeekend}
              isSelected={cellData.isSelected}
              price={cellData.price}
              hasOverride={cellData.hasOverride}
              onClick={(e) => handleCellClick(date, e)}
              onMouseDown={() => handleCellMouseDown(date)}
              onMouseEnter={() => handleCellMouseEnter(date)}
            />
          );
        })}
      </div>

      {/* Bulk Edit Button */}
      {selectedDates.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleBulkEdit}
            className="px-6 py-3 bg-[#FF2800] text-white rounded-lg font-medium hover:bg-[#FF2800]/90 transition-colors"
          >
            Set Price for {selectedDates.length} Date{selectedDates.length > 1 ? 's' : ''}
          </button>
        </div>
      )}

      {/* Price Override Popover */}
      {showPricePopover && (
        <PriceOverridePopover
          date={showPricePopover.date}
          position={showPricePopover.position}
          currentPrice={getCellData(new Date(showPricePopover.date + 'T00:00:00')).price as number}
          basePrice={averageBasePrice}
          onSave={handlePriceOverrideSave}
          onClose={() => setShowPricePopover(null)}
        />
      )}

      {/* Bulk Price Modal */}
      {showBulkModal && (
        <BulkPriceModal
          selectedDates={selectedDates}
          selectedCarIds={selectedCarIds}
          basePrice={averageBasePrice}
          onConfirm={onBulkOperation}
          onClose={() => setShowBulkModal(false)}
        />
      )}
    </div>
  );
} 