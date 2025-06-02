import React, { useState } from 'react';
import { Car, Settings } from 'lucide-react';
import { Vehicle, CalendarMetrics } from '@/types/calendar';
import { format, parse } from 'date-fns';

interface CalendarHeaderProps {
  displayMonth: string;
  vehicles: Vehicle[];
  selectedCarIds: string[];
  metrics?: CalendarMetrics;
  selectedDatesCount: number;
  activeTab: 'availability' | 'pricing';
  onMonthChange: (direction: 'prev' | 'next') => void;
  onVehicleChange: (vehicleIds: string[]) => void;
  onTabChange: (tab: 'availability' | 'pricing') => void;
  onClearSelection: () => void;
}

export default function CalendarHeader({
  displayMonth,
  vehicles,
  selectedCarIds,
  metrics,
  selectedDatesCount,
  activeTab,
  onMonthChange,
  onVehicleChange,
  onTabChange,
  onClearSelection
}: CalendarHeaderProps) {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const monthDate = parse(displayMonth, 'yyyy-MM', new Date());
  const monthName = format(monthDate, 'MMMM yyyy');

  const totalVehicleCount = vehicles.length;

  const handleVehicleToggle = (vehicleId: string) => {
    const newSelection = selectedCarIds.includes(vehicleId)
      ? selectedCarIds.filter(id => id !== vehicleId)
      : [...selectedCarIds, vehicleId];
    
    onVehicleChange(newSelection);
  };

  const handleSelectAllVehicles = () => {
    if (selectedCarIds.length === vehicles.length) {
      // If all selected, deselect all except first one
      onVehicleChange([vehicles[0]?.id].filter(Boolean));
    } else {
      // Select all
      onVehicleChange(vehicles.map(v => v.id));
    }
  };



  // Generate month options for settings modal
  const monthOptions = [];
  for (let i = -6; i <= 6; i++) {
    const optionDate = new Date(monthDate);
    optionDate.setMonth(monthDate.getMonth() + i);
    monthOptions.push({
      value: format(optionDate, 'yyyy-MM'),
      label: format(optionDate, 'MMMM yyyy')
    });
  }

  const handleMonthSelect = (monthValue: string) => {
    const currentMonth = parse(displayMonth, 'yyyy-MM', new Date());
    const targetMonth = parse(monthValue, 'yyyy-MM', new Date());
    
    if (targetMonth > currentMonth) {
      onMonthChange('next');
    } else if (targetMonth < currentMonth) {
      onMonthChange('prev');
    }
  };

  return (
    <>
      {/* Ultra-Clean Header */}
      <div className="flex items-center justify-between py-4 mb-6">
        {/* Left: Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onTabChange('availability')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'availability'
                ? 'bg-gray-800/50 text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            Availability
          </button>
          <button
            onClick={() => onTabChange('pricing')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'pricing'
                ? 'bg-gray-800/50 text-white'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/30'
            }`}
          >
            Pricing
          </button>
        </div>

        {/* Center: Empty for clean look */}
        <div className="w-8"></div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Clear Selection */}
          {selectedDatesCount > 0 && (
            <button
              onClick={onClearSelection}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear ({selectedDatesCount})
            </button>
          )}

          {/* Vehicle Selector */}
          <button
            onClick={() => setShowVehicleModal(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/30"
          >
            <Car className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/30"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Vehicle Selection Modal */}
      {showVehicleModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowVehicleModal(false)}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4">
            <div className="bg-[#212121] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700/30">
                <h3 className="text-lg font-semibold text-white">Select Vehicles</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Choose which vehicles to show in your calendar
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Select All Option */}
                <button
                  onClick={handleSelectAllVehicles}
                  className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors rounded-lg border-b border-gray-700/30 mb-4 pb-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      All Vehicles ({totalVehicleCount})
                    </span>
                    <div className={`w-5 h-5 rounded border-2 ${
                      selectedCarIds.length === vehicles.length
                        ? 'bg-[#FF4646] border-[#FF4646]'
                        : 'border-gray-500'
                    }`}>
                      {selectedCarIds.length === vehicles.length && (
                        <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>

                {/* Individual Vehicles */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {vehicles.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleToggle(vehicle.id)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">{vehicle.name}</div>
                          <div className="text-gray-400 text-sm">€{vehicle.base_price}/day</div>
                        </div>
                        <div className={`w-5 h-5 rounded border-2 ${
                          selectedCarIds.includes(vehicle.id)
                            ? 'bg-[#FF4646] border-[#FF4646]'
                            : 'border-gray-500'
                        }`}>
                          {selectedCarIds.includes(vehicle.id) && (
                            <svg className="w-3 h-3 text-white ml-0.5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700/30">
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="w-full py-3 bg-[#FF4646] text-white rounded-xl font-semibold hover:bg-[#FF4646]/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setShowSettingsModal(false)}
          />
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4">
            <div className="bg-[#212121] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-700/30">
                <h3 className="text-lg font-semibold text-white">Calendar Settings</h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Revenue Display */}
                <div className="p-4 bg-gray-800/30 rounded-xl">
                  <div className="text-sm text-gray-400 mb-1">This month&apos;s revenue</div>
                  <div className="text-xl font-bold text-white">
                    €{metrics?.totalRevenue || 720}
                  </div>
                </div>

                {/* Quick Month Jump */}
                <div>
                  <label className="block text-white font-medium mb-2 text-sm">
                    Jump to Month
                  </label>
                  <select
                    value={displayMonth}
                    onChange={(e) => handleMonthSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-[#FF4646] transition-colors"
                  >
                    {monthOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Performance Stats */}
                {metrics && (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Occupancy Rate</span>
                      <span className="text-white font-medium">
                        {Math.round((metrics.occupancyRate || 0) * 100)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">Average Rate</span>
                      <span className="text-white font-medium">
                        €{metrics.averageRate || 85}
                      </span>
                    </div>
                    {metrics.pendingRequestsCount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Pending Requests</span>
                        <span className="text-[#FF4646] font-medium">
                          {metrics.pendingRequestsCount}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700/30">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full py-3 bg-gray-800/50 text-white rounded-xl font-medium hover:bg-gray-800/70 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
} 