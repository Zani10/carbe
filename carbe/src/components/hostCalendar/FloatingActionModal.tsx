import React, { useState } from 'react';
import { X, Calendar, Euro, Check } from 'lucide-react';
import { BulkOperation } from '@/types/calendar';

interface FloatingActionModalProps {
  isOpen: boolean;
  selectedDatesCount: number;
  selectedDates: string[];
  selectedCarIds: string[];
  onClose: () => void;
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  defaultTab?: 'availability' | 'pricing';
}

export default function FloatingActionModal({
  isOpen,
  selectedDatesCount,
  selectedDates,
  selectedCarIds,
  onClose,
  onBulkOperation,
  defaultTab = 'availability'
}: FloatingActionModalProps) {
  const [activeTab, setActiveTab] = useState<'availability' | 'pricing'>(defaultTab);
  const [availabilityAction, setAvailabilityAction] = useState<'available' | 'blocked'>('blocked');
  const [pricingValue, setPricingValue] = useState('');
  const [isWeekendOverride, setIsWeekendOverride] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleAvailabilitySubmit = async () => {
    if (selectedDates.length === 0) return;
    
    setIsLoading(true);
    try {
      await onBulkOperation({
        type: 'availability',
        dates: selectedDates,
        carIds: selectedCarIds,
        value: availabilityAction
      });
      onClose();
    } catch (error) {
      console.error('Availability operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePricingSubmit = async () => {
    if (selectedDates.length === 0 || !pricingValue) return;
    
    const price = parseFloat(pricingValue);
    if (isNaN(price) || price <= 0) return;
    
    setIsLoading(true);
    try {
      await onBulkOperation({
        type: 'pricing',
        dates: selectedDates,
        carIds: selectedCarIds,
        value: price,
        isWeekendOverride
      });
      onClose();
    } catch (error) {
      console.error('Pricing operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed bottom-0 left-0 right-0 z-50 mx-4 mb-20 max-w-md mx-auto">
        <div className="bg-[#212121] rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/30">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {selectedDatesCount} date{selectedDatesCount > 1 ? 's' : ''} selected
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {selectedCarIds.length} vehicle{selectedCarIds.length > 1 ? 's' : ''}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700/30">
            <button
              onClick={() => setActiveTab('availability')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'availability'
                  ? 'text-white border-b-2 border-[#FF4646] bg-gray-800/20'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 mx-auto mb-1" />
              Availability
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === 'pricing'
                  ? 'text-white border-b-2 border-[#FF4646] bg-gray-800/20'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <Euro className="w-4 h-4 mx-auto mb-1" />
              Pricing
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'availability' ? (
              <div className="space-y-4">
                <p className="text-gray-300 text-sm mb-4">
                  Set availability for selected dates
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => setAvailabilityAction('available')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                      availabilityAction === 'available'
                        ? 'border-[#00A680] bg-[#00A680]/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        availabilityAction === 'available' ? 'bg-[#00A680]' : 'border-2 border-gray-500'
                      }`}>
                        {availabilityAction === 'available' && (
                          <Check className="w-3 h-3 text-white ml-0.5" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium">Set as Available</div>
                        <div className="text-gray-400 text-sm">Open dates for booking</div>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setAvailabilityAction('blocked')}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-colors ${
                      availabilityAction === 'blocked'
                        ? 'border-[#FF4646] bg-[#FF4646]/10'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-3 ${
                        availabilityAction === 'blocked' ? 'bg-[#FF4646]' : 'border-2 border-gray-500'
                      }`}>
                        {availabilityAction === 'blocked' && (
                          <Check className="w-3 h-3 text-white ml-0.5" />
                        )}
                      </div>
                      <div className="text-left">
                        <div className="text-white font-medium">Block Dates</div>
                        <div className="text-gray-400 text-sm">Prevent bookings on these dates</div>
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={handleAvailabilitySubmit}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-semibold transition-colors ${
                    isLoading
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : availabilityAction === 'available'
                      ? 'bg-[#00A680] text-white hover:bg-[#00A680]/90'
                      : 'bg-[#FF4646] text-white hover:bg-[#FF4646]/90'
                  }`}
                >
                  {isLoading ? 'Updating...' : `Update ${selectedDatesCount} Date${selectedDatesCount > 1 ? 's' : ''}`}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300 text-sm mb-4">
                  Set custom pricing for selected dates
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      Price per night (€)
                    </label>
                    <input
                      type="number"
                      value={pricingValue}
                      onChange={(e) => setPricingValue(e.target.value)}
                      placeholder="Enter price"
                      min="1"
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#FF4646] transition-colors"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="weekendOverride"
                      checked={isWeekendOverride}
                      onChange={(e) => setIsWeekendOverride(e.target.checked)}
                      className="w-4 h-4 text-[#FF4646] bg-gray-800 border-gray-600 rounded focus:ring-[#FF4646] focus:ring-2"
                    />
                    <label htmlFor="weekendOverride" className="ml-3 text-gray-300 text-sm">
                      Apply to weekend pricing
                    </label>
                  </div>
                </div>

                <button
                  onClick={handlePricingSubmit}
                  disabled={isLoading || !pricingValue || parseFloat(pricingValue) <= 0}
                  className={`w-full py-4 rounded-xl font-semibold transition-colors ${
                    isLoading || !pricingValue || parseFloat(pricingValue) <= 0
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF4646] text-white hover:bg-[#FF4646]/90'
                  }`}
                >
                  {isLoading ? 'Updating...' : `Set Price for ${selectedDatesCount} Date${selectedDatesCount > 1 ? 's' : ''}`}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 