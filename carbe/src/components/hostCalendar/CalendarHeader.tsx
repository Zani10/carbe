import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Vehicle } from '@/types/calendar';
import { motion } from 'framer-motion';
import DynamicCarAvatar from './DynamicCarAvatar';
import CalendarSettingsSheet from './CalendarSettingsSheet';

interface CalendarSettings {
  basePricePerDay: number;
  minimumStayRequirement: number;
  weekendPriceAdjustment: {
    type: 'percentage' | 'fixed';
    value: number;
  };
  specialEventPricing: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    pricePerDay: number;
  }>;
  defaultCheckInTime: string;
  defaultCheckOutTime: string;
  bookingLeadTime: number;
}

interface CalendarHeaderProps {
  vehicles: Vehicle[];
  selectedCarIds: string[];
  selectedDatesCount: number;
  onVehicleChange: (vehicleIds: string[]) => void;
  onSettingsSave?: (settings: CalendarSettings) => void;
}

export default function CalendarHeader({
  vehicles,
  selectedCarIds,
  selectedDatesCount,
  onVehicleChange,
  onSettingsSave
}: CalendarHeaderProps) {
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

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

  return (
    <>
      {/* Simplified Header */}
      <div className="flex items-center justify-between py-4">
        {/* Left: App Title */}
        <div className="flex items-center space-x-4">
         
        </div>

        {/* Right: Actions with Fade Effect */}
        <motion.div 
          className="flex items-center space-x-2"
          animate={{ 
            opacity: selectedDatesCount > 0 ? 0 : 1 
          }}
          transition={{ duration: 0.1 }}
        >
          {/* Vehicle Selector with Dynamic Avatar */}
          <button
            onClick={() => setShowVehicleModal(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/30"
            disabled={selectedDatesCount > 0}
          >
            <DynamicCarAvatar
              selectedCarIds={selectedCarIds}
              allCars={vehicles}
              size="md"
            />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettingsSheet(true)}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/30"
            disabled={selectedDatesCount > 0}
          >
            <Settings className="w-5 h-5" />
          </button>
        </motion.div>
      </div>

      {/* Vehicle Selection Modal */}
      {showVehicleModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setShowVehicleModal(false)}
          />
          
          <div className="fixed bottom-0 left-0 right-0 z-50 mx-4 mb-4">
            <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl border border-gray-700/30 overflow-hidden max-w-sm mx-auto">
              {/* Header */}
              <div className="p-4 text-center border-b border-gray-700/20">
                <h3 className="text-lg font-medium text-white">Select Vehicles</h3>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedCarIds.length} of {totalVehicleCount} selected
                </p>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Select All Option */}
                <button
                  onClick={handleSelectAllVehicles}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-800/30 transition-colors rounded-xl mb-3"
                >
                  <span className="text-white font-medium text-sm">
                    All Vehicles
                  </span>
                  <div className={`w-4 h-4 rounded border ${
                    selectedCarIds.length === vehicles.length
                      ? 'bg-[#FF4646] border-[#FF4646]'
                      : 'border-gray-600'
                  } flex items-center justify-center`}>
                    {selectedCarIds.length === vehicles.length && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Individual Vehicles */}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {vehicles.map(vehicle => (
                    <button
                      key={vehicle.id}
                      onClick={() => handleVehicleToggle(vehicle.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-800/30 transition-colors rounded-xl"
                    >
                      <div className="flex-1 text-left">
                        <div className="text-white text-sm font-medium">{vehicle.name}</div>
                        <div className="text-gray-400 text-xs">€{vehicle.base_price}/day</div>
                      </div>
                      <div className={`w-4 h-4 rounded border ${
                        selectedCarIds.includes(vehicle.id)
                          ? 'bg-[#FF4646] border-[#FF4646]'
                          : 'border-gray-600'
                      } flex items-center justify-center ml-3`}>
                        {selectedCarIds.includes(vehicle.id) && (
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-700/20">
                <button
                  onClick={() => setShowVehicleModal(false)}
                  className="w-full py-2.5 bg-[#FF4646] text-white rounded-xl text-sm font-medium hover:bg-[#FF4646]/90 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Calendar Settings Sheet */}
      <CalendarSettingsSheet
        isOpen={showSettingsSheet}
        onClose={() => setShowSettingsSheet(false)}
        currentSettings={{
          basePricePerDay: vehicles[0]?.base_price || 65,
          minimumStayRequirement: 1,
          weekendPriceAdjustment: { type: 'percentage', value: 20 },
          specialEventPricing: [],
          defaultCheckInTime: '15:00',
          defaultCheckOutTime: '11:00',
          bookingLeadTime: 1
        }}
        onSave={async (settings) => {
          onSettingsSave?.(settings);
          console.log('Settings saved:', settings);
        }}
      />
    </>
  );
} 