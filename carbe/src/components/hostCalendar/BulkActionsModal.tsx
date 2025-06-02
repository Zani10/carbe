import React, { useState } from 'react';
import { formatDisplayDate } from '@/lib/calendar/dateUtils';
import { X, Calendar, Euro, Lock, Unlock, Save } from 'lucide-react';

interface BulkActionsModalProps {
  selectedDates: Date[];
  selectedCarId: string;
  basePrice: number;
  onAvailabilityUpdate: (dates: string[], status: 'available' | 'blocked', carId: string) => void;
  onPricingUpdate: (dates: string[], price: number, carId: string) => void;
  onClose: () => void;
}

export default function BulkActionsModal({
  selectedDates,
  selectedCarId,
  basePrice,
  onAvailabilityUpdate,
  onPricingUpdate,
  onClose
}: BulkActionsModalProps) {
  const [activeTab, setActiveTab] = useState<'availability' | 'pricing'>('availability');
  const [bulkPrice, setBulkPrice] = useState(basePrice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedDateStrings = selectedDates.map(date => date.toISOString().split('T')[0]);

  const handleAvailabilityUpdate = async (status: 'available' | 'blocked') => {
    setIsSubmitting(true);
    try {
      await onAvailabilityUpdate(selectedDateStrings, status, selectedCarId);
      onClose();
    } catch (error) {
      console.error('Failed to update availability:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePricingUpdate = async () => {
    setIsSubmitting(true);
    try {
      await onPricingUpdate(selectedDateStrings, bulkPrice, selectedCarId);
      onClose();
    } catch (error) {
      console.error('Failed to update pricing:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pricePresets = [
    { label: '-20%', value: Math.round(basePrice * 0.8) },
    { label: '-10%', value: Math.round(basePrice * 0.9) },
    { label: 'Base', value: basePrice },
    { label: '+10%', value: Math.round(basePrice * 1.1) },
    { label: '+20%', value: Math.round(basePrice * 1.2) },
    { label: '+50%', value: Math.round(basePrice * 1.5) }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] border border-gray-700/50 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-gray-400 mr-3" />
            <div>
              <h3 className="text-white font-semibold">Bulk Actions</h3>
              <p className="text-gray-400 text-sm">{selectedDates.length} dates selected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Selected Dates Preview */}
        <div className="p-4 border-b border-gray-700/50">
          <h4 className="text-white font-medium mb-2">Selected Dates</h4>
          <div className="max-h-24 overflow-y-auto">
            <div className="grid grid-cols-2 gap-1 text-sm">
              {selectedDates.slice(0, 8).map((date, index) => (
                <div key={index} className="text-gray-300">
                  {formatDisplayDate(date).split(', ')[1]} {/* Show just "Month Day" */}
                </div>
              ))}
              {selectedDates.length > 8 && (
                <div className="text-gray-400 col-span-2">
                  ...and {selectedDates.length - 8} more
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700/50">
          <div className="flex">
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'availability'
                  ? 'border-[#FF2800] text-[#FF2800]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Availability
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'pricing'
                  ? 'border-[#FF2800] text-[#FF2800]'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Pricing
            </button>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'availability' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-3">Update Availability</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Choose whether to block or unblock the selected dates
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAvailabilityUpdate('blocked')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Block Dates
                </button>
                
                <button
                  onClick={() => handleAvailabilityUpdate('available')}
                  disabled={isSubmitting}
                  className="flex items-center justify-center px-4 py-3 bg-[#00A680] text-white rounded-lg hover:bg-[#00A680]/90 transition-colors disabled:opacity-50"
                >
                  <Unlock className="h-4 w-4 mr-2" />
                  Unblock Dates
                </button>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-medium mb-3">Set Bulk Pricing</h4>
                <p className="text-gray-400 text-sm mb-4">
                  Apply the same price to all selected dates
                </p>
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-white font-medium mb-2">Price per Day</label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(Number(e.target.value))}
                    className="w-full bg-[#1F1F1F] border border-gray-600 text-white rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                    min="1"
                    step="1"
                  />
                </div>
              </div>

              {/* Price Presets */}
              <div>
                <label className="block text-white font-medium mb-3">Quick Adjustments</label>
                <div className="grid grid-cols-3 gap-2">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setBulkPrice(preset.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        bulkPrice === preset.value
                          ? 'bg-[#FF2800] text-white'
                          : 'bg-[#1A1A1A] border border-gray-600 text-gray-300 hover:bg-[#252525] hover:text-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-[#1A1A1A] border border-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Total Revenue (Est.)</span>
                  <span className="text-white font-medium">
                    €{(bulkPrice * selectedDates.length).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Avg. per Day</span>
                  <span className="text-white font-medium">€{bulkPrice}</span>
                </div>
              </div>

              <button
                onClick={handlePricingUpdate}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-4 py-3 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Updating...' : 'Apply Pricing'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-transparent border border-gray-600 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 