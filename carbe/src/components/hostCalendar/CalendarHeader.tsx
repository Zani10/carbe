import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell,
  ChevronDown,
  Check
} from 'lucide-react';
import { format } from 'date-fns';
import { Vehicle, CalendarMetrics } from '@/types/calendar';

interface CalendarHeaderProps {
  displayMonth: string;
  vehicles: Vehicle[];
  selectedCarIds: string[];
  metrics?: CalendarMetrics;
  selectedDatesCount: number;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onVehicleChange: (vehicleIds: string[]) => void;
  onClearSelection: () => void;
}

export default function CalendarHeader({
  displayMonth,
  vehicles,
  selectedCarIds,
  metrics,
  selectedDatesCount,
  onMonthChange,
  onVehicleChange,
  onClearSelection
}: CalendarHeaderProps) {
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const monthDate = new Date(displayMonth + '-01');
  const isAllVehicles = selectedCarIds.length === vehicles.length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVehicleDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleVehicleToggle = (vehicleId: string) => {
    if (isAllVehicles && vehicleId === 'all') {
      return; // Already all selected
    }
    
    if (vehicleId === 'all') {
      onVehicleChange(vehicles.map(v => v.id));
    } else {
      const newSelection = selectedCarIds.includes(vehicleId)
        ? selectedCarIds.filter(id => id !== vehicleId)
        : [...selectedCarIds, vehicleId];
      
      if (newSelection.length === 0) {
        // Don't allow deselecting all
        return;
      }
      
      onVehicleChange(newSelection);
    }
  };

  const getVehicleLabel = () => {
    if (isAllVehicles) {
      return `All Vehicles (${vehicles.length})`;
    }
    if (selectedCarIds.length === 1) {
      const vehicle = vehicles.find(v => v.id === selectedCarIds[0]);
      return vehicle ? `${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
    }
    return `${selectedCarIds.length} Vehicles Selected`;
  };

  return (
    <div className="mb-8">
      {/* Pending Requests Banner */}
      {metrics && metrics.pendingRequestsCount > 0 && (
        <div className="mb-6 bg-gradient-to-r from-[#FF8C00]/10 to-[#FFB347]/10 border border-[#FF8C00]/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bell className="h-5 w-5 text-[#FF8C00] mr-3" />
              <div>
                <p className="text-white font-semibold text-sm">
                  {metrics.pendingRequestsCount} new booking request{metrics.pendingRequestsCount > 1 ? 's' : ''}
                </p>
                <p className="text-[#FF8C00] text-xs">Respond quickly to maintain your rating</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#FF8C00] text-white rounded-lg text-sm font-medium hover:bg-[#FF8C00]/90 transition-colors">
              View Requests
            </button>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-2xl font-semibold">Calendar</h1>
        
        <div className="flex items-center space-x-6">
          {/* Revenue Metric */}
          <div className="text-right">
            <div className="text-white text-lg font-medium">
              €{metrics?.totalRevenue?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-400 text-xs">This month</div>
          </div>
          
          {/* Notification Bell */}
          <div className="relative">
            <Bell className="h-6 w-6 text-white" />
            {metrics && metrics.pendingRequestsCount > 0 && (
              <div className="absolute -top-2 -right-2 bg-[#FF8C00] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {metrics.pendingRequestsCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={() => onMonthChange('prev')}
          className="p-2 text-white hover:text-gray-300 transition-colors"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        
        <div className="mx-8">
          <h2 className="text-white text-lg font-medium text-center">
            {format(monthDate, 'MMMM yyyy')}
          </h2>
        </div>
        
        <button
          onClick={() => onMonthChange('next')}
          className="p-2 text-white hover:text-gray-300 transition-colors"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Vehicle Selector & Bulk Actions */}
      <div className="flex items-center justify-between">
        {/* Vehicle Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowVehicleDropdown(!showVehicleDropdown)}
            className="flex items-center space-x-2 bg-[#181818] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#222222] transition-colors"
          >
            <span>{getVehicleLabel()}</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showVehicleDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showVehicleDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#181818] border border-gray-700 rounded-lg shadow-xl z-50">
              <div className="p-2">
                {/* All Vehicles Option */}
                <button
                  onClick={() => handleVehicleToggle('all')}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <span className="text-white font-medium">All Vehicles ({vehicles.length})</span>
                  {isAllVehicles && <Check className="h-4 w-4 text-[#FF2800]" />}
                </button>
                
                <div className="border-t border-gray-700 my-2" />
                
                {/* Individual Vehicles */}
                {vehicles.map((vehicle) => (
                  <button
                    key={vehicle.id}
                    onClick={() => handleVehicleToggle(vehicle.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="text-left">
                      <div className="text-white font-medium">{vehicle.make} {vehicle.model}</div>
                      <div className="text-gray-400 text-sm">{vehicle.type} • €{vehicle.base_price}/night</div>
                    </div>
                    {selectedCarIds.includes(vehicle.id) && (
                      <Check className="h-4 w-4 text-[#FF2800]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        <div className="flex items-center space-x-3">
          {selectedDatesCount > 0 && (
            <button
              onClick={onClearSelection}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Clear ({selectedDatesCount})
            </button>
          )}
          
          <button
            disabled={selectedDatesCount === 0}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              selectedDatesCount > 0
                ? 'bg-[#FF2800] hover:bg-[#FF2800]/90'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
            }`}
          >
            Bulk Edit
          </button>
        </div>
      </div>
    </div>
  );
} 