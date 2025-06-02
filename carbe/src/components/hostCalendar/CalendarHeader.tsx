import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Car, 
  MousePointer
} from 'lucide-react';
import { formatMonthYear, navigateMonth } from '@/lib/calendar/dateUtils';

interface CalendarHeaderProps {
  month: Date;
  selectedCarId: string;
  vehicles: Array<{ id: string; name: string; make: string; model: string }>;
  bulkMode: boolean;
  selectedDatesCount: number;
  pendingRequestsCount: number;
  onMonthChange: (newMonth: Date) => void;
  onCarChange: (carId: string) => void;
  onBulkModeToggle: () => void;
  onClearSelection: () => void;
  onSettingsClick: () => void;
}

export default function CalendarHeader({
  month,
  selectedCarId,
  vehicles,
  bulkMode,
  selectedDatesCount,
  onMonthChange,
  onCarChange,
  onBulkModeToggle,
  onClearSelection
}: CalendarHeaderProps) {
  const handlePrevMonth = () => {
    onMonthChange(navigateMonth(month, 'prev'));
  };
  
  const handleNextMonth = () => {
    onMonthChange(navigateMonth(month, 'next'));
  };

  return (
    <div className="mb-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMonth}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        
        <h2 className="text-xl font-bold text-white">
          {formatMonthYear(month)}
        </h2>
        
        <button
          onClick={handleNextMonth}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Vehicle Filter & Bulk Mode Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Car className="h-4 w-4 text-gray-400 mr-2" />
          <select
            value={selectedCarId}
            onChange={(e) => onCarChange(e.target.value)}
            className="bg-transparent border-none text-white text-sm focus:ring-0 focus:outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#1A1A1A] text-white">All Vehicles ({vehicles.length})</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id} className="bg-[#1A1A1A] text-white">
                {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center space-x-3">
          {bulkMode && selectedDatesCount > 0 && (
            <button
              onClick={onClearSelection}
              className="text-gray-400 hover:text-white text-sm"
            >
              Clear ({selectedDatesCount})
            </button>
          )}
          
          <button
            onClick={onBulkModeToggle}
            className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              bulkMode
                ? 'bg-[#FF2800] text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <MousePointer className="h-4 w-4 mr-1" />
            {bulkMode ? 'Exit Bulk' : 'Bulk Edit'}
          </button>
        </div>
      </div>
      
      {/* Bulk Mode Active Indicator */}
      {bulkMode && (
        <div className="mt-3 text-center">
          <p className="text-[#FF2800] text-sm font-medium">
            Bulk edit mode active - Select multiple dates
          </p>
        </div>
      )}
    </div>
  );
} 