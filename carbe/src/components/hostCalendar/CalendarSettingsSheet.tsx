import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, DollarSign, Users, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

interface CalendarSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: CalendarSettings;
  onSave: (settings: CalendarSettings) => void;
}

export default function CalendarSettingsSheet({
  isOpen,
  onClose,
  currentSettings,
  onSave
}: CalendarSettingsSheetProps) {
  const [settings, setSettings] = useState<CalendarSettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addSpecialEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      name: '',
      startDate: '',
      endDate: '',
      pricePerDay: settings.basePricePerDay
    };
    setSettings({
      ...settings,
      specialEventPricing: [...settings.specialEventPricing, newEvent]
    });
  };

  const updateSpecialEvent = (id: string, field: string, value: string | number) => {
    setSettings({
      ...settings,
      specialEventPricing: settings.specialEventPricing.map(event =>
        event.id === id ? { ...event, [field]: value } : event
      )
    });
  };

  const removeSpecialEvent = (id: string) => {
    setSettings({
      ...settings,
      specialEventPricing: settings.specialEventPricing.filter(event => event.id !== id)
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900 rounded-t-3xl z-50 max-h-[85vh] overflow-hidden"
          >
            {/* Handle Bar */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Calendar Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(85vh-120px)]">
              
              {/* Base Price */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign className="w-4 h-4" />
                  Base Price per Day (€)
                </label>
                <input
                  type="number"
                  value={settings.basePricePerDay}
                  onChange={(e) => setSettings({
                    ...settings,
                    basePricePerDay: parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 65"
                />
              </div>

              {/* Minimum Stay */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Calendar className="w-4 h-4" />
                  Minimum Stay Requirement (days)
                </label>
                <input
                  type="number"
                  value={settings.minimumStayRequirement}
                  onChange={(e) => setSettings({
                    ...settings,
                    minimumStayRequirement: parseInt(e.target.value) || 1
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 2"
                  min="1"
                />
              </div>

              {/* Weekend Price Adjustment */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign className="w-4 h-4" />
                  Weekend Price Adjustment
                </label>
                <div className="flex gap-3">
                  <select
                    value={settings.weekendPriceAdjustment.type}
                    onChange={(e) => setSettings({
                      ...settings,
                      weekendPriceAdjustment: {
                        ...settings.weekendPriceAdjustment,
                        type: e.target.value as 'percentage' | 'fixed'
                      }
                    })}
                    className="px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="percentage">% Increase</option>
                    <option value="fixed">€ Fixed Amount</option>
                  </select>
                  <input
                    type="number"
                    value={settings.weekendPriceAdjustment.value}
                    onChange={(e) => setSettings({
                      ...settings,
                      weekendPriceAdjustment: {
                        ...settings.weekendPriceAdjustment,
                        value: parseFloat(e.target.value) || 0
                      }
                    })}
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    placeholder={settings.weekendPriceAdjustment.type === 'percentage' ? "e.g., 20" : "e.g., 15"}
                  />
                </div>
              </div>

              {/* Check-in/Check-out Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4" />
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={settings.defaultCheckInTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      defaultCheckInTime: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4" />
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={settings.defaultCheckOutTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      defaultCheckOutTime: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Booking Lead Time */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <Users className="w-4 h-4" />
                  Booking Lead Time (days in advance)
                </label>
                <input
                  type="number"
                  value={settings.bookingLeadTime}
                  onChange={(e) => setSettings({
                    ...settings,
                    bookingLeadTime: parseInt(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g., 1"
                  min="0"
                />
              </div>

              {/* Special Event Pricing */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4" />
                    Special Event Pricing
                  </label>
                  <button
                    onClick={addSpecialEvent}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add Event
                  </button>
                </div>
                
                {settings.specialEventPricing.map((event) => (
                  <div key={event.id} className="p-4 bg-gray-800 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={event.name}
                        onChange={(e) => updateSpecialEvent(event.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Event name"
                      />
                      <button
                        onClick={() => removeSpecialEvent(event.id)}
                        className="ml-2 p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="date"
                        value={event.startDate}
                        onChange={(e) => updateSpecialEvent(event.id, 'startDate', e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="date"
                        value={event.endDate}
                        onChange={(e) => updateSpecialEvent(event.id, 'endDate', e.target.value)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <input
                        type="number"
                        value={event.pricePerDay}
                        onChange={(e) => updateSpecialEvent(event.id, 'pricePerDay', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500"
                        placeholder="€/day"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 