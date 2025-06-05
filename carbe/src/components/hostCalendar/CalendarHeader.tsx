import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { Vehicle } from '@/types/calendar';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import DynamicCarAvatar from './DynamicCarAvatar';
import CalendarSettingsSheet from './CalendarSettingsSheet';
import VehicleSelectionSheet from './VehicleSelectionSheet';

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
  displayMonth: string;
  vehicles: Vehicle[];
  selectedCarIds: string[];
  metrics?: unknown;
  selectedDatesCount: number;
  onMonthChange: (direction: 'prev' | 'next') => void;
  onVehicleChange: (vehicleIds: string[]) => void;
  onSettingsSave?: (settings: CalendarSettings) => void;
}

export default function CalendarHeader({
  displayMonth,
  vehicles,
  selectedCarIds,
  metrics,
  selectedDatesCount,
  onMonthChange,
  onVehicleChange,
  onSettingsSave
}: CalendarHeaderProps) {
  // Suppress unused prop warnings
  void displayMonth;
  void metrics;
  void onMonthChange;
  
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<CalendarSettings>({
    basePricePerDay: vehicles[0]?.base_price || 65,
    minimumStayRequirement: 1,
    weekendPriceAdjustment: { type: 'percentage', value: 20 },
    specialEventPricing: [],
    defaultCheckInTime: '15:00',
    defaultCheckOutTime: '11:00',
    bookingLeadTime: 1
  });

  // Fetch settings when component mounts or selected cars change
  useEffect(() => {
    const fetchSettings = async () => {
      if (selectedCarIds.length === 0) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch(`/api/host/calendar/settings?carIds=${selectedCarIds.join(',')}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const settingsByCar = await response.json();
          
          // If multiple cars are selected, show settings for the first car as default
          // or aggregate settings if they're all the same
          const firstCarId = selectedCarIds[0];
          if (settingsByCar[firstCarId]) {
            setCurrentSettings({
              ...settingsByCar[firstCarId],
              specialEventPricing: [] // This would need to be fetched separately if implemented
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch calendar settings:', error);
      }
    };

    fetchSettings();
  }, [selectedCarIds]);

  const handleSettingsSave = async (settings: CalendarSettings) => {
    if (selectedCarIds.length === 0) {
      throw new Error('No cars selected');
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No authentication session found');
      }

      const response = await fetch('/api/host/calendar/settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          carIds: selectedCarIds,
          settings
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setCurrentSettings(settings);
      onSettingsSave?.(settings);
      console.log('Settings saved successfully for', selectedCarIds.length, 'cars');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  // Handle vehicle selection change
  const handleVehicleSelectionChange = (newSelectedIds: string[]) => {
    onVehicleChange(newSelectedIds);
    setShowVehicleModal(false);
  };

  const selectedVehicles = vehicles.filter(v => selectedCarIds.includes(v.id));

  return (
    <>
      <div className="calendar-header flex-shrink-0 px-4 py-3 border-b border-gray-800/50 bg-[#121212]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
                              <button
                 onClick={() => setShowVehicleModal(true)}
                 className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all duration-200"
              >
                <div className="flex -space-x-2">
                  {selectedVehicles.slice(0, 3).map((vehicle) => (
                                          <DynamicCarAvatar
                       key={vehicle.id}
                       selectedCarIds={[vehicle.id]}
                       allCars={vehicles}
                       size="sm"
                     />
                  ))}
                  {selectedVehicles.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-gray-600 flex items-center justify-center text-xs text-gray-300 ml-1">
                      +{selectedVehicles.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-gray-300 text-sm font-medium">
                  {selectedVehicles.length} {selectedVehicles.length === 1 ? 'Car' : 'Cars'}
                </span>
              </button>
            </div>
            
            {selectedDatesCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1 bg-[#FF4646]/20 border border-[#FF4646]/30 rounded-full text-[#FF4646] text-xs font-medium"
              >
                {selectedDatesCount} {selectedDatesCount === 1 ? 'date' : 'dates'} selected
              </motion.div>
            )}
          </div>

                      <button
             onClick={() => setShowSettingsSheet(true)}
             disabled={selectedCarIds.length === 0}
             className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Settings size={18} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Vehicle Selection Modal */}
      <VehicleSelectionSheet
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        vehicles={vehicles}
        selectedCarIds={selectedCarIds}
        onVehicleChange={handleVehicleSelectionChange}
      />

      {/* Settings Sheet */}
      <CalendarSettingsSheet
        isOpen={showSettingsSheet}
        onClose={() => setShowSettingsSheet(false)}
        currentSettings={currentSettings}
        onSave={handleSettingsSave}
      />
    </>
  );
} 