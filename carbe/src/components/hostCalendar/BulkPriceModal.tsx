import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { X, Calendar, Euro } from 'lucide-react';
import { BulkOperation } from '@/types/calendar';

interface BulkPriceModalProps {
  selectedDates: string[];
  selectedCarIds: string[];
  basePrice: number;
  onConfirm: (operation: BulkOperation) => void;
  onClose: () => void;
}

export default function BulkPriceModal({
  selectedDates,
  selectedCarIds,
  basePrice,
  onConfirm,
  onClose
}: BulkPriceModalProps) {
  const [priceMode, setPriceMode] = useState<'fixed' | 'markup'>('fixed');
  const [fixedPrice, setFixedPrice] = useState(basePrice);
  const [markupPercentage, setMarkupPercentage] = useState(20);
  const [isWeekendOverride, setIsWeekendOverride] = useState(false);

  const sortedDates = [...selectedDates].sort();
  const dateRangeText = formatDateRange(sortedDates);

  function formatDateRange(dates: string[]): string {
    if (dates.length === 0) return '';
    if (dates.length === 1) return format(parseISO(dates[0]), 'MMM d');
    
    // Group consecutive dates
    const ranges: string[] = [];
    let start = 0;
    
    for (let i = 1; i <= dates.length; i++) {
      if (i === dates.length || 
          new Date(dates[i]).getTime() - new Date(dates[i-1]).getTime() > 24 * 60 * 60 * 1000) {
        // End of consecutive range
        if (start === i - 1) {
          ranges.push(format(parseISO(dates[start]), 'MMM d'));
        } else {
          ranges.push(`${format(parseISO(dates[start]), 'MMM d')}–${format(parseISO(dates[i-1]), 'MMM d')}`);
        }
        start = i;
      }
    }
    
    return ranges.join(', ');
  }

  const getCalculatedPrice = () => {
    if (priceMode === 'fixed') {
      return fixedPrice;
    } else {
      return Math.round(basePrice * (1 + markupPercentage / 100));
    }
  };

  const getTotalRevenue = () => {
    return getCalculatedPrice() * selectedDates.length * selectedCarIds.length;
  };

  const handleConfirm = () => {
    const bulkOperation: BulkOperation = {
      type: 'pricing',
      dates: selectedDates,
      carIds: selectedCarIds,
      value: getCalculatedPrice(),
      isWeekendOverride
    };
    
    onConfirm(bulkOperation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#212121] rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Set Pricing</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Selected Dates */}
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-400">Selected dates</span>
            </div>
            <p className="text-white font-medium">{dateRangeText}</p>
            <p className="text-xs text-gray-500 mt-1">
              {selectedDates.length} date{selectedDates.length > 1 ? 's' : ''} • {selectedCarIds.length} vehicle{selectedCarIds.length > 1 ? 's' : ''}
            </p>
          </div>

          {/* Price Mode Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Pricing method
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="fixed"
                  checked={priceMode === 'fixed'}
                  onChange={(e) => setPriceMode(e.target.value as 'fixed')}
                  className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2"
                />
                <span className="ml-3 text-white">Set fixed price</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="markup"
                  checked={priceMode === 'markup'}
                  onChange={(e) => setPriceMode(e.target.value as 'markup')}
                  className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2"
                />
                <span className="ml-3 text-white">Apply markup to base price</span>
              </label>
            </div>
          </div>

          {/* Price Input */}
          <div className="mb-6">
            {priceMode === 'fixed' ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per night
                </label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={fixedPrice}
                    onChange={(e) => setFixedPrice(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                    placeholder="85"
                    min="1"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Markup percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(Number(e.target.value))}
                    className="w-full pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF2800] focus:border-transparent"
                    placeholder="20"
                    min="0"
                    max="200"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Base price: €{basePrice} → Final price: €{getCalculatedPrice()}
                </p>
              </div>
            )}
          </div>

          {/* Weekend Override */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isWeekendOverride}
                onChange={(e) => setIsWeekendOverride(e.target.checked)}
                className="text-[#FF2800] bg-gray-700 border-gray-600 focus:ring-[#FF2800] focus:ring-2 rounded"
              />
              <span className="ml-3 text-white">
                Apply as weekend pricing
              </span>
            </label>
          </div>

          {/* Revenue Preview */}
          <div className="bg-gray-800 rounded-lg p-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">Total potential revenue:</span>
              <span className="text-white font-semibold">€{getTotalRevenue().toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              €{getCalculatedPrice()} × {selectedDates.length} dates × {selectedCarIds.length} vehicle{selectedCarIds.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-[#FF2800] text-white rounded-lg hover:bg-[#FF2800]/90 transition-colors"
          >
            Set Price
          </button>
        </div>
      </div>
    </div>
  );
} 