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
  const [currentSettings, setCurrentSettings] = useState<CalendarSettings>({
    basePricePerDay: vehicles[0]?.base_price || 65,
    minimumStayRequirement: 1,
    weekendPriceAdjustment: { type: 'percentage', value: 20 },
    specialEventPricing: [],
    defaultCheckInTime: '15:00',
    defaultCheckOutTime: '11:00',
    bookingLeadTime: 1
  });

  // Fetch settings when component mounts
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const response = await fetch('/api/host/calendar/settings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const settings = await response.json();
          setCurrentSettings(settings);
        }
      } catch (error) {
        console.error('Failed to fetch calendar settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const handleSettingsSave = async (settings: CalendarSettings) => {
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
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      setCurrentSettings(settings);
      onSettingsSave?.(settings);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
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

      {/* Vehicle Selection Sheet */}
      <VehicleSelectionSheet
        isOpen={showVehicleModal}
        onClose={() => setShowVehicleModal(false)}
        vehicles={vehicles}
        selectedCarIds={selectedCarIds}
        onVehicleChange={onVehicleChange}
      />

             {/* Calendar Settings Sheet */}
       <CalendarSettingsSheet
         isOpen={showSettingsSheet}
         onClose={() => setShowSettingsSheet(false)}
         currentSettings={currentSettings}
         onSave={handleSettingsSave}
       />
    </>
  );
} 