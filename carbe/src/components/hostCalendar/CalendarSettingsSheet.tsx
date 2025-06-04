import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, DollarSign, Users, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

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
  const [dragY, setDragY] = useState(0);

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

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.y > 150 || info.velocity.y > 300) {
      onClose();
    }
    setDragY(0);
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
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.1}
            onDrag={(event, info) => setDragY(info.offset.y)}
            onDragEnd={handleDragEnd}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ y: dragY }}
          >
            <div className="bg-[#212121] rounded-t-[28px] shadow-2xl border border-gray-700/50 overflow-hidden max-w-md mx-auto">
            {/* Handle Bar */}
            <div className="flex justify-center pt-2">
              <div className="w-10 h-1 bg-gray-400 rounded-full opacity-50" />
            </div>

                {/* Header */}
              <div className="px-4 pt-4 pb-2 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center">
                      <SettingsIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">Calendar Settings</h2>
                      <p className="text-sm text-gray-400">Configure your rental settings</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-800/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              
              {/* Base Price */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign className="w-4 h-4" />
                  Base Price per Day (€)
                </label>
                <input
                  type="number"
                  value={settings.basePricePerDay || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    basePricePerDay: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                  })}
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
                  placeholder="e.g., 65"
                  min="0"
                  step="0.01"
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
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
                  placeholder="e.g., 2"
                  min="1"
                />
              </div>

              {/* Weekend Price Adjustment */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <DollarSign className="w-4 h-4" />
                  Weekend Price Adjustment
                </label>
                <div className="flex gap-2">
                  <select
                    value={settings.weekendPriceAdjustment.type}
                    onChange={(e) => setSettings({
                      ...settings,
                      weekendPriceAdjustment: {
                        ...settings.weekendPriceAdjustment,
                        type: e.target.value as 'percentage' | 'fixed'
                      }
                    })}
                    className="w-24 px-2 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white text-xs focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">€</option>
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
                    className="flex-1 px-3 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
                    placeholder={settings.weekendPriceAdjustment.type === 'percentage' ? "20" : "15"}
                  />
                </div>
              </div>

              {/* Check-in/Check-out Times */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4 text-gray-300" />
                    Check-in Time
                  </label>
                  <input
                    type="time"
                    value={settings.defaultCheckInTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      defaultCheckInTime: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                    <Clock className="w-4 h-4 text-gray-300" />
                    Check-out Time
                  </label>
                  <input
                    type="time"
                    value={settings.defaultCheckOutTime}
                    onChange={(e) => setSettings({
                      ...settings,
                      defaultCheckOutTime: e.target.value
                    })}
                    className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent [color-scheme:dark]"
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
                  className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-700/50 rounded-xl text-white focus:ring-2 focus:ring-[#FF4646]/50 focus:border-transparent"
                  placeholder="e.g., 1"
                  min="0"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700/50">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-[#FF4646] hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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